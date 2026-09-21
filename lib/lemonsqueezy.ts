// Thin wrapper around the Lemon Squeezy REST API (server-only — uses
// LEMONSQUEEZY_API_KEY, never imported from a "use client" file).

const LEMONSQUEEZY_API_BASE = "https://api.lemonsqueezy.com/v1";

export type BillingPlan = "monthly" | "yearly";

function variantIdForPlan(plan: BillingPlan): string {
  const variantId =
    plan === "monthly"
      ? process.env.LEMONSQUEEZY_VARIANT_ID_MONTHLY
      : process.env.LEMONSQUEEZY_VARIANT_ID_YEARLY;
  if (!variantId) {
    throw new Error(`Missing Lemon Squeezy variant id env var for the "${plan}" plan.`);
  }
  return variantId;
}

interface CreateCheckoutParams {
  plan: BillingPlan;
  userId: string;
  email: string;
  redirectUrl: string;
}

// Creates a Lemon Squeezy hosted checkout and returns its URL. `userId` is
// sent as checkout custom data, which Lemon Squeezy echoes back as
// `meta.custom_data` on every webhook for the resulting subscription — see
// app/api/webhooks/lemonsqueezy/route.ts, which reads it to know which
// Supabase user to update. This is the only link between a Lemon Squeezy
// purchase and a Supabase account; there is no Lemon Squeezy customer
// lookup by email fallback on the checkout side.
export async function createCheckout({
  plan,
  userId,
  email,
  redirectUrl,
}: CreateCheckoutParams): Promise<string> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!apiKey || !storeId) {
    throw new Error("Lemon Squeezy is not configured.");
  }

  const variantId = variantIdForPlan(plan);

  const response = await fetch(`${LEMONSQUEEZY_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email,
            custom: { user_id: userId },
          },
          checkout_options: {
            embed: false,
            dark: true,
          },
          product_options: {
            redirect_url: redirectUrl,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("LEMONSQUEEZY CHECKOUT ERROR:", response.status, errorBody);
    throw new Error("Could not start checkout.");
  }

  const json = (await response.json()) as {
    data?: { attributes?: { url?: string } };
  };
  const url = json.data?.attributes?.url;
  if (!url) {
    console.error("LEMONSQUEEZY CHECKOUT ERROR: no url in response", json);
    throw new Error("Could not start checkout.");
  }
  return url;
}

// Lemon Squeezy's per-subscription "customer portal" link (switch plan,
// update payment method, view invoices, cancel/resume) is a signed URL that
// expires 24 hours after it's requested, not a static one — so it's fetched
// live from the Subscriptions API each time the user clicks "Manage
// subscription", rather than stored. (`urls.customer_portal_update_subscription`
// is deliberately not used: Lemon Squeezy only returns it for PayPal
// subscriptions.)
//
// Returns null on any failure — missing API key, unknown subscription, a
// non-2xx from Lemon Squeezy, a network error, or a response with no portal
// URL — and logs which one, since from the caller's side they all look
// identical and are otherwise undebuggable. app/api/billing/portal/route.ts
// turns null into a visible message on Settings.
export async function getCustomerPortalUrl(
  subscriptionId: string
): Promise<string | null> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    console.error("LEMONSQUEEZY PORTAL ERROR: LEMONSQUEEZY_API_KEY is not set.");
    return null;
  }

  try {
    const response = await fetch(
      `${LEMONSQUEEZY_API_BASE}/subscriptions/${encodeURIComponent(subscriptionId)}`,
      {
        headers: {
          Accept: "application/vnd.api+json",
          Authorization: `Bearer ${apiKey}`,
        },
        // Never cache a signed, time-limited URL.
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(
        "LEMONSQUEEZY PORTAL ERROR:",
        response.status,
        "subscription",
        subscriptionId,
        errorBody
      );
      return null;
    }

    const json = (await response.json()) as {
      data?: { attributes?: { urls?: { customer_portal?: string } } };
    };
    const url = json.data?.attributes?.urls?.customer_portal;
    if (!url) {
      console.error(
        "LEMONSQUEEZY PORTAL ERROR: no customer_portal url for subscription",
        subscriptionId
      );
      return null;
    }
    return url;
  } catch (err) {
    console.error("LEMONSQUEEZY PORTAL ERROR:", err);
    return null;
  }
}

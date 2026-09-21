import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCustomerPortalUrl } from "@/lib/lemonsqueezy";
import { appUrl } from "@/lib/app-url";

export const runtime = "nodejs";

// Where a failed portal open lands the user. Settings reads the flag and
// shows an inline message next to the button (see SubscriptionCard), so a
// failure is visible instead of the page just reloading with no explanation.
const PORTAL_UNAVAILABLE_PATH = "/dashboard/settings?billing=unavailable";

// Redirects a signed-in user with a Lemon Squeezy subscription to their
// (signed, 24-hour) customer portal link, where they can switch between
// monthly and yearly, update their card, or cancel/resume — Lemon Squeezy
// handles all of it and reports back through the subscription_* webhooks
// (see app/api/webhooks/lemonsqueezy/route.ts). Hit directly by the "Manage
// subscription" link in Settings rather than fetched client-side, so the
// link works as a plain <a href> with no loading state.
//
// The subscription id is read from the caller's own users row, never from
// the request, so one user can't open another's portal. Deliberately not
// gated on isPro(): a lapsed or past-due user still has a subscription
// worth managing.
export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", appUrl()));
  }

  const { data: profile } = await supabase
    .from("users")
    .select("lemonsqueezy_subscription_id")
    .eq("id", user.id)
    .maybeSingle();

  const subscriptionId = profile?.lemonsqueezy_subscription_id;
  if (!subscriptionId) {
    return NextResponse.redirect(new URL(PORTAL_UNAVAILABLE_PATH, appUrl()));
  }

  const portalUrl = await getCustomerPortalUrl(subscriptionId);
  if (!portalUrl) {
    return NextResponse.redirect(new URL(PORTAL_UNAVAILABLE_PATH, appUrl()));
  }

  return NextResponse.redirect(portalUrl);
}

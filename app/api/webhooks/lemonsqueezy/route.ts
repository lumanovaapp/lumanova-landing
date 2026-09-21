import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";
import { derivePlan } from "@/lib/subscription";

export const runtime = "nodejs";

interface LemonSqueezyWebhookBody {
  meta?: {
    event_name?: string;
    custom_data?: Record<string, unknown>;
  };
  data?: {
    id?: string;
    type?: string;
    attributes?: Record<string, unknown>;
  };
}

function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const digestBuffer = Buffer.from(digest, "utf8");
  const signatureBuffer = Buffer.from(signatureHeader, "utf8");
  if (digestBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("LEMONSQUEEZY WEBHOOK ERROR: LEMONSQUEEZY_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Signature is computed over the exact raw bytes Lemon Squeezy sent —
  // must read as text before any JSON parsing touches the body.
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifySignature(rawBody, signature, secret)) {
    console.error("LEMONSQUEEZY WEBHOOK ERROR: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: LemonSqueezyWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // The billing columns are locked by the protect_billing_columns trigger
  // (supabase/schema.sql) against the anon/authenticated roles, so this route
  // must run as the service role. createAdminClient() non-null-asserts the
  // key, so a missing one would surface later as an opaque auth/update
  // error — fail loudly and specifically here instead.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "LEMONSQUEEZY WEBHOOK ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in this environment."
    );
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  const admin = createAdminClient();

  // Idempotency: Lemon Squeezy doesn't send a unique event id, so dedupe on
  // a hash of the raw delivery instead. Lemon Squeezy retries on any
  // non-2xx response (and can just double-send), so every code path below
  // this insert must still return 2xx — a duplicate delivery is not an
  // error, it's already handled.
  const eventHash = crypto.createHash("sha256").update(rawBody).digest("hex");
  const { error: insertEventError } = await admin
    .from("lemonsqueezy_webhook_events")
    .insert({ id: eventHash, event_name: body.meta?.event_name ?? null });

  if (insertEventError) {
    if (insertEventError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("LEMONSQUEEZY WEBHOOK ERROR: could not record event:", insertEventError);
    return NextResponse.json({ error: "Could not record event" }, { status: 500 });
  }

  const eventName = body.meta?.event_name;
  if (!eventName || !eventName.startsWith("subscription_")) {
    // order_created and any other non-subscription event — nothing to sync.
    return NextResponse.json({ received: true, ignored: true });
  }

  // Only the subscription resource itself drives plan state. The payment
  // events (subscription_payment_success / _failed / _recovered / _refunded)
  // carry a "subscription-invoices" payload: its `status` is an INVOICE
  // status ("paid", "open", "void", "refunded"), its `id` is the INVOICE id
  // (the subscription's id is `attributes.subscription_id`), and it has no
  // renews_at/ends_at. Treating that as a subscription wrote status="paid",
  // a null period end and plan="free", and overwrote the stored
  // subscription id with an invoice id. Key off the resource type, not off
  // "has a status string". Lemon Squeezy sends a paired subscription_updated
  // (fresh renews_at) alongside each successful renewal, so skipping the
  // invoice events loses nothing.
  if (body.data?.type !== "subscriptions") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const attrs = body.data.attributes;
  const status = attrs ? asString(attrs.status) : null;
  const subscriptionId = body.data.id;

  if (!attrs || !status || !subscriptionId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const renewsAt = asString(attrs.renews_at);
  const endsAt = asString(attrs.ends_at);
  const periodEnd = endsAt ?? renewsAt;
  const plan = derivePlan(status, periodEnd);

  if (plan === null) {
    // Not one of Lemon Squeezy's subscription statuses. Never guess "free"
    // for something we don't understand — leave the user's row untouched.
    console.error(
      "LEMONSQUEEZY WEBHOOK ERROR: unrecognised subscription status",
      JSON.stringify(status),
      "event",
      eventName,
      "subscription",
      subscriptionId
    );
    return NextResponse.json({ received: true, ignored: true });
  }

  const customerId = attrs.customer_id != null ? String(attrs.customer_id) : null;
  // Lemon Squeezy's own last-modified time for this subscription — the
  // ordering key for the stale-event guard below.
  const eventAt = asString(attrs.updated_at);

  let userId = asString(body.meta?.custom_data?.user_id ?? null);

  if (!userId) {
    // Fallback for the rare event where Lemon Squeezy doesn't echo
    // custom_data back — match by the subscription id we stored from this
    // subscription's own subscription_created event instead.
    const { data: matchedUser } = await admin
      .from("users")
      .select("id")
      .eq("lemonsqueezy_subscription_id", subscriptionId)
      .maybeSingle();
    userId = matchedUser?.id ?? null;
  }

  if (!userId) {
    console.error(
      "LEMONSQUEEZY WEBHOOK ERROR: no matching user for event",
      eventName,
      "subscription",
      subscriptionId
    );
    // Acknowledge anyway — retrying won't produce a match either, and Lemon
    // Squeezy would otherwise keep redelivering this indefinitely.
    return NextResponse.json({ received: true, unmatched: true });
  }

  // Out-of-order guard, part 1: a different (older) subscription must not
  // downgrade a user whose current subscription is live. Happens when someone
  // cancels, resubscribes, and the old subscription's `expired` arrives late.
  if (plan === "free") {
    const { data: current } = await admin
      .from("users")
      .select("plan, lemonsqueezy_subscription_id")
      .eq("id", userId)
      .maybeSingle();
    if (
      current?.plan === "pro" &&
      current.lemonsqueezy_subscription_id &&
      current.lemonsqueezy_subscription_id !== subscriptionId
    ) {
      return NextResponse.json({ received: true, ignored: true, stale: true });
    }
  }

  // Out-of-order guard, part 2: only apply this event if it is at least as
  // new as the last one applied. Done inside the UPDATE's WHERE clause so
  // two concurrent deliveries can't both pass a read-then-write check.
  // `lte` (not `lt`) keeps equal timestamps applying, so a resent/retried
  // event and events sharing an updated_at still go through.
  let query = admin
    .from("users")
    .update({
      plan,
      subscription_status: status,
      lemonsqueezy_customer_id: customerId,
      lemonsqueezy_subscription_id: subscriptionId,
      current_period_end: periodEnd,
      subscription_event_at: eventAt,
    })
    .eq("id", userId);

  if (eventAt) {
    query = query.or(`subscription_event_at.is.null,subscription_event_at.lte.${eventAt}`);
  }

  const { data: updatedRows, error: updateError } = await query.select("id");

  if (updateError) {
    // Log the real Postgres/PostgREST error — code, message, details, hint —
    // plus what we were trying to write. Typical codes: 42703/PGRST204
    // (column missing — schema.sql migration not applied), P0001 (the
    // protect_billing_columns trigger raised, i.e. not running as the
    // service role), 42501 (permission denied).
    console.error("LEMONSQUEEZY WEBHOOK ERROR: could not update user", {
      event: eventName,
      userId,
      subscriptionId,
      status,
      plan,
      periodEnd,
      eventAt,
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
    });
    // Release the dedupe claim so Lemon Squeezy's retry of this 500 is
    // processed instead of being swallowed as a "duplicate" above.
    await admin.from("lemonsqueezy_webhook_events").delete().eq("id", eventHash);
    return NextResponse.json({ error: "Could not update user" }, { status: 500 });
  }

  if (!updatedRows || updatedRows.length === 0) {
    // Zero rows updated: either custom_data.user_id points at no real user,
    // or a newer event was already applied. Tell them apart in the log.
    const { data: existing } = await admin
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existing) {
      console.error(
        "LEMONSQUEEZY WEBHOOK ERROR: user row not found for custom_data.user_id",
        { event: eventName, userId, subscriptionId }
      );
      // Retrying can't create the row, so acknowledge.
      return NextResponse.json({ received: true, unmatched: true });
    }

    console.log("LEMONSQUEEZY WEBHOOK: stale event ignored", {
      event: eventName,
      userId,
      subscriptionId,
      eventAt,
    });
    return NextResponse.json({ received: true, ignored: true, stale: true });
  }

  console.log("LEMONSQUEEZY WEBHOOK: applied", {
    event: eventName,
    userId,
    subscriptionId,
    status,
    plan,
    periodEnd,
  });
  return NextResponse.json({ received: true });
}

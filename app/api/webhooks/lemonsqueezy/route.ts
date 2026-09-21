import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";

// Subscription statuses that still carry paid access. `cancelled` /
// `past_due` / `paused` / `unpaid` are included here on purpose — Lemon
// Squeezy keeps `ends_at`/`renews_at` pointing at the end of the period the
// customer already paid for, so derivePlan() below still correctly flips
// them to "free" once that timestamp passes. Only `expired` (Lemon
// Squeezy's own terminal state) is unconditionally free.
const PRO_STATUSES = new Set([
  "active",
  "on_trial",
  "past_due",
  "cancelled",
  "paused",
  "unpaid",
]);

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

// Maps a raw Lemon Squeezy subscription status + its period-end timestamp
// to our `plan` column. This is the write-time mirror of
// lib/subscription.ts's isPro() (the read-time check) — kept as two
// separate small functions rather than one shared one because they run in
// different places (webhook vs. every gated request) for different
// reasons, but they must agree: a status that isPro() would treat as free
// must never be written as "pro" here, or the two would drift.
function derivePlan(status: string, periodEnd: string | null): "pro" | "free" {
  if (!PRO_STATUSES.has(status)) return "free";
  if (periodEnd && new Date(periodEnd).getTime() < Date.now()) return "free";
  return "pro";
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

  const attrs = body.data?.attributes;
  const status = attrs ? asString(attrs.status) : null;
  const subscriptionId = body.data?.id;

  // subscription_payment_success / _failed / _recovered carry a
  // "subscription-invoices" payload, not the subscription resource itself —
  // no active/cancelled/etc. status enum to key plan state off. Lemon
  // Squeezy always sends a paired subscription_updated event with the
  // subscription's fresh renews_at on a successful renewal, which is what
  // actually drives plan/status/current_period_end below — so an
  // invoice-shaped payload (detected generically by the missing `status`
  // string, rather than hardcoding which event names look like this) is
  // safe to acknowledge and skip.
  if (!status || !subscriptionId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const renewsAt = asString(attrs?.renews_at ?? null);
  const endsAt = asString(attrs?.ends_at ?? null);
  const periodEnd = endsAt ?? renewsAt;
  const plan = derivePlan(status, periodEnd);
  const customerId = attrs?.customer_id != null ? String(attrs.customer_id) : null;

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

  const { error: updateError } = await admin
    .from("users")
    .update({
      plan,
      subscription_status: status,
      lemonsqueezy_customer_id: customerId,
      lemonsqueezy_subscription_id: subscriptionId,
      current_period_end: periodEnd,
    })
    .eq("id", userId);

  if (updateError) {
    console.error("LEMONSQUEEZY WEBHOOK ERROR: could not update user:", updateError);
    // Release the dedupe claim so Lemon Squeezy's retry of this 500 is
    // processed instead of being swallowed as a "duplicate" above.
    await admin.from("lemonsqueezy_webhook_events").delete().eq("id", eventHash);
    return NextResponse.json({ error: "Could not update user" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

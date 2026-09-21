// Single source of truth for "does this user get Pro features right now."
// Every server-side gate (API routes AND pages) calls isPro() — never read
// `plan` off a users row directly, since it's just a cache of the last
// Lemon Squeezy webhook and can lag reality (a delayed/dropped webhook, a
// cancellation mid-period). current_period_end is the actual contractual
// cutoff Lemon Squeezy gives a cancelled/past-due subscription, so checking
// it here means access still expires correctly even if a webhook is ever
// missed — see derivePlan() below and app/api/webhooks/lemonsqueezy/route.ts
// for the write side.

export interface SubscriptionFields {
  plan: "free" | "pro";
  current_period_end: string | null;
}

export function isPro(
  user: SubscriptionFields | null | undefined
): boolean {
  if (!user || user.plan !== "pro") return false;
  if (
    user.current_period_end &&
    new Date(user.current_period_end).getTime() < Date.now()
  ) {
    return false;
  }
  return true;
}

// --- Write side: Lemon Squeezy subscription status -> our `plan` column ---
//
// Used only by app/api/webhooks/lemonsqueezy/route.ts. Lives here next to
// isPro() so the two rules stay in one file and can't drift.
//
// These are the seven values Lemon Squeezy's *subscription* resource can
// have. Anything else (e.g. "paid", which is an invoice/order status) is NOT
// a subscription status and must never be mapped to a plan — see
// derivePlan() returning null for it.
export type LemonSqueezySubscriptionStatus =
  | "on_trial"
  | "active"
  | "paused"
  | "past_due"
  | "unpaid"
  | "cancelled"
  | "expired";

// Paying (or trialing) right now: Pro regardless of any date. renews_at can
// legitimately sit a few minutes in the past while a renewal is processing.
const PRO_WHILE_LIVE = new Set<string>(["active", "on_trial"]);

// Not renewing / payment trouble, but the customer already paid through
// `ends_at`/`renews_at`: Pro until that date passes.
const PRO_UNTIL_PERIOD_END = new Set<string>(["cancelled", "past_due", "paused"]);

// "unpaid" (all payment retries failed) and "expired" (terminal) are free.

export function isKnownSubscriptionStatus(
  status: string
): status is LemonSqueezySubscriptionStatus {
  return (
    PRO_WHILE_LIVE.has(status) ||
    PRO_UNTIL_PERIOD_END.has(status) ||
    status === "unpaid" ||
    status === "expired"
  );
}

// Returns null for a status that isn't a Lemon Squeezy subscription status,
// so the caller can ignore the event instead of guessing. (Previously an
// unknown status silently meant "free", which is how an invoice payload with
// status "paid" downgraded a paying customer.)
export function derivePlan(
  status: string,
  periodEnd: string | null,
  now: number = Date.now()
): "pro" | "free" | null {
  if (!isKnownSubscriptionStatus(status)) return null;
  if (PRO_WHILE_LIVE.has(status)) return "pro";
  if (PRO_UNTIL_PERIOD_END.has(status)) {
    // Lemon Squeezy always sends a date for these; with none we can't say
    // how long access should last, so fail closed rather than grant forever.
    if (!periodEnd) return "free";
    const end = new Date(periodEnd).getTime();
    return Number.isNaN(end) || end < now ? "free" : "pro";
  }
  return "free";
}

// Shared copy for pricing surfaces (paywall card, upgrade page, settings).
export const PRO_MONTHLY_PRICE_LABEL = "$14.99/mo";
export const PRO_YEARLY_PRICE_LABEL = "$99/yr";
// (14.99 * 12 = 179.88) vs 99 -> ~45% cheaper than paying monthly for a year.
export const YEARLY_SAVINGS_LABEL = "Save 45%";

// Returned by gated API routes so the client can distinguish "you're not
// signed in" (401) from "you're signed in but need to upgrade" (402)
// without parsing message text.
export const REQUIRES_PRO_CODE = "requires_pro";

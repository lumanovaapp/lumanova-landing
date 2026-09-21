// Single source of truth for "does this user get Pro features right now."
// Every server-side gate (API routes AND pages) calls isPro() — never read
// `plan` off a users row directly, since it's just a cache of the last
// Lemon Squeezy webhook and can lag reality (a delayed/dropped webhook, a
// cancellation mid-period). current_period_end is the actual contractual
// cutoff Lemon Squeezy gives a cancelled/past-due subscription, so checking
// it here means access still expires correctly even if a webhook is ever
// missed — see app/api/webhooks/lemonsqueezy/route.ts for the write side.

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

// Shared copy for pricing surfaces (paywall card, upgrade page, settings).
export const PRO_MONTHLY_PRICE_LABEL = "$14.99/mo";
export const PRO_YEARLY_PRICE_LABEL = "$99/yr";
// (14.99 * 12 = 179.88) vs 99 -> ~45% cheaper than paying monthly for a year.
export const YEARLY_SAVINGS_LABEL = "Save 45%";

// Returned by gated API routes so the client can distinguish "you're not
// signed in" (401) from "you're signed in but need to upgrade" (402)
// without parsing message text.
export const REQUIRES_PRO_CODE = "requires_pro";

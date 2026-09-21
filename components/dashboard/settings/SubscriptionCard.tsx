"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CreditCard, Sparkles } from "lucide-react";
import ProBadge from "@/components/billing/ProBadge";
import {
  PRO_MONTHLY_PRICE_LABEL,
  PRO_YEARLY_PRICE_LABEL,
} from "@/lib/subscription";
import SettingsCard from "./SettingsCard";

interface SubscriptionCardProps {
  // Already resolved by isPro() on the server — this card never re-derives
  // Pro status from `plan` alone (see lib/subscription.ts for why that
  // column isn't trustworthy on its own).
  isPro: boolean;
  // Lemon Squeezy's raw status string, used only to word the date line
  // ("Renews" vs "Access until") — never to gate anything.
  subscriptionStatus?: string | null;
  currentPeriodEnd?: string | null;
  // False when there's no Lemon Squeezy subscription to open a portal for
  // (e.g. a plan granted manually), which would otherwise bounce the user
  // straight back here — see app/api/billing/portal/route.ts.
  hasSubscription?: boolean;
  // Set when /api/billing/portal couldn't produce a portal link and sent
  // the user back here with ?billing=unavailable.
  portalUnavailable?: boolean;
  delay?: number;
}

// Lemon Squeezy keeps a cancelled subscription active until the end of the
// period that's already been paid for, so the same date means two different
// things depending on status. Wording it wrong ("Renews" on a subscription
// that won't) is the kind of small lie that costs trust at exactly the
// wrong moment.
const ENDING_STATUSES = new Set(["cancelled", "expired", "unpaid", "paused"]);

function formatDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SubscriptionCard({
  isPro,
  subscriptionStatus,
  currentPeriodEnd,
  hasSubscription = false,
  portalUnavailable = false,
  delay = 0,
}: SubscriptionCardProps) {
  const renewalDate = currentPeriodEnd ? formatDate(currentPeriodEnd) : null;
  const ending = ENDING_STATUSES.has(subscriptionStatus ?? "");

  return (
    <SettingsCard delay={delay} variant={isPro ? "pro" : "default"}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isPro
              ? "bg-lumen-gold/15 border border-lumen-gold/30"
              : "bg-lumen-gold/10"
          }`}
        >
          {isPro ? (
            <Sparkles className="w-4 h-4 text-lumen-gold" />
          ) : (
            <CreditCard className="w-4 h-4 text-lumen-gold" />
          )}
        </div>
        <h3 className="font-manrope font-semibold text-cream-ivory">Your plan</h3>
      </div>

      <div className="ml-12">
        {isPro ? (
          <>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="font-manrope font-extrabold text-xl bg-gradient-to-r from-[#FBE08A] via-lumen-gold to-[#D9A518] bg-clip-text text-transparent">
                Lumanova Pro
              </p>
              <ProBadge variant="full" size="md" />
            </div>
            <p className="text-sm text-cream-ivory/55 mt-2">
              Your 90-day plan, AI coach, milestone comparisons and unlimited
              analyses are all unlocked.
            </p>
            {renewalDate && (
              <p className="text-xs text-cream-ivory/40 mt-2">
                {ending ? "Pro access until" : "Renews"} {renewalDate}
              </p>
            )}
            {hasSubscription && (
              <>
                <p className="text-sm text-cream-ivory/50 mt-5">
                  Switch between monthly and yearly, update your card, or
                  cancel — your Pro access continues to the end of the period
                  you&apos;ve paid for.
                </p>
                {/* Plain <a>, not next/link: this is a redirect to an
                    external, signed Lemon Squeezy URL, and a Link would try
                    to prefetch the route (minting a portal link nobody
                    opens). */}
                <a
                  href="/api/billing/portal"
                  className="focus-gold mt-3 h-11 px-5 rounded-full border border-lumen-gold/30 text-cream-ivory font-manrope font-medium text-sm inline-flex items-center gap-2 hover:bg-lumen-gold/10 hover:border-lumen-gold/60 transition-all duration-300 w-fit"
                >
                  <CreditCard className="w-4 h-4 text-lumen-gold" />
                  Manage subscription
                  <ArrowUpRight className="w-4 h-4 text-cream-ivory/50" />
                </a>
                {portalUnavailable && (
                  <p role="alert" className="text-xs text-warm-coral mt-3">
                    We couldn&apos;t open the billing portal just now. Please
                    try again in a moment.
                  </p>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <p className="font-manrope font-bold text-xl text-cream-ivory/80">
              Free
            </p>
            <p className="text-sm text-cream-ivory/55 mt-2">
              You get one full photo analysis. Pro unlocks your personalized
              90-day plan, the AI coach, and progress tracking — from{" "}
              {PRO_MONTHLY_PRICE_LABEL} or {PRO_YEARLY_PRICE_LABEL}.
            </p>
            <motion.div whileTap={{ scale: 0.96 }} className="w-fit">
              <Link
                href="/dashboard/upgrade"
                className="focus-gold mt-5 h-11 px-5 rounded-full bg-lumen-gold text-pure-black font-manrope font-bold text-sm inline-flex items-center gap-2 hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] transition-all duration-300"
              >
                Upgrade to Pro
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </SettingsCard>
  );
}

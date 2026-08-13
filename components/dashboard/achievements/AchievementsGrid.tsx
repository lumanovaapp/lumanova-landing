"use client";

import { motion } from "framer-motion";
import { Badge } from "@/lib/types";
import { BADGE_CATEGORY_LABELS, BADGE_CATEGORY_ORDER, BADGE_CATEGORY_THEME } from "@/lib/badges";
import BadgeCard from "./BadgeCard";

interface AchievementsGridProps {
  badges: Badge[];
  unlockedMap: Record<string, string>;
  unlockedCount: number;
  totalCount: number;
}

// Delay grows with each card's position on the page, capped so a long list
// doesn't leave the last row waiting a beat too long to appear.
const MAX_STAGGER_DELAY = 0.4;
const STAGGER_STEP = 0.04;

export default function AchievementsGrid({
  badges,
  unlockedMap,
  unlockedCount,
  totalCount,
}: AchievementsGridProps) {
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  let cardIndex = 0;

  return (
    <div className="mt-8">
      {/* Stats strip — compact and left-aligned, sized to its content rather
          than stretched across the full-width shell like a stray banner. */}
      <div className="inline-flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] px-5 py-4 sm:px-6 sm:py-5 mb-10">
        <div className="flex items-center gap-6">
          <p className="font-manrope font-semibold text-cream-ivory text-sm sm:text-base whitespace-nowrap">
            {unlockedCount} of {totalCount} unlocked
          </p>
          <p className="text-sm text-lumen-gold font-semibold whitespace-nowrap">{progressPct}%</p>
        </div>
        <div className="h-1.5 w-56 sm:w-64 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-lumen-gold"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {BADGE_CATEGORY_ORDER.map((category) => {
        const items = badges.filter((badge) => badge.category === category);
        if (items.length === 0) return null;

        const theme = BADGE_CATEGORY_THEME[category];

        return (
          <section key={category} className="mb-10 last:mb-0">
            <h2 className="flex items-center gap-2 text-xs uppercase tracking-widest text-cream-ivory/40 font-semibold mb-4">
              <span className={`w-2 h-2 rounded-full ${theme.dot}`} aria-hidden="true" />
              {BADGE_CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {items.map((badge) => {
                const delay = Math.min(cardIndex * STAGGER_STEP, MAX_STAGGER_DELAY);
                cardIndex += 1;
                return (
                  <BadgeCard
                    key={badge.key}
                    badge={badge}
                    unlockedAt={unlockedMap[badge.key] ?? null}
                    delay={delay}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Badge } from "@/lib/types";
import { BADGE_CATEGORY_LABELS, BADGE_CATEGORY_ORDER } from "@/lib/badges";
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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="font-manrope font-semibold text-cream-ivory">
            {unlockedCount} of {totalCount} unlocked
          </p>
          <p className="text-sm text-lumen-gold font-medium">{progressPct}%</p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
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

        return (
          <section key={category} className="mb-8 last:mb-0">
            <h2 className="text-xs uppercase tracking-widest text-cream-ivory/40 font-semibold mb-3">
              {BADGE_CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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

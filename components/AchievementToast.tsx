"use client";

import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Badge } from "@/lib/types";
import { getBadge } from "@/lib/badges";
import BadgeIcon from "@/components/dashboard/achievements/BadgeIcon";

const TOAST_DURATION_MS = 4500;
// Multiple badges can unlock from a single action (e.g. a check-in that both
// hits a streak threshold and a habit-count milestone) — a small stagger
// between them reads as a sequence of wins instead of a pile-up.
const MULTI_UNLOCK_STAGGER_MS = 350;

interface AchievementToastCardProps {
  badge: Badge;
}

function AchievementToastCard({ badge }: AchievementToastCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className="flex items-center gap-3 rounded-2xl border border-lumen-gold/20 bg-charcoal px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
    >
      <div className="w-11 h-11 rounded-xl bg-lumen-gold/15 flex items-center justify-center flex-shrink-0">
        <BadgeIcon name={badge.icon} className="w-5 h-5 text-lumen-gold" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-lumen-gold/80 font-semibold">
          Achievement unlocked
        </p>
        <p className="font-manrope font-semibold text-sm text-cream-ivory">
          {badge.title}
        </p>
      </div>
    </motion.div>
  );
}

export function showAchievementToasts(badgeKeys: string[]): void {
  badgeKeys.forEach((key, i) => {
    const badge = getBadge(key);
    if (!badge) return;

    window.setTimeout(() => {
      toast.custom(<AchievementToastCard badge={badge} />, {
        duration: TOAST_DURATION_MS,
      });
    }, i * MULTI_UNLOCK_STAGGER_MS);
  });
}

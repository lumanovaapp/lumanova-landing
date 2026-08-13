"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Badge } from "@/lib/types";
import { BADGE_CATEGORY_THEME } from "@/lib/badges";
import BadgeIcon from "./BadgeIcon";

interface BadgeCardProps {
  badge: Badge;
  unlockedAt: string | null;
  delay: number;
}

function formatUnlockedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BadgeCard({ badge, unlockedAt, delay }: BadgeCardProps) {
  const unlocked = !!unlockedAt;
  const theme = BADGE_CATEGORY_THEME[badge.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={
        unlocked
          ? { y: -4, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }
          : undefined
      }
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 flex flex-col items-center text-center transition-[border-color,box-shadow] duration-300 ${
        unlocked
          ? `${theme.cardGradient} ${theme.border} ${theme.glow} ${theme.hoverBorder}`
          : "bg-gradient-to-b from-white/[0.04] to-white/[0.015] border-white/[0.08] hover:border-white/[0.14]"
      }`}
    >
      {/* One-shot diagonal shine sweep on unlock — subtle, not a loop. */}
      {unlocked && (
        <motion.div
          initial={{ x: "-160%" }}
          whileInView={{ x: "160%" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.1, delay: delay + 0.3, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
      )}

      <div
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
          unlocked ? theme.iconBg : "bg-white/5"
        }`}
      >
        <BadgeIcon
          name={badge.icon}
          className={`w-6 h-6 ${unlocked ? theme.text : "text-cream-ivory/25"}`}
        />
        {!unlocked && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-charcoal border border-white/10 flex items-center justify-center">
            <Lock className="w-3 h-3 text-cream-ivory/40" />
          </div>
        )}
      </div>

      <p
        className={`font-manrope font-semibold text-sm ${
          unlocked ? "text-cream-ivory" : "text-cream-ivory/50"
        }`}
      >
        {badge.title}
      </p>
      <p
        className={`text-xs mt-1 leading-snug ${
          unlocked ? "text-cream-ivory/60" : "text-cream-ivory/35"
        }`}
      >
        {unlocked ? `Unlocked ${formatUnlockedDate(unlockedAt!)}` : badge.description}
      </p>
    </motion.div>
  );
}

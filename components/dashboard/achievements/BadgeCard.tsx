"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Badge } from "@/lib/types";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`card-lift relative overflow-hidden rounded-2xl border p-5 flex flex-col items-center text-center transition-colors duration-300 ${
        unlocked
          ? "border-lumen-gold/30 bg-lumen-gold/5 hover:border-lumen-gold/50 hover:bg-lumen-gold/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/15"
      }`}
    >
      {/* One-shot diagonal shine sweep on unlock — subtle, not a loop. */}
      {unlocked && (
        <motion.div
          initial={{ x: "-160%" }}
          animate={{ x: "160%" }}
          transition={{ duration: 1.1, delay: delay + 0.3, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
      )}

      <div
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
          unlocked ? "bg-lumen-gold/15" : "bg-white/5"
        }`}
      >
        <BadgeIcon
          name={badge.icon}
          className={`w-6 h-6 ${unlocked ? "text-lumen-gold" : "text-cream-ivory/25"}`}
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

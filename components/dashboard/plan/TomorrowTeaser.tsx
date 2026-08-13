"use client";

import { Lock } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface TomorrowTeaserProps {
  /** planDay + 1 — the day that unlocks once the user actually returns on
   * that calendar date. Never used to gate real access; today's habits stay
   * governed entirely by the existing server-computed plan day. */
  nextDay: number;
  className?: string;
}

// A deliberately un-spoiling stand-in for tomorrow's habit list: same shape
// as a real habit row, blurred so nothing legible comes through.
function GhostRow({ width }: { width: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5">
      <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-white/10" />
      <span
        className="h-2.5 rounded-full bg-white/10 blur-[2px]"
        style={{ width }}
      />
    </div>
  );
}

export default function TomorrowTeaser({ nextDay, className = "" }: TomorrowTeaserProps) {
  const reduceMotion = !!useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-4 ${className}`}
    >
      <div className="space-y-1.5 mb-3" aria-hidden="true">
        <GhostRow width="70%" />
        <GhostRow width="45%" />
      </div>

      <div className="flex items-center gap-2.5">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Lock className="w-3.5 h-3.5 text-cream-ivory/50" />
        </span>
        <p className="text-xs font-medium text-cream-ivory/60">
          Come back tomorrow to unlock{" "}
          <span className="text-cream-ivory/85 font-semibold">Day {nextDay}</span>
        </p>
      </div>
    </motion.div>
  );
}

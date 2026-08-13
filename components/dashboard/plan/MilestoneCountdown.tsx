"use client";

import { Camera } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface MilestoneCountdownProps {
  /** Current plan day, 1–90. Purely presentational — derived elsewhere from
   * the plan's real `created_at`, never computed or stored here. */
  day: number;
  className?: string;
}

const MILESTONE_DAYS = [30, 60, 90] as const;

const MILESTONE_LABELS: Record<(typeof MILESTONE_DAYS)[number], string> = {
  30: "first progress photo",
  60: "halfway progress photo",
  90: "final progress photo",
};

const RING_SIZE = 56;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function MilestoneCountdown({ day, className = "" }: MilestoneCountdownProps) {
  const reduceMotion = !!useReducedMotion();
  const clampedDay = Math.min(90, Math.max(1, day));

  const nextMilestone = MILESTONE_DAYS.find((m) => clampedDay < m);

  // Day 90+: every milestone is behind them — a completion state instead of
  // a countdown toward nothing.
  if (!nextMilestone) {
    return (
      <div
        className={`flex items-center gap-4 rounded-2xl border border-lumen-gold/25 bg-gradient-to-br from-lumen-gold/[0.08] to-lumen-gold/[0.02] px-5 py-4 ${className}`}
      >
        <div className="w-14 h-14 rounded-full bg-lumen-gold/15 border border-lumen-gold/30 flex items-center justify-center flex-shrink-0">
          <Camera className="w-6 h-6 text-lumen-gold" />
        </div>
        <div>
          <p className="font-manrope font-bold text-sm text-cream-ivory">
            All 90 days of progress photos unlocked
          </p>
          <p className="text-xs text-cream-ivory/55 mt-0.5">
            Every milestone check-in is available now.
          </p>
        </div>
      </div>
    );
  }

  const prevMilestone = nextMilestone === 30 ? 0 : nextMilestone === 60 ? 30 : 60;
  const daysUntil = Math.max(0, nextMilestone - clampedDay);
  const windowSize = nextMilestone - prevMilestone;
  const progressInWindow = Math.min(
    1,
    Math.max(0, (clampedDay - prevMilestone) / windowSize)
  );
  const offset = RING_CIRCUMFERENCE * (1 - progressInWindow);
  const label = MILESTONE_LABELS[nextMilestone];

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] px-5 py-4 ${className}`}
    >
      <div className="relative flex-shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={RING_STROKE}
          />
          <motion.circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="#F4C430"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            initial={reduceMotion ? false : { strokeDashoffset: RING_CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera className="w-4 h-4 text-lumen-gold" />
        </div>
      </div>
      <div className="min-w-0">
        <p className="font-manrope font-bold text-sm text-cream-ivory">
          Day {clampedDay} of {nextMilestone}
        </p>
        <p className="text-xs text-cream-ivory/55 mt-0.5 leading-relaxed">
          {daysUntil === 0 ? (
            <>Your {label} unlocks today.</>
          ) : (
            <>
              {daysUntil} {daysUntil === 1 ? "day" : "days"} until your {label} 📸
            </>
          )}
        </p>
      </div>
    </div>
  );
}

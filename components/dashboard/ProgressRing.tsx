"use client";

import { motion, useReducedMotion } from "framer-motion";

interface ProgressRingProps {
  /** Current plan day, 1–90. */
  day: number;
  className?: string;
}

const RING_SIZE = 96;
const RING_STROKE = 7;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// The dashboard header's "graphical" anchor — overall 90-day completion at a
// glance. Purely derived from planDay, same value already shown as text
// elsewhere; this just gives it a visual home worth looking at.
export default function ProgressRing({ day, className = "" }: ProgressRingProps) {
  const reduceMotion = !!useReducedMotion();
  const clampedDay = Math.min(90, Math.max(1, day));
  const pct = Math.round((clampedDay / 90) * 100);
  const offset = RING_CIRCUMFERENCE * (1 - pct / 100);

  return (
    <div
      className={`flex-shrink-0 flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 ${className}`}
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
            transition={{ duration: reduceMotion ? 0 : 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-manrope font-black text-xl text-lumen-gold">
            {pct}%
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-cream-ivory/45 mb-1">
          90-Day Journey
        </p>
        <p className="font-manrope font-bold text-sm text-cream-ivory">
          Day {clampedDay} <span className="text-cream-ivory/40 font-medium">/ 90</span>
        </p>
      </div>
    </div>
  );
}

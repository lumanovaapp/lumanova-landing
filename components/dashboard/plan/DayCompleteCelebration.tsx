"use client";

import { useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PartyPopper } from "lucide-react";

interface DayCompleteCelebrationProps {
  /** True for the brief window right after the last habit of the day gets
   * checked. Parent owns the rising-edge detection (and clears it the same
   * way if a habit gets unchecked again) — this component only renders. */
  active: boolean;
  streak: number;
  // The cached daily coach line (see lib/daily-coach-line.ts) — reused here
  // as the "push toward tomorrow" line instead of generating a second one.
  // Rendered only when present; older days/failed generations just omit it.
  coachLine: string | null;
}

// The whole-day moment is deliberately bigger than each RoutineSection's
// own small "section done" pop — more particles, a wider spread.
const PARTICLE_COUNT = 24;

function getCompletionMessage(streak: number): string {
  if (streak >= 90) return "90 days. You did the whole thing. Incredible.";
  if (streak >= 60) return `${streak} days in — you're deep in it now.`;
  if (streak >= 30) return `${streak} days straight. This is who you are now.`;
  if (streak >= 7) return `${streak}-day streak. Consistency is compounding.`;
  if (streak >= 2) return `${streak} days in a row. Momentum's building.`;
  return "Day complete. Every streak starts here.";
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

function useBurstParticles(seed: number): Particle[] {
  return useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (360 / PARTICLE_COUNT) * i + (Math.random() * 20 - 10);
      return {
        id: i,
        angle,
        distance: 52 + Math.random() * 44,
        size: 3 + Math.random() * 3.5,
        delay: Math.random() * 0.1,
      };
    });
    // Re-roll a fresh burst pattern each time this celebration re-triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
}

export default function DayCompleteCelebration({
  active,
  streak,
  coachLine,
}: DayCompleteCelebrationProps) {
  const reduceMotion = !!useReducedMotion();
  const particles = useBurstParticles(active ? streak : 0);
  const message = getCompletionMessage(streak);

  // Reduced motion still gets the moment — streak, message, and the coach
  // line's tomorrow-push — just as an instant, non-animated card instead of
  // a spring-in confetti burst. The parent's timeout still controls how
  // long `active` stays true, so this still auto-dismisses on schedule.
  if (reduceMotion) {
    if (!active) return null;
    return (
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[55] flex justify-center px-4">
        <div className="relative max-w-sm rounded-3xl border border-lumen-gold/30 bg-gradient-to-b from-charcoal to-[#120D06] px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_32px_rgba(244,196,48,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-lumen-gold/15 border border-lumen-gold/30 flex items-center justify-center flex-shrink-0">
              <PartyPopper className="w-5 h-5 text-lumen-gold" />
            </div>
            <div>
              <p className="font-manrope font-black text-2xl bg-gradient-to-br from-lumen-gold to-amber-300 bg-clip-text text-transparent leading-none">
                {streak}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-lumen-gold/70 mt-0.5">
                Day Streak
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-cream-ivory font-medium">{message}</p>
          {coachLine && (
            <p className="mt-2 text-xs text-cream-ivory/60 leading-relaxed">{coachLine}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="day-complete-celebration"
          className="pointer-events-none fixed inset-x-0 top-20 z-[55] flex justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="relative max-w-sm overflow-visible rounded-3xl border border-lumen-gold/30 bg-gradient-to-b from-charcoal to-[#120D06] px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(244,196,48,0.2)]"
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 360, damping: 22 }}
          >
            {/* Gold burst — small sparks flying outward from center, no
                external confetti library. */}
            {particles.map((p) => {
              const rad = (p.angle * Math.PI) / 180;
              const dx = Math.cos(rad) * p.distance;
              const dy = Math.sin(rad) * p.distance;
              return (
                <motion.span
                  key={p.id}
                  className="absolute left-1/2 top-1/2 rounded-full bg-lumen-gold"
                  style={{ width: p.size, height: p.size }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                  animate={{ x: dx, y: dy, opacity: 0, scale: 1 }}
                  transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
                />
              );
            })}

            <div className="relative flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.6, rotate: -16 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 16, delay: 0.05 }}
                className="w-12 h-12 rounded-2xl bg-lumen-gold/15 border border-lumen-gold/30 flex items-center justify-center flex-shrink-0"
              >
                <PartyPopper className="w-6 h-6 text-lumen-gold" />
              </motion.div>
              <div>
                <motion.p
                  key={streak}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.3, 1], opacity: 1 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="font-manrope font-black text-2xl bg-gradient-to-br from-lumen-gold to-amber-300 bg-clip-text text-transparent leading-none"
                >
                  {streak}
                </motion.p>
                <p className="text-[10px] uppercase tracking-widest text-lumen-gold/70 mt-0.5">
                  Day Streak
                </p>
              </div>
            </div>

            <p className="relative mt-3 text-sm text-cream-ivory font-medium">{message}</p>

            {coachLine && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="relative mt-2 text-xs text-cream-ivory/60 leading-relaxed"
              >
                {coachLine}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

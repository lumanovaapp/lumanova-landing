"use client";

import { useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";

interface DayCompleteCelebrationProps {
  /** True for the brief window right after the last habit of the day gets
   * checked. Parent owns the rising-edge detection (and clears it the same
   * way if a habit gets unchecked again) — this component only renders. */
  active: boolean;
  streak: number;
}

const PARTICLE_COUNT = 14;

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
        distance: 46 + Math.random() * 34,
        size: 3 + Math.random() * 3,
        delay: Math.random() * 0.08,
      };
    });
    // Re-roll a fresh burst pattern each time this celebration re-triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
}

export default function DayCompleteCelebration({
  active,
  streak,
}: DayCompleteCelebrationProps) {
  const reduceMotion = !!useReducedMotion();
  const particles = useBurstParticles(active ? streak : 0);

  // The celebration is the "animation" moment itself — under reduced motion
  // it's skipped outright rather than shown as a static burst, per spec.
  if (reduceMotion) return null;

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
            className="relative overflow-visible rounded-3xl border border-lumen-gold/30 bg-gradient-to-b from-charcoal to-[#120D06] px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_32px_rgba(244,196,48,0.15)]"
            initial={{ opacity: 0, y: -12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
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
                  transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
                />
              );
            })}

            <div className="relative flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.6, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.05 }}
                className="w-11 h-11 rounded-2xl bg-lumen-gold/15 border border-lumen-gold/30 flex items-center justify-center flex-shrink-0"
              >
                <Flame className="w-5 h-5 text-lumen-gold fill-lumen-gold" />
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

            <p className="relative mt-3 text-sm text-cream-ivory font-medium max-w-[240px]">
              {getCompletionMessage(streak)}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

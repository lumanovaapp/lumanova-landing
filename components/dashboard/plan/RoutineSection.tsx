"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Sunrise, CloudSun, Moon, Sparkles, LucideIcon } from "lucide-react";
import { DailyHabit, TimeOfDay } from "@/lib/types";
import { TIME_OF_DAY_THEME } from "@/lib/time-of-day";

const ICONS: Record<string, LucideIcon> = { Sunrise, CloudSun, Moon, Sparkles };

const RING_SIZE = 32;
const RING_STROKE = 3.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface RoutineSectionProps {
  time: TimeOfDay;
  habits: DailyHabit[];
  checks: Record<string, boolean>;
  onToggle: (habitId: string) => void;
  // The section matching the live clock — gets a glow. Placement (moving it
  // to the top of the list) is the parent's job, not this component's.
  isCurrent: boolean;
  poppedId?: string | null;
  errorId?: string | null;
}

export default function RoutineSection({
  time,
  habits,
  checks,
  onToggle,
  isCurrent,
  poppedId = null,
  errorId = null,
}: RoutineSectionProps) {
  const reduceMotion = !!useReducedMotion();
  const theme = TIME_OF_DAY_THEME[time];
  const Icon = ICONS[theme.icon] ?? Sparkles;

  const doneCount = habits.filter((h) => checks[h.id]).length;
  const total = habits.length;
  const sectionDone = total > 0 && doneCount === total;

  // Same pattern as the day-level celebration in PlanView: seeded from the
  // first render's real value (not hardcoded false) so a section that was
  // already fully checked off in an earlier session doesn't read as a fresh
  // completion the instant this mounts, and a short-lived, session-scoped
  // "just finished" flag drives the pop instead of the persisted done state.
  const prevDoneRef = useRef(sectionDone);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (sectionDone && !prevDoneRef.current) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 1400);
      prevDoneRef.current = sectionDone;
      return () => clearTimeout(timer);
    }
    prevDoneRef.current = sectionDone;
  }, [sectionDone]);

  if (total === 0) return null;

  const progress = total > 0 ? doneCount / total : 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-shadow duration-500 ${theme.border} ${theme.bgGradient} ${
        isCurrent
          ? theme.glow
          : "shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)]"
      }`}
    >
      {/* Small, quick "section done" pop — absolutely positioned over this
          card's own box (never adds height, so it can't shift layout), and
          gated on the transient `celebrate` flag rather than the persisted
          `sectionDone` so it only fires right after a live completion, not
          on every load where the section already happens to be done. Under
          reduced motion this still appears, just as an instant swap instead
          of an animated fade, per spec ("still show ... celebration text
          statically"). */}
      <motion.div
        initial={false}
        animate={{ opacity: celebrate ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0.05 : 0.25 }}
        aria-hidden={!celebrate}
        className={`absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-3xl ${theme.bgSoft} backdrop-blur-[2px] ${
          celebrate ? "" : "pointer-events-none"
        }`}
      >
        <Check className={`w-4 h-4 ${theme.text}`} />
        <span className={`font-manrope font-bold text-sm ${theme.text}`}>
          {theme.label} done
        </span>
      </motion.div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl ${theme.bgSoft} border ${theme.border} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-4 h-4 ${theme.text}`} />
          </div>
          <p className={`font-manrope font-bold text-sm ${theme.text}`}>{theme.label}</p>
        </div>

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
              className={theme.text}
              stroke="currentColor"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              initial={false}
              animate={{ strokeDashoffset: ringOffset }}
              transition={{ duration: reduceMotion ? 0.15 : 0.6, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-bold text-cream-ivory/70">
              {doneCount}/{total}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {habits.map((habit) => {
          const done = !!checks[habit.id];
          const hasError = errorId === habit.id;
          return (
            <div key={habit.id}>
              <button
                type="button"
                onClick={() => onToggle(habit.id)}
                className={`w-full flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 focus-gold ${
                  done
                    ? `${theme.border} ${theme.bgSoft} ${theme.ring}`
                    : "border-white/10 bg-pure-black/20 hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <motion.span
                  animate={
                    poppedId === habit.id ? { scale: [1, 1.3, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.4 }}
                  className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    done ? `${theme.border} bg-current ${theme.text}` : "border-white/20 bg-transparent"
                  }`}
                >
                  {done && <Check className="w-3.5 h-3.5 text-pure-black" />}
                </motion.span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      done ? "text-cream-ivory/50 line-through" : "text-cream-ivory"
                    }`}
                  >
                    {habit.label}
                  </p>
                  {habit.detail && (
                    <p
                      className={`text-xs mt-0.5 leading-relaxed ${
                        done ? "text-cream-ivory/25" : "text-cream-ivory/45"
                      }`}
                    >
                      {habit.detail}
                    </p>
                  )}
                </div>
              </button>
              {hasError && (
                <p className="mt-1 px-1 text-[10px] text-warm-coral">
                  Couldn&apos;t save — reverted. Try again.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

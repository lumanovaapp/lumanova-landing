"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Sunrise, CloudSun, Moon, Sparkles, LucideIcon } from "lucide-react";
import { DailyHabit, TimeOfDay } from "@/lib/types";
import { TIME_OF_DAY_THEME } from "@/lib/time-of-day";
import HabitCard from "./HabitCard";

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
  // The section matching the live clock (and not yet done) — gets a glow.
  // Ordering/placement is the parent's job (TodayRoutine), not this
  // component's.
  isCurrent: boolean;
  // Parent says this section is done AND has finished its settle hold —
  // render the compact "done" summary row instead of the full card. Can be
  // overridden locally by tapping that row to peek back in and uncheck
  // something.
  collapsed: boolean;
  // True for the brief window right after this section's last habit gets
  // checked — shows the small celebration pop. Owned by the parent so
  // there's exactly one place tracking "what just finished."
  celebrating: boolean;
  poppedId?: string | null;
  errorId?: string | null;
}

export default function RoutineSection({
  time,
  habits,
  checks,
  onToggle,
  isCurrent,
  collapsed,
  celebrating,
  poppedId = null,
  errorId = null,
}: RoutineSectionProps) {
  const reduceMotion = !!useReducedMotion();
  const theme = TIME_OF_DAY_THEME[time];
  const Icon = ICONS[theme.icon] ?? Sparkles;

  const doneCount = habits.filter((h) => checks[h.id]).length;
  const total = habits.length;

  // Manual "peek back in" override — reset the moment the parent says this
  // section isn't in the collapsed-done state anymore (e.g. a habit got
  // unchecked), so a future completion always starts collapsed fresh rather
  // than inheriting a stale expanded flag.
  const [manuallyExpanded, setManuallyExpanded] = useState(false);
  useEffect(() => {
    if (!collapsed) setManuallyExpanded(false);
  }, [collapsed]);

  if (total === 0) return null;

  const showCompact = collapsed && !manuallyExpanded;
  const progress = total > 0 ? doneCount / total : 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <motion.div
      layout
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-3xl border transition-shadow duration-500 ${theme.border} ${theme.bgGradient} ${
        isCurrent
          ? theme.glow
          : "shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)]"
      }`}
    >
      {/* Small, quick "section done" pop — absolutely positioned over this
          card's own box (never adds height, so it can't shift layout on its
          own), gated on the transient `celebrating` flag so it only shows
          right after a live completion, not on every load where the
          section already happens to be done. Under reduced motion this
          still appears, just as an instant swap instead of an animated
          fade, and there's no slide/collapse to wait out (see
          TodayRoutine's SETTLE_MS). */}
      <motion.div
        initial={false}
        animate={{ opacity: celebrating ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0.05 : 0.25 }}
        aria-hidden={!celebrating}
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 ${theme.bgSoft} backdrop-blur-[2px] ${
          celebrating ? "" : "opacity-0"
        }`}
      >
        <Check className={`w-4 h-4 ${theme.text}`} />
        <span className={`font-manrope font-bold text-sm ${theme.text}`}>
          {theme.label} done
        </span>
      </motion.div>

      {showCompact ? (
        <button
          type="button"
          onClick={() => setManuallyExpanded(true)}
          className="w-full flex items-center justify-between gap-3 p-4 hover:brightness-110 transition-[filter] duration-300 focus-gold"
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl ${theme.bgSoft} border ${theme.border} flex items-center justify-center flex-shrink-0`}
            >
              <Icon className={`w-3.5 h-3.5 ${theme.text}`} />
            </div>
            <span className={`font-manrope font-semibold text-sm ${theme.text}`}>
              {theme.label} done
            </span>
          </div>
          <Check className={`w-4 h-4 ${theme.text} flex-shrink-0`} />
        </button>
      ) : (
        <div className="p-5 sm:p-6">
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
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                done={!!checks[habit.id]}
                onToggle={onToggle}
                theme={theme}
                popped={poppedId === habit.id}
                hasError={errorId === habit.id}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

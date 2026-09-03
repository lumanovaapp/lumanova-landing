"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sun, Moon, Sparkles, Lock, Clock3, LucideIcon } from "lucide-react";
import { DailyHabit } from "@/lib/types";
import { groupHabitsByTimeOfDay, TIME_OF_DAY_LABELS } from "@/lib/habit-groups";
import { sectionLockState, sectionLockLabel } from "@/lib/time-of-day";
import { ACCENT_THEME } from "@/lib/accent";

const TIME_ICONS: Record<string, LucideIcon> = {
  morning: Sun,
  evening: Moon,
  anytime: Sparkles,
};

interface HabitListProps {
  habits: DailyHabit[];
  // Done state for the single day being shown, keyed by habit id — the plan
  // page passes today's map, the calendar drawer passes whichever day is
  // selected. Same shape either way, same /api/checkin-backed handler.
  checks: Record<string, boolean>;
  onToggle: (habitId: string) => void;
  // false for read-only days (past/future) in the calendar drawer.
  interactive?: boolean;
  // Habit id mid check-in pop animation — owned by the parent (PlanView),
  // passed through so the same visual fires regardless of which list it's
  // checked from.
  poppedId?: string | null;
  errorId?: string | null;
  // The plan page shows each habit's detail line; the calendar drawer stays
  // compact and label-only to fit the bottom-sheet layout.
  showDetail?: boolean;
  compact?: boolean;
}

export default function HabitList({
  habits,
  checks,
  onToggle,
  interactive = true,
  poppedId = null,
  errorId = null,
  showDetail = false,
  compact = false,
}: HabitListProps) {
  const doneTheme = ACCENT_THEME.maintain;
  const groups = groupHabitsByTimeOfDay(habits);

  // `interactive` is only ever true for TODAY (past/future days are read-only
  // in the drawer), so this is exactly where the forgiving check-in
  // time-lock applies. null until mount → SSR renders nothing locked.
  const [clock, setClock] = useState<Date | null>(null);
  useEffect(() => {
    if (!interactive) return;
    setClock(new Date());
    const id = window.setInterval(() => setClock(new Date()), 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [interactive]);

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {groups.map((group) => {
        const time = group.time;
        const Icon = TIME_ICONS[time];
        const lockState =
          interactive && clock ? sectionLockState(time, clock) : "open";
        const lockNote =
          lockState !== "open" && time !== "anytime"
            ? sectionLockLabel(time, lockState)
            : null;
        const locked = lockNote !== null;
        return (
          <div key={group.time}>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Icon className="w-3.5 h-3.5 text-lumen-gold/70" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-cream-ivory/45">
                {TIME_OF_DAY_LABELS[group.time]}
              </p>
            </div>
            {lockNote && (
              <div className="mb-2.5 flex items-center gap-1.5 text-[11px] text-cream-ivory/45">
                {lockState === "locked" ? (
                  <Lock className="w-3 h-3 flex-shrink-0" />
                ) : (
                  <Clock3 className="w-3 h-3 flex-shrink-0" />
                )}
                <span>{lockNote}</span>
              </div>
            )}
            <div className={`grid grid-cols-1 ${compact ? "" : "sm:grid-cols-2"} gap-3`}>
              {group.habits.map((habit) => {
                const done = !!checks[habit.id];
                const hasError = errorId === habit.id;
                const canToggle = interactive && !locked;
                return (
                  <div key={habit.id}>
                    <button
                      type="button"
                      disabled={!canToggle}
                      onClick={() => canToggle && onToggle(habit.id)}
                      className={`w-full flex items-start gap-3 rounded-2xl border text-left transition-all duration-300 focus-gold ${
                        compact ? "p-3" : "p-3.5 sm:p-4"
                      } ${
                        done
                          ? `${doneTheme.border} ${doneTheme.bgSoft} ${doneTheme.ring}`
                          : "border-white/10 bg-pure-black/20 hover:border-white/20 hover:bg-white/[0.04]"
                      } ${canToggle ? "cursor-pointer" : "opacity-70 cursor-default"}`}
                    >
                      <motion.span
                        animate={
                          poppedId === habit.id ? { scale: [1, 1.3, 1] } : { scale: 1 }
                        }
                        transition={{ duration: 0.4 }}
                        className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          done
                            ? `${doneTheme.bgSolid} border-transparent`
                            : "border-white/20 bg-transparent"
                        }`}
                      >
                        {done && <Check className={`w-3.5 h-3.5 ${doneTheme.solidText}`} />}
                      </motion.span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            done ? "text-cream-ivory/50 line-through" : "text-cream-ivory"
                          }`}
                        >
                          {habit.label}
                        </p>
                        {showDetail && habit.detail && (
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
      })}
    </div>
  );
}

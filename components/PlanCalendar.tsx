"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Shield } from "lucide-react";
import { Plan, PhotoMilestone, MilestonePhotoSummary } from "@/lib/types";
import { ACCENT_THEME, ACCENT_ORDER } from "@/lib/accent";
import {
  toDateOnlyUTC,
  addDays,
  dateToStr,
  phaseForDay,
  computeDayVisualState,
} from "@/lib/streak";
import DayDrawer from "@/components/dashboard/plan/DayDrawer";

interface PlanCalendarProps {
  plan: Plan;
  createdAt: string;
  checkinsByDate: Record<string, Record<string, boolean>>;
  onToggleHabit: (habitId: string) => void;
  errorHabitId: string | null;
  milestonePhotos: Partial<Record<PhotoMilestone, MilestonePhotoSummary>>;
  frozenDays: number[];
  baselinePhotoUrl: string | null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const MILESTONE_DAYS: Record<number, PhotoMilestone> = {
  30: "day_30",
  60: "day_60",
  90: "day_90",
};

// The full 90-day map — the "zoomed out" view reached from the week strip's
// "View full plan" control. Day-cell interaction (drawer, lock rules,
// checkability) is entirely owned by DayDrawer, shared verbatim with the
// week strip so the two views can never disagree about a given day.
export default function PlanCalendar({
  plan,
  createdAt,
  checkinsByDate,
  onToggleHabit,
  errorHabitId,
  milestonePhotos,
  frozenDays,
  baselinePhotoUrl,
}: PlanCalendarProps) {
  const reduceMotion = !!useReducedMotion();
  const frozenDaySet = new Set(frozenDays);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const planStart = toDateOnlyUTC(new Date(createdAt));
  const today = toDateOnlyUTC(new Date());
  const todayStr = dateToStr(today);
  const realDayNumber =
    Math.floor((today.getTime() - planStart.getTime()) / MS_PER_DAY) + 1;

  function dateForDay(day: number): Date {
    return addDays(planStart, day - 1);
  }

  function activeHabitsForDay(day: number) {
    const phase = phaseForDay(day);
    return plan.daily_habits.filter((h) => h.phase_start <= phase);
  }

  function dayVisualState(day: number) {
    const dateStr = dateToStr(dateForDay(day));
    return computeDayVisualState({
      dateStr,
      todayStr,
      activeHabitIds: activeHabitsForDay(day).map((h) => h.id),
      doneMap: checkinsByDate[dateStr],
      isFrozen: frozenDaySet.has(day),
    });
  }

  return (
    <div className="w-full rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-5 sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="font-manrope font-semibold text-sm text-cream-ivory">
          Your 90 Days
        </h2>
        <div className="flex items-center gap-2 text-[10px] text-cream-ivory/50">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-aurora-mist inline-block" />
            Done
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-warm-coral inline-block" />
            Missed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-deep-teal border border-aurora-mist/50 inline-block" />
            Frozen
          </span>
        </div>
      </div>

      {plan.phases.map((phase, phaseIndex) => {
        const startDay = (phase.number - 1) * 30 + 1;
        const days = Array.from({ length: 30 }, (_, i) => startDay + i);
        const phaseAccent = ACCENT_ORDER[phaseIndex % ACCENT_ORDER.length];
        const phaseTheme = ACCENT_THEME[phaseAccent];
        const daysDoneInPhase = days.filter(
          (d) => dayVisualState(d) === "done" || dayVisualState(d) === "frozen"
        ).length;

        return (
          <div key={phase.number} className="mb-3 last:mb-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                className={`flex-shrink-0 w-4 h-4 rounded-full ${phaseTheme.bgSoft} border ${phaseTheme.border} ${phaseTheme.text} text-[9px] font-bold flex items-center justify-center`}
              >
                {phase.number}
              </span>
              <p className="text-[10px] uppercase tracking-widest text-cream-ivory/60 font-semibold">
                {phase.title}
              </p>
              <span className="text-[10px] text-cream-ivory/35">
                {daysDoneInPhase}/30
              </span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1 overflow-visible">
              {days.map((day) => {
                const visualState = dayVisualState(day);
                const dateStr = dateToStr(dateForDay(day));
                const isToday = dateStr === todayStr;
                const isMilestoneMarker =
                  day === 1 || day === 30 || day === 60 || day === 90;
                const milestoneType = MILESTONE_DAYS[day];
                const milestoneReached =
                  !!milestoneType && realDayNumber >= day;
                const milestoneNeedsAction =
                  milestoneReached && !milestonePhotos[milestoneType!]?.comparison;
                const todayNeedsCheckin = isToday && visualState !== "done";

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    title={
                      milestoneNeedsAction
                        ? "Tap to check in"
                        : todayNeedsCheckin
                        ? "Tap to check off today's habits"
                        : undefined
                    }
                    aria-label={
                      milestoneNeedsAction
                        ? `Day ${day} milestone — tap to check in`
                        : todayNeedsCheckin
                        ? `Day ${day} — today, tap to check off habits`
                        : `Day ${day}`
                    }
                    className={`relative aspect-square overflow-visible rounded-md flex items-center justify-center text-[10px] font-semibold transition-all duration-200 cursor-pointer hover:scale-110 hover:brightness-110 hover:z-10 focus-gold ${
                      visualState === "done"
                        ? `${ACCENT_THEME.maintain.bgSolid} ${ACCENT_THEME.maintain.solidText}`
                        : visualState === "frozen"
                        ? "bg-deep-teal/60 text-aurora-mist border border-aurora-mist/40"
                        : visualState === "missed"
                        ? `${ACCENT_THEME.focus.bgSoft} ${ACCENT_THEME.focus.text} border ${ACCENT_THEME.focus.border}`
                        : visualState === "future"
                        ? "bg-white/5 text-cream-ivory/30"
                        : "bg-white/10 text-cream-ivory"
                    } ${
                      isToday
                        ? "ring-2 ring-lumen-gold ring-offset-1 ring-offset-pure-black"
                        : ""
                    }`}
                  >
                    {/* Today's own "done" cell gets a celebratory pulsing
                        glow on top of the standard done color — a past done
                        day stays plain teal, only *today* having just been
                        completed gets the extra flourish. */}
                    {isToday && visualState === "done" && !reduceMotion && (
                      <motion.span
                        className="absolute -inset-1 rounded-lg pointer-events-none"
                        animate={{
                          boxShadow: [
                            "0 0 0 0px rgba(244,196,48,0.45)",
                            "0 0 8px 3px rgba(244,196,48,0)",
                          ],
                        }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    {day}
                    {visualState === "frozen" && (
                      <Shield className="absolute -top-1 -right-1 w-2.5 h-2.5 text-aurora-mist fill-aurora-mist/30" />
                    )}
                    {isMilestoneMarker && visualState !== "frozen" && (
                      <Star className="absolute -top-1 -right-1 w-2.5 h-2.5 text-lumen-gold fill-lumen-gold" />
                    )}
                    {milestoneNeedsAction && (
                      <motion.span
                        className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-lumen-gold"
                        animate={
                          reduceMotion
                            ? {}
                            : { scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }
                        }
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                    {/* Affordance hinting today's cell opens a live check-in
                        drawer — a distinct corner from the milestone dot
                        (bottom-left) and star/shield badges (top-right) so
                        they never collide when today doubles as either. */}
                    {todayNeedsCheckin && (
                      <motion.span
                        className="absolute -bottom-1 -right-1 w-1.5 h-1.5 rounded-full bg-lumen-gold"
                        animate={
                          reduceMotion
                            ? {}
                            : { scale: [1, 1.5, 1], opacity: [1, 0.55, 1] }
                        }
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <DayDrawer
        plan={plan}
        createdAt={createdAt}
        checkinsByDate={checkinsByDate}
        onToggleHabit={onToggleHabit}
        errorHabitId={errorHabitId}
        milestonePhotos={milestonePhotos}
        frozenDays={frozenDays}
        baselinePhotoUrl={baselinePhotoUrl}
        selectedDay={selectedDay}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}

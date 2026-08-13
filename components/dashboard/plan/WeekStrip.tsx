"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Rows3, Shield, Lock } from "lucide-react";
import { Plan, PhotoMilestone, MilestonePhotoSummary } from "@/lib/types";
import {
  toDateOnlyUTC,
  addDays,
  dateToStr,
  phaseForDay,
  computeDayVisualState,
} from "@/lib/streak";
import DayDrawer from "@/components/dashboard/plan/DayDrawer";

interface WeekStripProps {
  plan: Plan;
  createdAt: string;
  checkinsByDate: Record<string, Record<string, boolean>>;
  onToggleHabit: (habitId: string) => void;
  errorHabitId: string | null;
  milestonePhotos: Partial<Record<PhotoMilestone, MilestonePhotoSummary>>;
  frozenDays: number[];
  baselinePhotoUrl: string | null;
  // Reveals the full 90-day map further down the page — see PlanView.
  onViewFullPlan: () => void;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;
const TOTAL_WEEKS = Math.ceil(90 / DAYS_PER_WEEK); // 13 (last week is a 6-day partial)

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeekStrip({
  plan,
  createdAt,
  checkinsByDate,
  onToggleHabit,
  errorHabitId,
  milestonePhotos,
  frozenDays,
  baselinePhotoUrl,
  onViewFullPlan,
}: WeekStripProps) {
  const frozenDaySet = new Set(frozenDays);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const planStart = toDateOnlyUTC(new Date(createdAt));
  const today = toDateOnlyUTC(new Date());
  const todayStr = dateToStr(today);
  const realDayNumber = Math.min(
    90,
    Math.max(1, Math.floor((today.getTime() - planStart.getTime()) / MS_PER_DAY) + 1)
  );
  const currentWeekIndex = Math.floor((realDayNumber - 1) / DAYS_PER_WEEK);

  const [viewedWeekIndex, setViewedWeekIndex] = useState(currentWeekIndex);

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

  const weekStartDay = viewedWeekIndex * DAYS_PER_WEEK + 1;
  const weekDays = Array.from(
    { length: Math.min(DAYS_PER_WEEK, 90 - weekStartDay + 1) },
    (_, i) => weekStartDay + i
  );

  const firstDate = dateForDay(weekDays[0]);
  const lastDate = dateForDay(weekDays[weekDays.length - 1]);
  const monthLabel =
    firstDate.getUTCMonth() === lastDate.getUTCMonth()
      ? firstDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })
      : `${firstDate.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })} – ${lastDate.toLocaleDateString(
          "en-US",
          { month: "short", year: "numeric", timeZone: "UTC" }
        )}`;

  return (
    <div className="w-full rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-lumen-gold/70">
            {monthLabel}
          </p>
          <p className="font-manrope font-semibold text-sm text-cream-ivory mt-0.5">
            Week {viewedWeekIndex + 1} of {TOTAL_WEEKS}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewedWeekIndex((w) => Math.max(0, w - 1))}
            disabled={viewedWeekIndex === 0}
            aria-label="Previous week"
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-cream-ivory/60 hover:text-cream-ivory hover:border-white/20 transition-colors disabled:opacity-30 disabled:pointer-events-none focus-gold"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewedWeekIndex((w) => Math.min(TOTAL_WEEKS - 1, w + 1))}
            disabled={viewedWeekIndex === TOTAL_WEEKS - 1}
            aria-label="Next week"
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-cream-ivory/60 hover:text-cream-ivory hover:border-white/20 transition-colors disabled:opacity-30 disabled:pointer-events-none focus-gold"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onViewFullPlan}
            className="ml-1 h-8 px-3 rounded-lg border border-white/10 flex items-center gap-1.5 text-[11px] font-medium text-cream-ivory/60 hover:text-cream-ivory hover:border-white/20 transition-colors focus-gold"
          >
            <Rows3 className="w-3.5 h-3.5" />
            View full plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map((day) => {
          const visualState = dayVisualState(day);
          const date = dateForDay(day);
          const dow = date.getUTCDay();
          const weekdayLabel = WEEKDAY_LABELS[dow === 0 ? 6 : dow - 1];
          const isToday = dateToStr(date) === todayStr;

          const stateClasses =
            visualState === "done"
              ? "bg-lumen-gold text-pure-black border-transparent"
              : visualState === "frozen"
              ? "bg-deep-teal/60 text-aurora-mist border border-aurora-mist/40"
              : visualState === "missed"
              ? "bg-warm-coral/10 text-warm-coral border border-warm-coral/25"
              : visualState === "future"
              ? "bg-white/5 text-cream-ivory/25 border border-white/5"
              : "bg-white/10 text-cream-ivory border border-white/10";

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              aria-label={`${weekdayLabel} ${date.getUTCDate()}${isToday ? " — today" : ""}`}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 cursor-pointer hover:brightness-110 focus-gold ${stateClasses} ${
                isToday
                  ? "py-4 sm:py-5 ring-2 ring-lumen-gold ring-offset-2 ring-offset-pure-black scale-[1.04]"
                  : "py-3 sm:py-3.5"
              }`}
            >
              <span
                className={`text-[9px] font-semibold uppercase tracking-wide ${
                  visualState === "done" ? "text-pure-black/60" : "opacity-60"
                }`}
              >
                {weekdayLabel}
              </span>
              <span
                className={`font-manrope font-bold ${isToday ? "text-xl sm:text-2xl" : "text-sm sm:text-base"}`}
              >
                {date.getUTCDate()}
              </span>
              {visualState === "frozen" && (
                <Shield className="absolute -top-1 -right-1 w-3 h-3 text-aurora-mist fill-aurora-mist/30" />
              )}
              {visualState === "future" && (
                <Lock className="absolute -top-1 -right-1 w-3 h-3 text-cream-ivory/25" />
              )}
            </button>
          );
        })}
      </div>

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

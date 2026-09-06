"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Shield, Lock } from "lucide-react";
import { Plan, PhotoMilestone, MilestonePhotoSummary } from "@/lib/types";
import { toDateOnlyUTC, addDays, dateToStr, phaseForDay } from "@/lib/streak";
import HabitList from "@/components/dashboard/plan/HabitList";
import { MilestoneSection, MILESTONE_LABELS } from "@/components/dashboard/plan/MilestoneSection";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const MILESTONE_DAYS: Record<number, PhotoMilestone> = {
  30: "day_30",
  60: "day_60",
  90: "day_90",
};

// Mirrors Tailwind's `md` breakpoint. Below it: a full-width bottom-sheet
// drawer (mobile screen space is tight, so the day's content deserves the
// whole viewport). At/above it: a small inline panel that just expands in
// normal document flow right where <DayDrawer> is rendered (directly under
// the week strip's or full calendar's day grid) — no backdrop, no body
// scroll lock, since it never covers the page.
const DESKTOP_BREAKPOINT_PX = 768;

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`);
    setIsDesktop(mql.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
}

// Locks the page behind the drawer, including on iOS Safari where a plain
// `overflow: hidden` on body still lets the background rubber-band scroll.
// Pinning body to `position: fixed` at its current scroll offset removes it
// from the scroll chain entirely; we restore the exact offset on close.
// Mobile-drawer only — the desktop inline panel never needs this.
function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const { body } = document;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

interface DayDrawerProps {
  plan: Plan;
  createdAt: string;
  checkinsByDate: Record<string, Record<string, boolean>>;
  onToggleHabit: (habitId: string) => void;
  errorHabitId: string | null;
  milestonePhotos: Partial<Record<PhotoMilestone, MilestonePhotoSummary>>;
  frozenDays: number[];
  baselinePhotoUrl: string | null;
  // null = closed. Shared by the week strip and the full 90-day map so both
  // trigger the exact same drawer, with the exact same read/lock/checkable
  // rules, instead of each maintaining its own copy. Milestone days that have
  // been reached never reach this component anymore — WeekStrip/PlanCalendar
  // route those to the Progress tab's inline milestone panel instead (see
  // PlanView's `goToMilestone`) — this only ever opens for a plain habit day.
  selectedDay: number | null;
  onClose: () => void;
}

export default function DayDrawer({
  plan,
  createdAt,
  checkinsByDate,
  onToggleHabit,
  errorHabitId,
  milestonePhotos,
  frozenDays,
  baselinePhotoUrl,
  selectedDay,
  onClose,
}: DayDrawerProps) {
  const router = useRouter();
  const reduceMotion = !!useReducedMotion();
  const isDesktop = useIsDesktop();
  const frozenDaySet = new Set(frozenDays);

  // Only the mobile bottom-sheet covers the page — the desktop inline panel
  // never needs the scroll lock (passing `false` makes the hook a no-op).
  useBodyScrollLock(selectedDay !== null && !isDesktop);

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

  const selectedDateStr =
    selectedDay !== null ? dateToStr(dateForDay(selectedDay)) : null;
  const isSelectedToday = selectedDateStr === todayStr;
  const isSelectedFuture = !!selectedDateStr && selectedDateStr > todayStr;
  const selectedHabits = selectedDay !== null ? activeHabitsForDay(selectedDay) : [];
  const selectedMilestoneType =
    selectedDay !== null ? MILESTONE_DAYS[selectedDay] : undefined;
  const selectedMilestoneReached =
    selectedDay !== null && realDayNumber >= selectedDay;
  const selectedIsFrozen = selectedDay !== null && frozenDaySet.has(selectedDay);

  const content = (
    <>
      {selectedIsFrozen && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-aurora-mist/30 bg-aurora-mist/10 px-4 py-3">
          <Shield className="w-4 h-4 text-aurora-mist flex-shrink-0" />
          <p className="text-xs text-aurora-mist">
            A streak freeze covered this day — it doesn&apos;t break your streak.
          </p>
        </div>
      )}

      {selectedMilestoneType && selectedMilestoneReached && (
        <div className="mb-6">
          <MilestoneSection
            milestoneType={selectedMilestoneType}
            photo={milestonePhotos[selectedMilestoneType]}
            baselinePhotoUrl={baselinePhotoUrl}
            onUploaded={() => router.refresh()}
          />
        </div>
      )}

      {selectedMilestoneType && !selectedMilestoneReached && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-3">
          <Lock className="w-4 h-4 text-cream-ivory/40 flex-shrink-0" />
          <p className="text-xs text-cream-ivory/50">
            {MILESTONE_LABELS[selectedMilestoneType]} unlocks on day{" "}
            {selectedDay}.
          </p>
        </div>
      )}

      {isSelectedFuture ? (
        // Future days must never reveal their habits — same "locked until
        // you arrive" rule the tomorrow-teaser already follows elsewhere on
        // the plan page. Only today's real, interactive list and past days'
        // (read-only) history are ever shown.
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-3">
          <Lock className="w-4 h-4 text-cream-ivory/40 flex-shrink-0" />
          <p className="text-xs text-cream-ivory/50">
            Unlocks on day {selectedDay}. Come back once you get there.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs uppercase tracking-widest text-cream-ivory/50 font-medium mb-3">
            {isSelectedToday ? "Today's Habits" : "Habits"}
          </p>
          <HabitList
            habits={selectedHabits}
            checks={checkinsByDate[selectedDateStr ?? ""] ?? {}}
            onToggle={onToggleHabit}
            interactive={isSelectedToday}
            errorId={errorHabitId}
            compact
          />
        </>
      )}
    </>
  );

  const header = (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="font-manrope font-bold text-xl text-cream-ivory">
          Day {selectedDay}
        </p>
        <p className="text-xs text-cream-ivory/50">{selectedDateStr}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="w-9 h-9 flex items-center justify-center rounded-xl text-cream-ivory/70 hover:bg-white/5 hover:text-cream-ivory transition-colors focus-gold"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  if (isDesktop) {
    // A light, in-flow panel — expands right where <DayDrawer> sits in the
    // tree (directly under the week strip's / full calendar's day grid), no
    // backdrop, no scroll lock. A deliberate mount/unmount is fine here
    // (unlike the check-in path) since this is a user-initiated click, not
    // an automatic side effect of completing a habit.
    return (
      <AnimatePresence>
        {selectedDay !== null && (
          <motion.div
            key="panel"
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-3xl border border-white/10 bg-charcoal/60 p-6">
              {header}
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {selectedDay !== null && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.2 }}
            className="fixed inset-0 z-40 bg-pure-black/70"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Day ${selectedDay}`}
            initial={{ y: reduceMotion ? 0 : "100%" }}
            animate={{ y: 0 }}
            exit={{ y: reduceMotion ? 0 : "100%" }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: "spring", damping: 30, stiffness: 300 }
            }
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto overscroll-contain touch-pan-y rounded-t-3xl border-t border-white/10 bg-pure-black p-6 sm:p-8 sm:max-w-lg sm:mx-auto"
          >
            {header}
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

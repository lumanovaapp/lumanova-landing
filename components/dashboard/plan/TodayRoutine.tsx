"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { DailyHabit, TimeOfDay } from "@/lib/types";
import { groupHabitsByTimeOfDay } from "@/lib/habit-groups";
import { getCurrentTimeOfDay } from "@/lib/time-of-day";
import RoutineSection from "./RoutineSection";

interface TodayRoutineProps {
  habits: DailyHabit[];
  checks: Record<string, boolean>;
  onToggle: (habitId: string) => void;
  poppedId?: string | null;
  errorId?: string | null;
}

// How long a just-finished section holds its expanded state (showing the
// "done" celebration) before collapsing and sliding to the back of the
// stack. Zero under reduced motion — there's no slide to hold for, so it
// should just settle immediately.
const SETTLE_MS = 900;

export default function TodayRoutine({
  habits,
  checks,
  onToggle,
  poppedId = null,
  errorId = null,
}: TodayRoutineProps) {
  const reduceMotion = !!useReducedMotion();

  // Computed on mount (client-only — the server has no notion of the user's
  // local clock) and refreshed hourly so the glow follows the user across a
  // long-open tab instead of freezing at whatever time the page first loaded.
  const [now, setNow] = useState<TimeOfDay | null>(null);

  useEffect(() => {
    setNow(getCurrentTimeOfDay());
    const interval = window.setInterval(() => setNow(getCurrentTimeOfDay()), 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const groups = groupHabitsByTimeOfDay(habits);

  const doneMap: Partial<Record<TimeOfDay, boolean>> = {};
  for (const g of groups) {
    doneMap[g.time] = g.habits.length > 0 && g.habits.every((h) => checks[h.id]);
  }

  // "settling[time]" is true for the brief window right after that section's
  // last habit gets checked — it holds the card expanded (showing the small
  // celebration) before the collapse + reorder happens, so the two don't
  // visually collide. Also doubles as the "just completed, fire the
  // celebration" signal passed to RoutineSection, so there's exactly one
  // place tracking "what just finished" instead of two.
  const [settling, setSettling] = useState<Partial<Record<TimeOfDay, boolean>>>({});
  const prevDoneRef = useRef<Partial<Record<TimeOfDay, boolean>>>(doneMap);
  const settleTimersRef = useRef<Partial<Record<TimeOfDay, number>>>({});

  // Captured right before a section settles (collapses + reorders to the
  // back), restored in a layout effect the instant that DOM update commits —
  // same technique PlanView uses around the checkin itself, just covering
  // this second, delayed source of layout change too. Without this, a
  // section shrinking away above the user's current scroll position would
  // shift everything below it and change what's on screen.
  const scrollRestoreRef = useRef<number | null>(null);

  useEffect(() => {
    for (const g of groups) {
      const was = prevDoneRef.current[g.time] ?? false;
      const isDone = !!doneMap[g.time];
      if (isDone && !was) {
        setSettling((prev) => ({ ...prev, [g.time]: true }));
        const existing = settleTimersRef.current[g.time];
        if (existing) window.clearTimeout(existing);
        settleTimersRef.current[g.time] = window.setTimeout(() => {
          scrollRestoreRef.current = window.scrollY;
          setSettling((prev) => ({ ...prev, [g.time]: false }));
        }, reduceMotion ? 0 : SETTLE_MS);
      } else if (!isDone && was) {
        // Unchecked back out of a completed section (possibly mid-settle) —
        // drop the hold immediately so it re-sorts as incomplete right away
        // instead of waiting out a stale timer.
        const existing = settleTimersRef.current[g.time];
        if (existing) window.clearTimeout(existing);
        setSettling((prev) => ({ ...prev, [g.time]: false }));
      }
    }
    prevDoneRef.current = doneMap;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checks]);

  useEffect(() => {
    const timers = settleTimersRef.current;
    return () => {
      Object.values(timers).forEach((id) => id && window.clearTimeout(id));
    };
  }, []);

  useLayoutEffect(() => {
    if (scrollRestoreRef.current !== null) {
      window.scrollTo(0, scrollRestoreRef.current);
      scrollRestoreRef.current = null;
    }
  }, [settling]);

  // A section only counts as "complete" for ordering purposes once its
  // settle hold has elapsed — this is what makes the reorder and the
  // collapse happen together as one motion instead of the card jumping to
  // the back first and shrinking a beat later.
  function isSettled(time: TimeOfDay): boolean {
    return !!doneMap[time] && !settling[time];
  }

  const incomplete = groups.filter((g) => !isSettled(g.time));
  const complete = groups.filter((g) => isSettled(g.time));

  // The current-time section leads among incomplete ones; a completed
  // section (even if its time matches "now") has nothing left to surface,
  // so it never leads — it's already filtered into `complete` above.
  const currentIdx = now ? incomplete.findIndex((g) => g.time === now) : -1;
  const orderedIncomplete =
    currentIdx > 0
      ? [incomplete[currentIdx], ...incomplete.slice(0, currentIdx), ...incomplete.slice(currentIdx + 1)]
      : incomplete;

  const ordered = [...orderedIncomplete, ...complete];

  return (
    <div className="flex flex-col gap-4">
      {ordered.map((group) => (
        <RoutineSection
          key={group.time}
          time={group.time}
          habits={group.habits}
          checks={checks}
          onToggle={onToggle}
          isCurrent={group.time === now && !doneMap[group.time]}
          collapsed={isSettled(group.time)}
          celebrating={!!settling[group.time]}
          poppedId={poppedId}
          errorId={errorId}
        />
      ))}
    </div>
  );
}

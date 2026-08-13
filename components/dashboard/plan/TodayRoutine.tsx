"use client";

import { useEffect, useState } from "react";
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

export default function TodayRoutine({
  habits,
  checks,
  onToggle,
  poppedId = null,
  errorId = null,
}: TodayRoutineProps) {
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

  // The section matching the live clock moves to the top (with a glow from
  // RoutineSection itself) so opening the app surfaces what's relevant right
  // now; everything else stays visible below in its normal chronological
  // order. Before `now` resolves client-side (first paint / SSR), fall back
  // to plain chronological order rather than guessing.
  const ordered = now
    ? [...groups].sort((a, b) => {
        if (a.time === now) return -1;
        if (b.time === now) return 1;
        return 0;
      })
    : groups;

  return (
    <div className="flex flex-col gap-4">
      {ordered.map((group) => (
        <RoutineSection
          key={group.time}
          time={group.time}
          habits={group.habits}
          checks={checks}
          onToggle={onToggle}
          isCurrent={group.time === now}
          poppedId={poppedId}
          errorId={errorId}
        />
      ))}
    </div>
  );
}

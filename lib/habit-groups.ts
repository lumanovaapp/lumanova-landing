import { DailyHabit, TimeOfDay } from "@/lib/types";

export const TIME_OF_DAY_ORDER: TimeOfDay[] = ["morning", "afternoon", "evening", "anytime"];

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  anytime: "Anytime",
};

const VALID_TIMES = new Set<TimeOfDay>(TIME_OF_DAY_ORDER);

// The single source of truth for "what slot is this habit in" — older plans
// omit the field entirely, and even a freshly-generated one is untrusted
// model/DB JSON at runtime (not statically type-checked), so this guards
// against both a missing value and a garbage one rather than trusting the
// type annotation.
export function habitTimeOfDay(habit: DailyHabit): TimeOfDay {
  return habit.time_of_day && VALID_TIMES.has(habit.time_of_day)
    ? habit.time_of_day
    : "anytime";
}

export interface HabitGroup {
  time: TimeOfDay;
  habits: DailyHabit[];
}

// Groups habits into Morning / Afternoon / Evening / Anytime, in that fixed
// order, and drops empty groups — so a plan that never uses time_of_day (or
// hasn't been regenerated since it was added) still renders as one clean
// "Anytime" section instead of a wall of empty headers.
export function groupHabitsByTimeOfDay(habits: DailyHabit[]): HabitGroup[] {
  const groups: Record<TimeOfDay, DailyHabit[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    anytime: [],
  };

  for (const habit of habits) {
    groups[habitTimeOfDay(habit)].push(habit);
  }

  return TIME_OF_DAY_ORDER.map((time) => ({ time, habits: groups[time] })).filter(
    (group) => group.habits.length > 0
  );
}

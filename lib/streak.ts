import { DailyHabit } from "@/lib/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toDateOnlyUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * MS_PER_DAY);
}

export function dateToStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function phaseForDay(day: number): 1 | 2 | 3 {
  return Math.min(3, Math.ceil(day / 30)) as 1 | 2 | 3;
}

export type DayVisualState = "done" | "frozen" | "missed" | "neutral" | "future";

// The single source of truth for "what color/state is this calendar cell" —
// shared by the week strip and the full 90-day map so they can never
// disagree about the same day. `activeHabitIds` is that day's phase-active
// habit set; `doneMap` is the check-in map for that specific date.
export function computeDayVisualState(params: {
  dateStr: string;
  todayStr: string;
  activeHabitIds: string[];
  doneMap: Record<string, boolean> | undefined;
  isFrozen: boolean;
}): DayVisualState {
  const { dateStr, todayStr, activeHabitIds, doneMap, isFrozen } = params;
  const allDone =
    activeHabitIds.length > 0 && activeHabitIds.every((id) => doneMap?.[id]);
  if (dateStr > todayStr) return "future";
  if (allDone) return "done";
  if (dateStr < todayStr) return isFrozen ? "frozen" : "missed";
  return "neutral";
}

export interface CheckinRow {
  habit_id: string;
  date: string;
  done: boolean;
}

// One boolean per day from plan start through today (inclusive, capped at 90):
// true only if every habit active that day was checked done on that date.
// Fixed dates — a day that's never checked simply stays false, it never shifts.
export function buildDoneFlags(
  planCreatedAt: string,
  habits: DailyHabit[],
  checkinRows: CheckinRow[]
): boolean[] {
  const checkinMap = new Map<string, Set<string>>();
  for (const row of checkinRows) {
    if (!row.done) continue;
    if (!checkinMap.has(row.date)) checkinMap.set(row.date, new Set());
    checkinMap.get(row.date)!.add(row.habit_id);
  }

  const planStart = toDateOnlyUTC(new Date(planCreatedAt));
  const today = toDateOnlyUTC(new Date());
  const totalDays = Math.min(
    90,
    Math.max(0, Math.round((today.getTime() - planStart.getTime()) / MS_PER_DAY) + 1)
  );

  const doneFlags: boolean[] = [];
  for (let i = 0; i < totalDays; i++) {
    const dayNumber = i + 1;
    const phase = phaseForDay(dayNumber);
    const activeHabitIds = habits
      .filter((h) => h.phase_start <= phase)
      .map((h) => h.id);
    const doneSet = checkinMap.get(dateToStr(addDays(planStart, i)));
    doneFlags.push(
      activeHabitIds.length > 0 && activeHabitIds.every((id) => doneSet?.has(id) ?? false)
    );
  }
  return doneFlags;
}

export interface StreakState {
  current: number;
  best: number;
  freezes: number;
  lastFreezeAward: number;
  // 0-based indices into the doneFlags array that were bridged by a freeze.
  frozenDayIndices: number[];
}

const FREEZE_CAP = 2;
const AWARD_THRESHOLDS = [7, 30];

// Pure, deterministic replay over the full (fixed) history of done/missed
// days. Re-running it from scratch always yields the same answer, so there's
// no "already spent that freeze" bookkeeping to get out of sync — the
// freeze/award state is entirely derived from doneFlags each time.
//
// The last entry (today) is treated specially: if it's not yet done, it's
// still in progress, not "missed" — it neither breaks the streak nor
// consumes a freeze. Only days strictly before today are finalized enough
// to trigger freeze consumption or a reset.
export function computeStreakState(doneFlags: boolean[]): StreakState {
  let current = 0;
  let best = 0;
  let freezes = 0;
  let lastFreezeAward = 0;
  const frozenDayIndices: number[] = [];
  const todayIndex = doneFlags.length - 1;

  doneFlags.forEach((done, i) => {
    if (done) {
      current += 1;
      for (const threshold of AWARD_THRESHOLDS) {
        if (current >= threshold && lastFreezeAward < threshold) {
          freezes = Math.min(FREEZE_CAP, freezes + 1);
          lastFreezeAward = threshold;
        }
      }
      best = Math.max(best, current);
    } else if (i !== todayIndex) {
      if (freezes > 0) {
        freezes -= 1;
        frozenDayIndices.push(i);
      } else {
        current = 0;
        lastFreezeAward = 0;
      }
    }
  });

  return { current, best, freezes, lastFreezeAward, frozenDayIndices };
}

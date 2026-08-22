import type { LucideIcon } from "lucide-react";
import { Check, X, Snowflake, Lock } from "lucide-react";
import type { DayVisualState } from "@/lib/streak";

// The single source of truth for calendar day-cell STYLING (colors, icons,
// labels — what state a day is in remains entirely owned by
// computeDayVisualState in lib/streak.ts). Shared by the week strip and the
// full 90-day map so a "done" or "missed" day always looks and reads
// identically in both places.
//
// Design rule: gold is an accent, never a large surface. Every cell keeps a
// dark, quiet background — states are told apart by border color/style
// (solid vs. dashed), a small state pill, and (for "today") a soft glow.
// No cell gets a solid gold fill.
export type DayCellState = "done" | "today" | "missed" | "frozen" | "upcoming";

// `visualState` is the raw state from computeDayVisualState; `isToday` is
// the existing today/date comparison each caller already computes. "Today"
// takes visual priority over "done" so the current day is always the single
// glowing point on the map, even once it's been checked off.
export function resolveDayCellState(
  visualState: DayVisualState,
  isToday: boolean
): DayCellState {
  if (isToday) return "today";
  if (visualState === "done") return "done";
  if (visualState === "frozen") return "frozen";
  if (visualState === "missed") return "missed";
  return "upcoming";
}

interface DayCellStyle {
  // Background + border (solid/dashed) + glow (today only).
  cell: string;
  // Day number text color/weight.
  number: string;
  // Bottom-of-cell state pill — "" for upcoming, which has no pill fill.
  badgeBg: string;
  // null for "today": its glowing border already says enough, no icon needed.
  badgeIcon: LucideIcon | null;
  badgeIconColor: string;
  badgeText: string;
  badgeTextColor: string;
}

export const DAY_CELL_STYLES: Record<DayCellState, DayCellStyle> = {
  done: {
    cell: "bg-[#1f1809] border border-[#3d2f14]",
    number: "text-[#f0c766] font-medium",
    badgeBg: "bg-[#2a2110]",
    badgeIcon: Check,
    badgeIconColor: "text-[#e0a92e]",
    badgeText: "Done",
    badgeTextColor: "text-[#e0a92e]",
  },
  today: {
    cell: "bg-[#1f1809] border-[1.5px] border-[#e0a92e] shadow-[0_0_14px_rgba(224,169,46,0.30)]",
    number: "text-[#f5d488] font-bold",
    badgeBg: "bg-[#3a2c10]",
    badgeIcon: null,
    badgeIconColor: "",
    badgeText: "Today",
    badgeTextColor: "text-[#f0c766]",
  },
  // Solid border + × mark + maroon label: a day that passed and was
  // skipped. Kept visually distinct from "upcoming" (dashed, no × mark,
  // heavily faded) so the two can never be confused at a glance.
  missed: {
    cell: "bg-[#1a1510] border border-[#2a2018]",
    number: "text-[#7a6552] font-normal",
    badgeBg: "bg-[#231913]",
    badgeIcon: X,
    badgeIconColor: "text-[#9a6a5a]",
    badgeText: "Missed",
    badgeTextColor: "text-[#9a6a5a]",
  },
  frozen: {
    cell: "bg-[#12202a] border border-[#234656]",
    number: "text-[#9fd0e5] font-medium",
    badgeBg: "bg-[#16323f]",
    badgeIcon: Snowflake,
    badgeIconColor: "text-[#6bb6d6]",
    badgeText: "Frozen",
    badgeTextColor: "text-[#8fc4dd]",
  },
  // Dashed border: a day that hasn't arrived yet. The solid-vs-dashed
  // border is the instant visual tell against "missed".
  upcoming: {
    cell: "bg-[#131009] border border-dashed border-[#221c12]",
    number: "text-[#3f3a2c] font-normal",
    badgeBg: "",
    badgeIcon: Lock,
    badgeIconColor: "text-[#4a4436]",
    badgeText: "Upcoming",
    badgeTextColor: "text-[#4a4436]",
  },
};

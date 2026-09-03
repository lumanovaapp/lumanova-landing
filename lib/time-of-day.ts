import { TimeOfDay } from "@/lib/types";

export interface TimeOfDaySectionTheme {
  label: string;
  // lucide-react icon name, resolved where it's rendered (see badges.ts for
  // the same pattern) — keeps this module plain data.
  icon: string;
  border: string;
  bgSoft: string;
  bgGradient: string;
  text: string;
  ring: string;
  // Ambient glow applied only to whichever section matches the live clock.
  glow: string;
}

// Morning/afternoon/evening each get one of the app's existing brand accents
// (no new palette entries) so the routine reads as high-contrast and
// deliberately color-coded without introducing a fifth hue. Anytime stays
// neutral — it's a small catch-all, not one of the three main routine beats.
export const TIME_OF_DAY_THEME: Record<TimeOfDay, TimeOfDaySectionTheme> = {
  morning: {
    label: "Morning",
    icon: "Sunrise",
    border: "border-lumen-gold/30",
    bgSoft: "bg-lumen-gold/10",
    bgGradient: "bg-gradient-to-br from-lumen-gold/[0.14] to-lumen-gold/[0.02]",
    text: "text-lumen-gold",
    ring: "shadow-[0_0_0_3px_rgba(244,196,48,0.22)]",
    glow: "shadow-[0_0_36px_rgba(244,196,48,0.16)]",
  },
  afternoon: {
    label: "Afternoon",
    icon: "CloudSun",
    border: "border-aurora-mist/30",
    bgSoft: "bg-aurora-mist/10",
    bgGradient: "bg-gradient-to-br from-aurora-mist/[0.14] to-aurora-mist/[0.02]",
    text: "text-aurora-mist",
    ring: "shadow-[0_0_0_3px_rgba(127,224,211,0.22)]",
    glow: "shadow-[0_0_36px_rgba(127,224,211,0.14)]",
  },
  evening: {
    label: "Evening",
    icon: "Moon",
    border: "border-badge-violet/30",
    bgSoft: "bg-badge-violet/10",
    bgGradient: "bg-gradient-to-br from-badge-violet/[0.14] to-badge-violet/[0.02]",
    text: "text-badge-violet",
    ring: "shadow-[0_0_0_3px_rgba(182,156,255,0.22)]",
    glow: "shadow-[0_0_36px_rgba(182,156,255,0.16)]",
  },
  anytime: {
    label: "Anytime",
    icon: "Sparkles",
    border: "border-white/[0.1]",
    bgSoft: "bg-white/5",
    bgGradient: "bg-gradient-to-b from-white/[0.04] to-white/[0.01]",
    text: "text-cream-ivory/70",
    ring: "shadow-[0_0_0_3px_rgba(255,255,255,0.08)]",
    glow: "shadow-[0_0_24px_rgba(255,255,255,0.06)]",
  },
};

// Client-side "what part of the day is it right now" — used purely to
// decide which routine section gets expanded-to-the-top + a glow, so opening
// the app surfaces whatever's relevant now. Rough, human-legible boundaries;
// unrelated to (and never written into) a habit's own time_of_day.
export function getCurrentTimeOfDay(date: Date = new Date()): "morning" | "afternoon" | "evening" {
  const hour = date.getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

// --- Forgiving time-lock for checking a section off ------------------------
//
// Goal: stop obvious back-fill (ticking tonight's evening routine at 8am, or
// retroactively completing a whole day at 11pm) WITHOUT punishing real life.
// So the windows are deliberately generous:
//   - `startHour`: a section can't be checked before its part of the day has
//     actually begun. This is the anti-back-fill rule.
//   - `lockHour`: a generous grace past the window's natural end. After this,
//     an unchecked section locks for the day. Kept late so a normal
//     evening check-in still lets you complete the day.
// "anytime" has no window — always checkable.
//
// All hours are the user's LOCAL clock (these run client-side only).
type LockableTime = Exclude<TimeOfDay, "anytime">;

export const SECTION_CHECK_WINDOWS: Record<LockableTime, { startHour: number; lockHour: number }> = {
  // Checkable from the start of the day until ~6pm.
  morning: { startHour: 0, lockHour: 18 },
  // Not before noon; checkable until ~10pm.
  afternoon: { startHour: 12, lockHour: 22 },
  // Not before ~5pm; checkable for the rest of the day.
  evening: { startHour: 17, lockHour: 24 },
};

export type SectionLockState = "open" | "too-early" | "locked";

// "open"      — inside the (generous) window, habits are checkable now.
// "too-early" — its part of the day hasn't started; checking is blocked so
//               the day can't be back-filled ahead of time.
// "locked"    — past the generous grace; an unchecked section is done for the
//               day (it simply never gets a done check-in, so the streak
//               reflects reality — no separate streak bookkeeping needed).
export function sectionLockState(
  time: TimeOfDay,
  now: Date = new Date()
): SectionLockState {
  if (time === "anytime") return "open";
  const { startHour, lockHour } = SECTION_CHECK_WINDOWS[time];
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour < startHour) return "too-early";
  if (hour >= lockHour) return "locked";
  return "open";
}

// Short, non-punishing copy for a section that can't be checked right now.
export function sectionLockLabel(time: LockableTime, state: "too-early" | "locked"): string {
  if (state === "too-early") {
    return time === "afternoon" ? "Opens at midday" : "Opens this evening";
  }
  return "Locked for today — pick it back up tomorrow";
}

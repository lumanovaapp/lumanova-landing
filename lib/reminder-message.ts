import { DailyHabit } from "@/lib/types";
import { groupHabitsByTimeOfDay, TIME_OF_DAY_LABELS } from "@/lib/habit-groups";

export interface ReminderMessage {
  subject: string;
  // One-line hook naming what's specifically left, e.g. "You haven't done
  // your morning routine yet — keep your 5-day streak alive 🔥".
  headline: string;
  // Comma-joined habit labels still undone, for the email body's checklist —
  // this is what makes the nudge "specific" rather than generic.
  remainingLabels: string[];
}

// The single place that decides what a reminder actually says. Given only
// the plan's still-incomplete habits for today and the user's current streak
// (both already computed by the caller), picks the most specific phrasing:
// naming the one habit left, the one time-of-day section that's entirely
// undone, or just the count — always paired with the streak when there is
// one to protect, matching Lumanova's encouraging, no-guilt voice used
// elsewhere (see DailyCoachLine, TomorrowTeaser).
export function buildReminderMessage(
  incompleteHabits: DailyHabit[],
  currentStreak: number
): ReminderMessage {
  const count = incompleteHabits.length;
  const groups = groupHabitsByTimeOfDay(incompleteHabits);
  // Only true when every remaining habit falls in the same slot — i.e. that
  // whole section of the day is untouched, not just one habit within it.
  const wholeSectionUndone = groups.length === 1;

  const tail =
    currentStreak > 0
      ? `keep your ${currentStreak}-day streak alive 🔥`
      : "finish strong 💪";

  let subject: string;
  let lead: string;

  if (wholeSectionUndone) {
    const label = TIME_OF_DAY_LABELS[groups[0].time];
    subject = `Your ${label.toLowerCase()} routine is waiting`;
    lead = `You haven't done your ${label.toLowerCase()} routine yet`;
  } else if (count === 1) {
    subject = "1 habit left today";
    lead = "1 habit left today";
  } else {
    subject = `${count} habits left today`;
    lead = `${count} habits left today`;
  }

  return {
    subject,
    headline: `${lead} — ${tail}`,
    remainingLabels: incompleteHabits.map((h) => h.label),
  };
}

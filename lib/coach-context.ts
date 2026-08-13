import { Analysis, Plan } from "@/lib/types";
import { phaseForDay } from "@/lib/streak";
import { ACCENT_LABELS } from "@/lib/accent";

// Shared by /api/coach (live chat replies) and lib/daily-coach-line.ts (the
// cached once-a-day dashboard line) so both are grounded in identical
// context, built the same way, from the same inputs.

export function computePlanDay(createdAt: string): number {
  const start = new Date(createdAt);
  const startUTC = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  );
  const now = new Date();
  const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const day = Math.floor((nowUTC - startUTC) / 86400000) + 1;
  return Math.min(90, Math.max(1, day));
}

export function buildContextBlock(
  analysis: Analysis | null,
  plan: Plan | null,
  planCreatedAt: string | null,
  streak: { current_streak: number; longest_streak: number } | null
): string {
  const lines: string[] = ["USER CONTEXT:"];

  if (!analysis) {
    lines.push(
      "Analysis: none yet — the user hasn't run a photo scan, so there are no personalized findings. Nudge them to run one before giving specific product/technique recommendations."
    );
  } else {
    lines.push(`Analysis summary: ${analysis.summary}`);
    if (analysis.focus_areas.length > 0) {
      lines.push(`Focus areas: ${analysis.focus_areas.join(", ")}`);
    }
    if (analysis.categories.length > 0) {
      const categoryLines = analysis.categories
        .map((c) => {
          const topRecommendation = c.recommendations[0];
          const styleNote = c.style_suggestion
            ? ` [suggested style: ${c.style_suggestion}]`
            : "";
          return `${c.name} (${ACCENT_LABELS[c.priority]})${
            topRecommendation ? ` — ${topRecommendation}` : ""
          }${styleNote}`;
        })
        .join("; ");
      lines.push(`Key findings: ${categoryLines}`);
    }
  }

  if (plan && planCreatedAt) {
    const day = computePlanDay(planCreatedAt);
    const phaseNumber = phaseForDay(day);
    const phase = plan.phases.find((p) => p.number === phaseNumber);
    lines.push(
      `Current plan phase: Phase ${phaseNumber}${
        phase ? ` ${phase.title}` : ""
      } (Day ${day}/90)${phase ? `, focus: ${phase.focus}` : ""}.`
    );
  } else {
    lines.push(
      "Current plan phase: no active 90-day plan yet — nudge them to generate one from their analysis."
    );
  }

  const current = streak?.current_streak ?? 0;
  const best = streak?.longest_streak ?? 0;
  lines.push(`Streak: ${current} days (best ${best}).`);

  return lines.join("\n");
}

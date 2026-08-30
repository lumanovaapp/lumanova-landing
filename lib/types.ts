export type CategoryPriority = "maintain" | "refine" | "focus";

export interface AnalysisZone {
  x: number;
  y: number;
}

export interface AnalysisCategory {
  name: string;
  observations: string[];
  recommendations: string[];
  priority: CategoryPriority;
  zone: AnalysisZone;
  // Hair-only: a concrete cut/style direction hedged to what's visible in
  // the photo. Absent for every other category, and for analyses saved
  // before this field existed — always optional, never assume it's there.
  style_suggestion?: string;
}

export type SkinUndertone = "warm" | "cool" | "neutral" | "unknown";
export type SkinDepth = "light" | "medium" | "deep" | "unknown";

export interface SkinTone {
  undertone: SkinUndertone;
  depth: SkinDepth;
}

export interface Analysis {
  summary: string;
  categories: AnalysisCategory[];
  quick_wins: string[];
  focus_areas: string[];
  // Structured skin-tone read — separate from any mention of tone/undertone
  // inside the Skin category's free-text "observations" (that's prose for a
  // person to read; this is the field downstream code actually type-matches
  // on, e.g. the Style & Color guide — see lib/style-guide.ts). "unknown" on
  // either field when the model genuinely couldn't tell from the photo,
  // never a guess. Absent on analyses saved before this field existed.
  skin_tone?: SkinTone;
}

export type PhaseNumber = 1 | 2 | 3;

export interface Phase {
  number: PhaseNumber;
  title: string;
  day_range: string;
  focus: string;
  milestones: string[];
}

export type TimeOfDay = "morning" | "afternoon" | "evening" | "anytime";

export type HabitCategory = "skin" | "hair" | "beard" | "style";

export type HabitDifficulty = "easy" | "moderate" | "advanced";

// The free / kitchen-first way to do a habit — something the user most
// likely already owns (ice from the freezer, a clean towel, rice water).
// Always the FIRST option shown, and visually the highlighted one.
export interface HabitNaturalOption {
  text: string;
}

// An OPTIONAL shop-bought upgrade, named only as a product CATEGORY — never
// a brand. `budget` is a rough price hint like "~$8" when the model gave one.
export interface HabitProductOption {
  category: string;
  budget?: string;
}

export interface DailyHabit {
  id: string;
  label: string;
  // A one-line summary of the habit. Still required: it's what the compact
  // calendar day-drawer list renders, and it's the fallback the habit card
  // shows when the structured fields below are absent (older plans).
  detail: string;
  phase_start: PhaseNumber;
  // Absent on plans generated before this field existed — treat as
  // "anytime" rather than assuming a slot. Use habitTimeOfDay() from
  // lib/habit-groups.ts instead of reading this directly, since it also
  // guards against an invalid/unexpected value from the model.
  time_of_day?: TimeOfDay;
  // Which real-world area this habit targets. Absent on plans generated
  // before this field existed, or normalized away server-side if the model
  // returned something unrecognized — see normalizeHabits in
  // app/api/generate-plan/route.ts. Lets a consumer find e.g. "the style
  // habit" (see lib/style-guide.ts) without guessing from label/detail text.
  category?: HabitCategory;

  // --- Structured presentation fields (added 2026-08-30). Every one is
  // optional: plans generated before this schema existed carry only
  // `detail`, and HabitCard falls back to rendering that single line when
  // these are missing. normalizeHabits() in app/api/generate-plan/route.ts
  // sanitizes whatever the model returns into these shapes (or drops it). ---

  // Rough minutes this habit takes, for the card's meta row.
  time_minutes?: number;
  difficulty?: HabitDifficulty;
  // The "what to do" — a few short imperative lines, shown as an ordered
  // list (collapsed behind a tap-to-expand once past the first couple).
  steps?: string[];
  // One brief sentence on why the habit works — shown brighter than the
  // old grey detail line.
  why_it_works?: string;
  natural_option?: HabitNaturalOption;
  product_option?: HabitProductOption;
}

export type BeardType = "full" | "stubble" | "clean-shaven" | "patchy" | "unknown";
export type HairType = "curly" | "wavy" | "straight" | "coily" | "unknown";
export type SkinType = "oily" | "dry" | "combination" | "normal" | "unknown";

// The model's read on the user's actual type, inferred from their analysis —
// captured so the rest of the app (e.g. a future matched target-look image)
// can reuse it instead of re-deriving it. Each dimension is "unknown" when
// the model didn't have enough signal, never guessed.
export interface ProfileTypes {
  beard: BeardType;
  hair: HairType;
  skin: SkinType;
}

export interface Plan {
  overview: string;
  phases: Phase[];
  daily_habits: DailyHabit[];
  // Absent on plans generated before this field existed.
  profile_types?: ProfileTypes;
  // Set server-side after the model responds (never part of the model's own
  // JSON schema/output — see normalizeHabits in app/api/generate-plan for
  // the same pattern with habit ids). Records which analyzed photo this
  // plan's content was generated from, so the UI can tell whether a newer
  // analysis exists that hasn't been folded into the plan yet — see
  // app/dashboard/upload/[id]/page.tsx. Absent on plans generated before
  // this field existed.
  source_photo_id?: string;
}

export type PhotoMilestone = "baseline" | "day_30" | "day_60" | "day_90";

export interface Comparison {
  headline: string;
  improvements: string[];
  keep_working: string[];
  next_focus: string;
}

export interface MilestonePhotoSummary {
  id: string;
  status: "analyzing" | "complete" | "failed";
  comparison: Comparison | null;
  photoUrl: string | null;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}

export type BadgeCategory = "streak" | "consistency" | "milestone";

// Static catalog entry — not a DB row. `icon` is a lucide-react component
// name (e.g. "Flame"), resolved to the actual component only where it's
// rendered, so this stays a plain data module importable from server code.
export interface Badge {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
}

// A plain object type (not `interface`) — same reasoning as ChatMessageRow:
// postgrest-js's generic constraint checking needs a structural
// Record<string, unknown>-compatible shape for anything used as a Table Row.
export type Achievement = {
  id: string;
  user_id: string;
  badge_key: string;
  unlocked_at: string;
};

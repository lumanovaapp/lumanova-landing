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

export interface Analysis {
  summary: string;
  categories: AnalysisCategory[];
  quick_wins: string[];
  focus_areas: string[];
}

export type PhaseNumber = 1 | 2 | 3;

export interface Phase {
  number: PhaseNumber;
  title: string;
  day_range: string;
  focus: string;
  milestones: string[];
}

export interface DailyHabit {
  id: string;
  label: string;
  detail: string;
  phase_start: PhaseNumber;
}

export interface Plan {
  overview: string;
  phases: Phase[];
  daily_habits: DailyHabit[];
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

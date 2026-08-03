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

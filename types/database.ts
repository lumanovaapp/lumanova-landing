import { Analysis, Comparison, Plan, PhotoMilestone } from "@/lib/types";

export type Ethnicity =
  | "south_asian"
  | "east_asian"
  | "latino"
  | "african"
  | "middle_eastern"
  | "southeast_asian"
  | "mixed"
  | "other";

export type Goal =
  | "skincare"
  | "grooming"
  | "fitness"
  | "confidence"
  | "sleep"
  | "style";

export type PhotoStatus = "analyzing" | "complete" | "failed";

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  age: number | null;
  ethnicity: Ethnicity | null;
  goals: Goal[] | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Photo = {
  id: string;
  user_id: string;
  storage_path: string;
  status: PhotoStatus;
  analysis: Analysis | null;
  photo_type: PhotoMilestone | null;
  comparison: Comparison | null;
  created_at: string;
};

export type PlanRow = {
  id: string;
  user_id: string;
  plan_json: Plan;
  created_at: string;
};

export type DailyCheckin = {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  done: boolean;
};

export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
  freezes: number;
  last_freeze_award: number;
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Partial<User> & { id: string; email: string };
        Update: Partial<User>;
        Relationships: [];
      };
      photos: {
        Row: Photo;
        Insert: Partial<Photo> & { user_id: string; storage_path: string };
        Update: Partial<Photo>;
        Relationships: [];
      };
      plans: {
        Row: PlanRow;
        Insert: Partial<PlanRow> & { user_id: string; plan_json: Plan };
        Update: Partial<PlanRow>;
        Relationships: [];
      };
      daily_checkins: {
        Row: DailyCheckin;
        Insert: Partial<DailyCheckin> & {
          user_id: string;
          habit_id: string;
          date: string;
          done: boolean;
        };
        Update: Partial<DailyCheckin>;
        Relationships: [];
      };
      streaks: {
        Row: Streak;
        Insert: Partial<Streak> & { user_id: string };
        Update: Partial<Streak>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

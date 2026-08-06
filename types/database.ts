import { Analysis, Comparison, Plan, PhotoMilestone, ChatRole, Achievement } from "@/lib/types";

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
  // Separate from `onboarding_completed` (the profile-setup wizard at
  // /onboarding) — this tracks whether the user has been offered the
  // dashboard product tour, so it doesn't show again after they take it
  // or skip it.
  onboarded: boolean;
  // 'HH:MM' 24h local time — no timezone stored, interpreted client-side.
  reminder_enabled: boolean;
  reminder_time: string;
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

// A plain object type (not the `ChatMessage` interface from lib/types) —
// interfaces don't structurally satisfy the Record<string, unknown> bound
// postgrest-js's generic constraint checking needs, which silently collapses
// every table's Row type to `never` if one slips into the Tables map.
export type ChatMessageRow = {
  id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
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
      chat_messages: {
        Row: ChatMessageRow;
        Insert: Partial<ChatMessageRow> & {
          user_id: string;
          role: ChatRole;
          content: string;
        };
        Update: Partial<ChatMessageRow>;
        Relationships: [];
      };
      achievements: {
        Row: Achievement;
        Insert: Partial<Achievement> & { user_id: string; badge_key: string };
        Update: Partial<Achievement>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

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

export type PhotoType = "baseline" | "day_30" | "day_60" | "day_90";

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
  photo_type: PhotoType;
  created_at: string;
};

export type Plan = {
  id: string;
  user_id: string;
  plan_json: Record<string, unknown>;
  day_started: string;
  current_day: number;
  created_at: string;
};

export type DailyCheckin = {
  id: string;
  user_id: string;
  date: string;
  habits_completed: string[];
  notes: string | null;
  created_at: string;
};

export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
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
        Insert: Partial<Photo> & { user_id: string; storage_path: string; photo_type: PhotoType };
        Update: Partial<Photo>;
        Relationships: [];
      };
      plans: {
        Row: Plan;
        Insert: Partial<Plan> & { user_id: string; plan_json: Record<string, unknown> };
        Update: Partial<Plan>;
        Relationships: [];
      };
      daily_checkins: {
        Row: DailyCheckin;
        Insert: Partial<DailyCheckin> & { user_id: string; date: string };
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

import { Badge, BadgeCategory } from "@/lib/types";

// Full static badge catalog. Locked/unlocked state is never stored here —
// it's derived at read time from the achievements table (only unlocked
// badges are persisted; everything else in this list is implicitly locked).
export const BADGES: Badge[] = [
  // Streak
  {
    key: "streak_7",
    title: "Week Warrior",
    description: "Reach a 7-day streak.",
    icon: "Flame",
    category: "streak",
  },
  {
    key: "streak_30",
    title: "Locked In",
    description: "Reach a 30-day streak.",
    icon: "Flame",
    category: "streak",
  },
  {
    key: "streak_60",
    title: "Unstoppable",
    description: "Reach a 60-day streak.",
    icon: "Flame",
    category: "streak",
  },
  {
    key: "streak_90",
    title: "90-Day Legend",
    description: "Finish the full 90-day plan.",
    icon: "Crown",
    category: "streak",
  },
  // Consistency
  {
    key: "habits_10",
    title: "Getting Started",
    description: "Complete 10 habit check-ins.",
    icon: "CheckCircle2",
    category: "consistency",
  },
  {
    key: "habits_50",
    title: "Committed",
    description: "Complete 50 habit check-ins.",
    icon: "Target",
    category: "consistency",
  },
  {
    key: "habits_100",
    title: "Century",
    description: "Complete 100 habit check-ins.",
    icon: "Medal",
    category: "consistency",
  },
  {
    key: "habits_250",
    title: "Devoted",
    description: "Complete 250 habit check-ins.",
    icon: "Trophy",
    category: "consistency",
  },
  // Milestone
  {
    key: "photo_baseline",
    title: "First Look",
    description: "Upload your baseline analysis photo.",
    icon: "Camera",
    category: "milestone",
  },
  {
    key: "photo_day30",
    title: "30-Day Glow",
    description: "Upload your day-30 progress photo.",
    icon: "Sparkles",
    category: "milestone",
  },
  {
    key: "photo_day60",
    title: "Halfway Hero",
    description: "Upload your day-60 progress photo.",
    icon: "Star",
    category: "milestone",
  },
  {
    key: "photo_day90",
    title: "Transformation",
    description: "Upload your day-90 progress photo.",
    icon: "Award",
    category: "milestone",
  },
];

export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  streak: "Streak",
  consistency: "Consistency",
  milestone: "Milestone",
};

export const BADGE_CATEGORY_ORDER: BadgeCategory[] = [
  "streak",
  "consistency",
  "milestone",
];

export function getBadge(key: string): Badge | undefined {
  return BADGES.find((badge) => badge.key === key);
}

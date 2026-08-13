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

export interface BadgeCategoryTheme {
  text: string;
  dot: string;
  iconBg: string;
  border: string;
  hoverBorder: string;
  cardGradient: string;
  glow: string;
}

// One distinct, jewel-toned accent per badge category (unlocked state only —
// locked badges stay uniformly dimmed regardless of category so "locked"
// reads as one consistent state at a glance).
// streak = warm gold/amber (fire), consistency = teal/emerald, milestone = violet.
export const BADGE_CATEGORY_THEME: Record<BadgeCategory, BadgeCategoryTheme> = {
  streak: {
    text: "text-lumen-gold",
    dot: "bg-lumen-gold",
    iconBg: "bg-lumen-gold/15",
    border: "border-lumen-gold/25",
    hoverBorder: "hover:border-lumen-gold/45",
    cardGradient: "bg-gradient-to-br from-lumen-gold/[0.08] to-lumen-gold/[0.02]",
    glow: "shadow-[0_0_24px_rgba(244,196,48,0.10)]",
  },
  consistency: {
    text: "text-aurora-mist",
    dot: "bg-aurora-mist",
    iconBg: "bg-aurora-mist/15",
    border: "border-aurora-mist/25",
    hoverBorder: "hover:border-aurora-mist/45",
    cardGradient: "bg-gradient-to-br from-aurora-mist/[0.08] to-aurora-mist/[0.02]",
    glow: "shadow-[0_0_24px_rgba(127,224,211,0.10)]",
  },
  milestone: {
    text: "text-badge-violet",
    dot: "bg-badge-violet",
    iconBg: "bg-badge-violet/15",
    border: "border-badge-violet/25",
    hoverBorder: "hover:border-badge-violet/45",
    cardGradient: "bg-gradient-to-br from-badge-violet/[0.08] to-badge-violet/[0.02]",
    glow: "shadow-[0_0_24px_rgba(182,156,255,0.10)]",
  },
};

export function getBadge(key: string): Badge | undefined {
  return BADGES.find((badge) => badge.key === key);
}

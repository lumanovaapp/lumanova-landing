import {
  Flame,
  Crown,
  CheckCircle2,
  Target,
  Medal,
  Trophy,
  Camera,
  Sparkles,
  Star,
  Award,
  Lock,
  LucideIcon,
} from "lucide-react";

// Only the icons actually used by lib/badges.ts — an explicit map instead of
// `import * as Icons from "lucide-react"` so this doesn't pull the entire
// icon set into the bundle just to resolve a handful of names.
const ICONS: Record<string, LucideIcon> = {
  Flame,
  Crown,
  CheckCircle2,
  Target,
  Medal,
  Trophy,
  Camera,
  Sparkles,
  Star,
  Award,
  Lock,
};

interface BadgeIconProps {
  name: string;
  className?: string;
}

export default function BadgeIcon({ name, className }: BadgeIconProps) {
  const Icon = ICONS[name] ?? Award;
  return <Icon className={className} />;
}

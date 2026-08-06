import {
  Home,
  Camera,
  FileText,
  MessageCircle,
  Trophy,
  HelpCircle,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  href: string | null;
  icon: LucideIcon;
  // Optional data-tour target for the guided tour to hook into — see
  // lib/tour-steps.ts. Only nav items the tour highlights need one.
  tourTarget?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
  {
    key: "upload",
    label: "Upload Photo",
    href: "/dashboard/upload",
    icon: Camera,
    tourTarget: "tour-nav-upload",
  },
  { key: "plan", label: "90-Day Plan", href: "/dashboard/plan", icon: FileText },
  {
    key: "coach",
    label: "AI Coach",
    href: "/dashboard/coach",
    icon: MessageCircle,
    tourTarget: "tour-nav-coach",
  },
  {
    key: "achievements",
    label: "Achievements",
    href: "/dashboard/achievements",
    icon: Trophy,
    tourTarget: "tour-nav-achievements",
  },
  { key: "help", label: "Help", href: "/dashboard/help", icon: HelpCircle },
  { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
];

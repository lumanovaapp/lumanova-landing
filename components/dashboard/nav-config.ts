import {
  Home,
  Camera,
  FileText,
  CheckSquare,
  MessageCircle,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  href: string | null;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
  { key: "upload", label: "Upload Photo", href: "/dashboard/upload", icon: Camera },
  { key: "plan", label: "90-Day Plan", href: "/dashboard/plan", icon: FileText },
  { key: "habits", label: "Habits", href: null, icon: CheckSquare },
  { key: "coach", label: "AI Coach", href: null, icon: MessageCircle },
  { key: "settings", label: "Settings", href: null, icon: Settings },
];

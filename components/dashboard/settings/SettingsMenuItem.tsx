"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, KeyRound, AlertTriangle, type LucideIcon } from "lucide-react";
import SettingsCard from "./SettingsCard";

// Server Components can't pass a lucide icon (a function component) as a
// prop into a Client Component — only plain serializable data crosses that
// boundary. Callers pass a name string instead; the actual icon component
// is resolved right here, inside the client module, where importing it
// doesn't cross anything.
const ICONS = {
  "key-round": KeyRound,
  "alert-triangle": AlertTriangle,
} as const satisfies Record<string, LucideIcon>;

export type SettingsMenuIconName = keyof typeof ICONS;

interface SettingsMenuItemProps {
  href: string;
  icon: SettingsMenuIconName;
  label: string;
  description: string;
  variant?: "default" | "danger";
  delay?: number;
}

// A settings row that navigates to a dedicated sub-page (Security, Danger
// Zone) instead of expanding inline — keeps sensitive flows like
// change-password and delete-account off the main settings page entirely.
export default function SettingsMenuItem({
  href,
  icon,
  label,
  description,
  variant = "default",
  delay = 0,
}: SettingsMenuItemProps) {
  const Icon = ICONS[icon];
  const isDanger = variant === "danger";

  return (
    <SettingsCard delay={delay} variant={variant}>
      <motion.div whileHover={{ x: 2 }}>
        <Link href={href} className="focus-gold group flex items-center gap-4">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDanger ? "bg-red-500/10" : "bg-lumen-gold/10"
            }`}
          >
            <Icon className={`w-4 h-4 ${isDanger ? "text-red-400" : "text-lumen-gold"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-manrope font-semibold text-cream-ivory">{label}</h3>
            <p className="text-sm text-cream-ivory/50 mt-0.5">{description}</p>
          </div>
          <ChevronRight
            className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${
              isDanger
                ? "text-red-400/40 group-hover:text-red-400/70"
                : "text-cream-ivory/30 group-hover:text-lumen-gold"
            }`}
          />
        </Link>
      </motion.div>
    </SettingsCard>
  );
}

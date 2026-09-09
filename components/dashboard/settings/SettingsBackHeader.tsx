"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface SettingsBackHeaderProps {
  title: string;
  backHref: string;
  backLabel?: string;
  variant?: "default" | "danger";
}

// Shared header for every settings sub-page (Security, Change Password,
// Danger Zone) — back link + title, so the multi-page flow reads as one
// consistent drill-down instead of four differently-styled pages.
export default function SettingsBackHeader({
  title,
  backHref,
  backLabel = "Back",
  variant = "default",
}: SettingsBackHeaderProps) {
  const isDanger = variant === "danger";

  return (
    <header className="max-w-2xl mb-10 lg:mb-12">
      <motion.div whileHover={{ x: -2 }} className="inline-block mb-5">
        <Link
          href={backHref}
          className="focus-gold inline-flex items-center gap-2 text-sm font-medium text-cream-ivory/50 hover:text-cream-ivory transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
      </motion.div>
      <h1 className="font-manrope text-3xl sm:text-4xl leading-tight">
        <span className={`font-extrabold ${isDanger ? "text-red-400" : "text-lumen-gold"}`}>
          {title}
        </span>
      </h1>
    </header>
  );
}

"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SettingsCardProps {
  children: ReactNode;
  delay?: number;
  variant?: "default" | "danger";
  className?: string;
}

export default function SettingsCard({
  children,
  delay = 0,
  variant = "default",
  className = "",
}: SettingsCardProps) {
  const variantClass =
    variant === "danger"
      ? "border-red-500/20 bg-gradient-to-b from-red-500/[0.06] to-red-500/[0.02] hover:border-red-500/35 hover:from-red-500/[0.08]"
      : "border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] hover:border-white/[0.16] hover:from-white/[0.07]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.22, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`h-full rounded-3xl border p-6 sm:p-8 shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] transition-colors duration-300 ${variantClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}

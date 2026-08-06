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
      ? "border-red-500/20 bg-red-500/[0.04] hover:border-red-500/35 hover:bg-red-500/[0.06]"
      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`card-lift rounded-2xl border p-6 sm:p-8 transition-colors duration-300 ${variantClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}

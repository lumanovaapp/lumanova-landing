"use client";

import { motion } from "framer-motion";

/**
 * Ambient background glow — a soft, slow-drifting radial blob used to give
 * flat section backgrounds atmosphere. Respects prefers-reduced-motion via
 * the app-wide MotionConfig (reducedMotion="user" in Providers.tsx).
 */
export default function SectionGlow({
  className = "",
  color = "rgba(244, 196, 48, 0.07)",
  size = 480,
  drift = 22,
  center = false,
}: {
  className?: string;
  color?: string;
  size?: number;
  drift?: number;
  /** Center the blob on its positioned point via margin offset instead of a
   * translate transform — framer-motion's `animate={{ x, y }}` owns the
   * transform for the drift loop, so a Tailwind `-translate-x-1/2` class on
   * the same element would be silently clobbered. */
  center?: boolean;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute rounded-full blur-[150px] pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        ...(center ? { marginLeft: -size / 2, marginTop: -size / 2 } : {}),
      }}
      animate={{ x: [0, drift, 0], y: [0, -drift * 0.7, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

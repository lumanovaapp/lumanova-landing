"use client";

import { Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface DailyCoachLineProps {
  /** Today's cached line from lib/daily-coach-line.ts, or null if the user
   * has no active plan yet / generation failed — renders nothing either way. */
  line: string | null;
  className?: string;
}

export default function DailyCoachLine({ line, className = "" }: DailyCoachLineProps) {
  const reduceMotion = !!useReducedMotion();

  if (!line) return null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start gap-3 rounded-2xl border border-lumen-gold/20 bg-gradient-to-br from-lumen-gold/[0.06] to-transparent px-4 py-3 ${className}`}
    >
      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-lumen-gold to-charcoal flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-pure-black" />
      </span>
      <p className="text-sm text-cream-ivory/90 leading-relaxed pt-1">{line}</p>
    </motion.div>
  );
}

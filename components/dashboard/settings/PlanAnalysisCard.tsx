"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useTour } from "@/components/dashboard/onboarding/TourProvider";
import SettingsCard from "./SettingsCard";

interface PlanAnalysisCardProps {
  delay?: number;
}

export default function PlanAnalysisCard({ delay = 0 }: PlanAnalysisCardProps) {
  const { startTour } = useTour();

  return (
    <SettingsCard delay={delay}>
      <motion.button
        type="button"
        onClick={startTour}
        whileTap={{ scale: 0.97 }}
        className="h-12 px-5 rounded-xl border border-white/15 text-cream-ivory/80 font-manrope font-medium text-sm flex items-center gap-2 hover:bg-lumen-gold/5 hover:border-lumen-gold/40 hover:text-cream-ivory transition-colors w-fit"
      >
        <RotateCcw className="w-4 h-4" />
        Replay onboarding tour
      </motion.button>
    </SettingsCard>
  );
}

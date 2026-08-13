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
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-lumen-gold/10 flex items-center justify-center flex-shrink-0">
          <RotateCcw className="w-4 h-4 text-lumen-gold" />
        </div>
        <h3 className="font-manrope font-semibold text-cream-ivory">Plan &amp; onboarding</h3>
      </div>
      <p className="text-sm text-cream-ivory/50 ml-12 mb-4">
        Want a refresher on how Lumanova works?
      </p>
      <motion.button
        type="button"
        onClick={startTour}
        whileTap={{ scale: 0.96 }}
        className="focus-gold ml-12 h-11 px-5 rounded-full border border-lumen-gold/30 text-cream-ivory font-manrope font-medium text-sm flex items-center gap-2 hover:bg-lumen-gold/10 hover:border-lumen-gold/60 transition-all duration-300 w-fit"
      >
        <RotateCcw className="w-4 h-4 text-lumen-gold" />
        Replay onboarding tour
      </motion.button>
    </SettingsCard>
  );
}

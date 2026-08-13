"use client";

import { RotateCcw } from "lucide-react";
import { useTour } from "@/components/dashboard/onboarding/TourProvider";

export default function ReplayTourButton() {
  const { startTour } = useTour();

  return (
    <button
      type="button"
      onClick={startTour}
      className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-lumen-gold/30 text-cream-ivory font-manrope font-semibold text-sm hover:bg-lumen-gold/10 hover:border-lumen-gold/60 active:scale-[0.98] transition-all duration-300 focus-gold"
    >
      <RotateCcw className="w-4 h-4 text-lumen-gold" />
      Replay the tour
    </button>
  );
}

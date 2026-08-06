"use client";

import { RotateCcw } from "lucide-react";
import { useTour } from "@/components/dashboard/onboarding/TourProvider";

export default function ReplayTourButton() {
  const { startTour } = useTour();

  return (
    <button
      type="button"
      onClick={startTour}
      className="inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-lumen-gold text-pure-black font-manrope font-bold hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300"
    >
      <RotateCcw className="w-4 h-4" />
      Replay the tour
    </button>
  );
}

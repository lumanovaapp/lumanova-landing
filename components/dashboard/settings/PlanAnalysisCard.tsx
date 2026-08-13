"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { useTour } from "@/components/dashboard/onboarding/TourProvider";
import { apiErrorFromJson, fetchWithTimeout, toFriendlyMessage } from "@/lib/api-error";
import SettingsCard from "./SettingsCard";

interface PlanAnalysisCardProps {
  delay?: number;
  hasPlan?: boolean;
}

const REGENERATE_CONFIRM_MESSAGE =
  "Regenerate your 90-day plan from your latest analysis? This replaces your current habits with a freshly generated set (e.g. picking up morning/evening structure from the latest plan engine). Your streak and past check-ins stay recorded, but they're matched against the new habit list, so past days may show differently on the calendar.";

export default function PlanAnalysisCard({ delay = 0, hasPlan = false }: PlanAnalysisCardProps) {
  const router = useRouter();
  const { startTour } = useTour();
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleRegenerate() {
    if (!window.confirm(REGENERATE_CONFIRM_MESSAGE)) return;

    setRegenerating(true);
    setError("");

    try {
      const response = await fetchWithTimeout("/api/generate-plan", { method: "POST" });
      if (!response.ok) {
        throw await apiErrorFromJson(response, "Could not regenerate your plan.");
      }
      router.push("/dashboard/plan");
      router.refresh();
    } catch (err) {
      setError(toFriendlyMessage(err));
      setRegenerating(false);
    }
  }

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

      {hasPlan && (
        <>
          <p className="text-sm text-cream-ivory/50 ml-12 mt-5 mb-4">
            Rebuild your 90-day plan from your latest analysis — picks up any
            improvements to how habits are structured.
          </p>
          <motion.button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            whileTap={regenerating ? undefined : { scale: 0.96 }}
            className="focus-gold ml-12 h-11 px-5 rounded-full border border-lumen-gold/30 text-cream-ivory font-manrope font-medium text-sm flex items-center gap-2 hover:bg-lumen-gold/10 hover:border-lumen-gold/60 transition-all duration-300 w-fit disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {regenerating ? (
              <Loader2 className="w-4 h-4 text-lumen-gold animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-lumen-gold" />
            )}
            {regenerating ? "Rebuilding your plan…" : "Regenerate my plan"}
          </motion.button>
          {error && (
            <p className="text-xs text-warm-coral ml-12 mt-2">{error}</p>
          )}
        </>
      )}
    </SettingsCard>
  );
}

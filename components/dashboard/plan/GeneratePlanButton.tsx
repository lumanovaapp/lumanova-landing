"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { apiErrorFromJson, fetchWithTimeout, toFriendlyMessage } from "@/lib/api-error";
import { ProgressStage, useStagedProgress } from "@/lib/use-staged-progress";

const STAGES: ProgressStage[] = [
  { label: "Reading your analysis…", progress: 20 },
  { label: "Building your routine…", progress: 55 },
  { label: "Personalizing to your type…", progress: 78 },
  { label: "Almost ready…", progress: 90 },
];

const STEP_MS = 2000;

interface GeneratePlanButtonProps {
  // When true, generation starts automatically on mount (the button shows
  // "Building your plan…" straight away) and, on success, the URL's
  // ?generate=1 flag is dropped. Set by the plan page when the user arrived
  // via the analysis page's "Generate my 90-day plan" CTA, so the whole flow
  // is a single click: CTA → /dashboard/plan → generate → Today tab.
  autoStart?: boolean;
}

export default function GeneratePlanButton({ autoStart = false }: GeneratePlanButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(autoStart);
  const [error, setError] = useState("");
  const { stage, reduceMotion } = useStagedProgress(STAGES, STEP_MS);
  // Guards against a second run — a manual click while auto-start is in
  // flight, or React's dev double-invoked mount effect.
  const startedRef = useRef(false);

  async function handleGenerate() {
    if (startedRef.current) return;
    startedRef.current = true;
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithTimeout("/api/generate-plan", { method: "POST" });
      if (!response.ok) {
        throw await apiErrorFromJson(response, "Could not generate your plan.");
      }
      if (autoStart) {
        // Drop ?generate=1 so a re-render can't retrigger the auto-start.
        router.replace("/dashboard/plan");
      }
      // Re-fetch server data: the plan now exists, so the page swaps this
      // screen out for PlanView (which opens on the Today tab).
      router.refresh();
    } catch (err) {
      setError(toFriendlyMessage(err));
      setLoading(false);
      startedRef.current = false; // let the user retry with the button
    }
  }

  useEffect(() => {
    if (autoStart) handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  return (
    <div className="w-full flex flex-col items-center">
      {error && (
        <div className="mb-4 w-full rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 text-center">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-lumen-gold text-pure-black font-manrope font-bold rounded-full px-8 py-4 hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 focus-gold"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {loading ? stage.label : "Generate my plan"}
      </button>
      {loading && (
        <div className="w-full max-w-sm mt-4">
          <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-lumen-gold/70 to-lumen-gold"
              initial={false}
              animate={{ width: `${stage.progress}%` }}
              transition={{ duration: reduceMotion ? 0 : 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="font-inter text-xs text-cream-ivory/50 mt-3 text-center">
            This usually takes 5-10 seconds.
          </p>
        </div>
      )}
    </div>
  );
}

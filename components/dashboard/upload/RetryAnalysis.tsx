"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { apiErrorFromJson, fetchWithTimeout, toFriendlyMessage } from "@/lib/api-error";
import { useRipple } from "@/lib/use-ripple";
import RippleLayer from "@/components/RippleLayer";

interface RetryAnalysisProps {
  photoId: string;
}

export default function RetryAnalysis({ photoId }: RetryAnalysisProps) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");
  const { ripples, onPointerDown } = useRipple();

  async function handleRetry() {
    setRetrying(true);
    setError("");

    try {
      const response = await fetchWithTimeout("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });

      if (!response.ok) {
        throw await apiErrorFromJson(response, "Analysis failed again.");
      }

      router.refresh();
    } catch (err) {
      setError(toFriendlyMessage(err));
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-3xl shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-8 sm:p-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <p className="font-manrope font-semibold text-lg text-cream-ivory">
          We couldn&apos;t analyze that photo
        </p>
        <p className="font-inter text-sm text-cream-ivory/60 mt-2 mb-7">
          {error || "Something went wrong during analysis."}
        </p>
        <button
          type="button"
          onClick={handleRetry}
          onPointerDown={onPointerDown}
          disabled={retrying}
          className="relative overflow-hidden h-14 px-8 inline-flex items-center justify-center gap-2 rounded-full bg-lumen-gold text-pure-black font-manrope font-bold hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] active:scale-95 transition-all duration-300 focus-gold disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <RippleLayer ripples={ripples} />
          {retrying && <Loader2 className="w-4 h-4 animate-spin" />}
          {retrying ? "Analyzing your features…" : "Try again"}
        </button>
        {retrying && (
          <p className="font-inter text-xs text-cream-ivory/50 mt-3">
            This usually takes 10-20 seconds.
          </p>
        )}
      </motion.div>
    </div>
  );
}

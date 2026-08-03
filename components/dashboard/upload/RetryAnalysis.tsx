"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

interface RetryAnalysisProps {
  photoId: string;
}

export default function RetryAnalysis({ photoId }: RetryAnalysisProps) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");

  async function handleRetry() {
    setRetrying(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Analysis failed again.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <p className="font-manrope font-semibold text-lg text-cream-ivory">
        We couldn&apos;t analyze that photo
      </p>
      <p className="font-inter text-sm text-cream-ivory/60 mt-2 mb-6">
        {error || "Something went wrong during analysis."}
      </p>
      <button
        type="button"
        onClick={handleRetry}
        disabled={retrying}
        className="h-14 px-8 rounded-xl bg-lumen-gold text-pure-black font-manrope font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {retrying && <Loader2 className="w-4 h-4 animate-spin" />}
        {retrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

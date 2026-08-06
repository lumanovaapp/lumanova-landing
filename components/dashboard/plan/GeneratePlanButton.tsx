"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiErrorFromJson, fetchWithTimeout, toFriendlyMessage } from "@/lib/api-error";

export default function GeneratePlanButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithTimeout("/api/generate-plan", { method: "POST" });
      if (!response.ok) {
        throw await apiErrorFromJson(response, "Could not generate your plan.");
      }
      router.refresh();
    } catch (err) {
      setError(toFriendlyMessage(err));
      setLoading(false);
    }
  }

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
        className="w-full h-14 rounded-xl bg-lumen-gold text-pure-black font-manrope font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {loading ? "Building your plan…" : "Generate my plan"}
      </button>
      {loading && (
        <p className="font-inter text-xs text-cream-ivory/50 mt-3">
          This usually takes 5-10 seconds.
        </p>
      )}
    </div>
  );
}

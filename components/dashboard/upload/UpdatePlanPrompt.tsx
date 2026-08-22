"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { apiErrorFromJson, fetchWithTimeout, toFriendlyMessage } from "@/lib/api-error";

// Shown on the analysis-reveal page (app/dashboard/upload/[id]/page.tsx)
// when this photo is a fresh, non-milestone analysis that hasn't been
// folded into the user's existing plan yet. Reuses the same
// /api/generate-plan endpoint as first-time generation and Settings'
// "Regenerate my plan" — it always keys off the user's most recently
// analyzed photo, and always preserves plans.created_at (so day count,
// checkins, and streak are untouched) since the upsert never sets that
// column on an update — see the comment in app/api/generate-plan/route.ts.
export default function UpdatePlanPrompt() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate() {
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithTimeout("/api/generate-plan", { method: "POST" });
      if (!response.ok) {
        throw await apiErrorFromJson(response, "Could not update your plan.");
      }
      router.push("/dashboard/plan");
    } catch (err) {
      setError(toFriendlyMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 rounded-3xl border border-lumen-gold/20 bg-gradient-to-br from-lumen-gold/[0.07] to-lumen-gold/[0.02] p-8 sm:p-10 text-center">
      <p className="font-manrope font-semibold text-lg sm:text-xl text-cream-ivory mb-2">
        Your analysis changed — update your plan?
      </p>
      <p className="text-sm text-cream-ivory/55 max-w-md mx-auto mb-6 leading-relaxed">
        We&apos;ll refresh your habits and target look from this new analysis.
        Your day count, check-ins, and streak stay exactly where they are.
      </p>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-lumen-gold text-pure-black font-manrope font-bold hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 focus-gold"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {loading ? "Updating your plan…" : "Update my plan"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/plan")}
          disabled={loading}
          className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-white/15 text-cream-ivory/70 font-manrope font-medium hover:text-cream-ivory hover:border-white/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus-gold"
        >
          Keep my current plan
        </button>
      </div>
    </div>
  );
}

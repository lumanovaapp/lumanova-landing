"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { apiErrorFromJson, fetchWithTimeout, toFriendlyMessage } from "@/lib/api-error";

interface UpgradeButtonProps {
  plan: "monthly" | "yearly";
  label?: string;
  className?: string;
}

const DEFAULT_CLASS =
  "relative w-full inline-flex items-center justify-center gap-2 bg-lumen-gold text-pure-black font-manrope font-bold rounded-full px-6 py-3.5 hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 focus-gold";

// Starts a Lemon Squeezy checkout for the given billing cadence and
// redirects the browser to it (POST /api/checkout -> full-page navigation
// to the hosted checkout URL Lemon Squeezy returns — not a client SDK
// embed, so no extra script to load).
export default function UpgradeButton({ plan, label, className }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithTimeout("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        throw await apiErrorFromJson(response, "Could not start checkout.");
      }

      const data = (await response.json()) as { url: string };
      window.location.href = data.url;
    } catch (err) {
      setError(toFriendlyMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={className ?? DEFAULT_CLASS}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Redirecting…" : label ?? "Upgrade to Pro"}
      </button>
      {error && <p className="text-xs text-warm-coral mt-2 text-center">{error}</p>}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AnalyzingStatus() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center py-20 text-center">
      <Loader2 className="w-8 h-8 text-lumen-gold animate-spin mb-4" />
      <p className="font-manrope font-semibold text-lg text-cream-ivory">
        Analyzing your features…
      </p>
      <p className="font-inter text-sm text-cream-ivory/60 mt-2">
        This can take up to 15 seconds. This page updates automatically.
      </p>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ScanFace, Sparkles, Scissors, Wind, Shirt, LucideIcon } from "lucide-react";

const SCAN_STEPS: { icon: LucideIcon; label: string }[] = [
  { icon: Sparkles, label: "Skin" },
  { icon: Scissors, label: "Hair" },
  { icon: Wind, label: "Grooming" },
  { icon: Shirt, label: "Style" },
];

export default function AnalyzingStatus() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center py-16 sm:py-24 text-center">
      {/* Pulsing radar around a centered scan icon — alive, not a bare spinner */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-8">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-lumen-gold/30"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.7,
            }}
          />
        ))}
        <span className="relative flex items-center justify-center w-20 h-20 rounded-full bg-lumen-gold/10 border border-lumen-gold/20">
          <ScanFace className="w-9 h-9 text-lumen-gold" />
        </span>
      </div>

      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70">
        Analyzing
      </p>
      <h1 className="mt-3 font-manrope leading-tight text-2xl sm:text-3xl">
        <span className="font-light text-cream-ivory/80">Reading your </span>
        <span className="font-extrabold text-lumen-gold">features</span>
      </h1>
      <p className="mt-3 font-inter text-sm text-cream-ivory/55 max-w-sm">
        This can take up to 15 seconds. This page updates automatically.
      </p>

      {/* Indeterminate scan bar */}
      <div className="mt-10 w-full max-w-sm h-1 rounded-full bg-white/[0.08] overflow-hidden">
        <motion.div
          className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-lumen-gold to-transparent"
          animate={{ x: ["-120%", "220%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* What we're reading — cycling emphasis, purely decorative */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {SCAN_STEPS.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            <Icon className="w-3.5 h-3.5 text-lumen-gold" />
            <span className="text-xs font-medium text-cream-ivory/70">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

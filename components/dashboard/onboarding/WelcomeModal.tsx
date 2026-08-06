"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";

interface WelcomeModalProps {
  onTakeTour: () => void;
  onSkip: () => void;
}

export default function WelcomeModal({ onTakeTour, onSkip }: WelcomeModalProps) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-pure-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-3xl border border-lumen-gold/20 bg-charcoal p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-lumen-gold/10 flex items-center justify-center mb-6">
          <Sparkles className="w-7 h-7 text-lumen-gold" />
        </div>

        <h2
          id="welcome-modal-title"
          className="font-manrope font-bold text-2xl text-cream-ivory"
        >
          Welcome to Lumanova
        </h2>
        <p className="font-inter text-sm text-cream-ivory/70 mt-2 leading-relaxed">
          Want a quick 60-second tour of how everything works, or would you
          rather dive straight in?
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onTakeTour}
            className="h-14 rounded-xl bg-lumen-gold text-pure-black font-manrope font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300"
          >
            <Compass className="w-4 h-4" />
            Take the tour
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="h-12 rounded-xl border border-white/15 text-cream-ivory/70 font-manrope font-medium hover:bg-white/5 hover:text-cream-ivory transition-colors"
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
}

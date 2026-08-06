"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface SaveStatusProps {
  state: SaveState;
  errorMessage?: string;
  className?: string;
}

export default function SaveStatus({ state, errorMessage, className = "" }: SaveStatusProps) {
  return (
    <div className={`h-4 flex items-center ${className}`}>
      <AnimatePresence mode="wait">
        {state === "saving" && (
          <motion.span
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-xs text-cream-ivory/40"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving…
          </motion.span>
        )}
        {state === "saved" && (
          <motion.span
            key="saved"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1.5 text-xs font-medium text-lumen-gold"
          >
            <Check className="w-3 h-3" />
            Saved
          </motion.span>
        )}
        {state === "error" && (
          <motion.span
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-red-400"
          >
            {errorMessage || "Couldn't save — try again."}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

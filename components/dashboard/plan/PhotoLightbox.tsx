"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxImage {
  url: string;
  label: string;
}

interface PhotoLightboxProps {
  images: LightboxImage[];
  /** null = closed. */
  index: number | null;
  onClose: () => void;
  /** Omit for a single-image lightbox — no prev/next controls are shown. */
  onNavigate?: (index: number) => void;
}

// Full-size viewer for any progress/milestone photo — a shared overlay so
// "tap to enlarge" behaves identically wherever a thumbnail triggers it
// (the timeline's small thumbnails, the before/after comparison tiles, etc).
export default function PhotoLightbox({
  images,
  index,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const reduceMotion = !!useReducedMotion();
  const open = index !== null;
  const current = open ? images[index] : null;
  const hasPrev = !!onNavigate && open && index > 0;
  const hasNext = !!onNavigate && open && index < images.length - 1;

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate!(index! - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate!(index! + 1);
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, index, hasPrev, hasNext, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-pure-black/95 backdrop-blur-sm p-4 sm:p-10"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-cream-ivory/70 hover:bg-white/10 hover:text-cream-ivory transition-colors focus-gold"
          >
            <X className="w-5 h-5" />
          </button>

          {hasPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate!(index! - 1);
              }}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-cream-ivory/80 hover:bg-white/10 hover:text-cream-ivory transition-colors focus-gold"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate!(index! + 1);
              }}
              aria-label="Next photo"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-cream-ivory/80 hover:bg-white/10 hover:text-cream-ivory transition-colors focus-gold"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <motion.div
            key={current.url}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center max-w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.label}
              className="max-w-full max-h-[78vh] rounded-2xl border border-white/10 object-contain shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            />
            <p className="mt-4 text-sm font-manrope font-medium text-cream-ivory/80">
              {current.label}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

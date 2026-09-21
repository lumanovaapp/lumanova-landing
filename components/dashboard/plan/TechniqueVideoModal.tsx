"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

interface TechniqueVideoModalProps {
  /** null = closed. */
  src: string | null;
  label: string;
  onClose: () => void;
}

// Full-size video viewer — the "enlarge" destination from
// TechniqueVideoPanel on desktop, and the direct target of "Watch how" on
// mobile (which has no room for the small side player). Mirrors
// PhotoLightbox's overlay treatment so both feel like the same app.
export default function TechniqueVideoModal({
  src,
  label,
  onClose,
}: TechniqueVideoModalProps) {
  const reduceMotion = !!useReducedMotion();
  const open = !!src;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) videoRef.current?.play().catch(() => {});
  }, [open, src]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="technique-video-modal"
          role="dialog"
          aria-modal="true"
          aria-label={label}
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

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center max-w-full"
          >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              src={src ?? undefined}
              controls
              playsInline
              className="max-w-full max-h-[78vh] rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            />
            <p className="mt-4 text-sm font-manrope font-medium text-cream-ivory/80">
              {label}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

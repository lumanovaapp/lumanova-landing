"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Analysis, Plan } from "@/lib/types";
import { buildStyleGuideEntry } from "@/lib/style-guide";
import { DepthGroup } from "@/lib/style-guide-images";

interface StyleGuideProps {
  analysis: Analysis | null;
  plan: Plan;
  className?: string;
}

const DEPTH_GROUP_LABELS: Record<DepthGroup, string> = {
  light: "light-to-medium depth",
  deep: "deep",
};

// "Your Colors & Style" — sits right after Target Look on the Journey tab.
// Same data-flow pattern: analysis + plan (already in scope in PlanView, no
// extra fetch) resolved into type-matched reference images, this time keyed
// by skin undertone + depth instead of beard/hair type.
export default function StyleGuide({ analysis, plan, className = "" }: StyleGuideProps) {
  const reduceMotion = !!useReducedMotion();
  const entry = buildStyleGuideEntry(analysis, plan);

  if (!entry) return null;

  const altSuffix = `${entry.undertone} undertone, ${entry.depthGroup} depth`;

  return (
    <section className={className}>
      <div className="max-w-2xl mb-6">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-3">
          Your Colors & Style
        </p>
        <h2 className="font-manrope leading-[1.15] tracking-[-0.02em] text-xl sm:text-2xl mb-2">
          <span className="font-light text-cream-ivory/80">What actually</span>{" "}
          <span className="font-extrabold text-lumen-gold">suits you</span>
        </h2>
        <p className="font-inter text-sm text-cream-ivory/55 leading-relaxed">
          Matched to your skin tone from your analysis — a reference for
          color and fit, not just another checklist.
        </p>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-4 sm:p-5"
      >
        {/* Two distinct images, never composited into one — the look image
            is the hero (larger), the palette image sits beside it. Stacks
            to full-width-each on mobile via the grid-cols-1 default. */}
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-3">
          <StyleGuideImage
            label="The Look"
            src={entry.images.look}
            alt={`${altSuffix} — outfit reference`}
          />
          <StyleGuideImage
            label="The Palette"
            src={entry.images.palette}
            alt={`${altSuffix} — color and clothing swatch reference`}
          />
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-3.5 h-3.5 text-lumen-gold flex-shrink-0" />
            <p className="font-manrope font-semibold text-sm text-cream-ivory capitalize">
              {entry.undertone} undertone, {DEPTH_GROUP_LABELS[entry.depthGroup]}
              {entry.isFallback && (
                <span className="text-cream-ivory/40 font-normal"> (best guess)</span>
              )}
            </p>
          </div>
          <p className="text-sm text-cream-ivory/60 leading-relaxed">
            {entry.paletteCaption}
          </p>

          {entry.personalizedTip && (
            <div className="mt-4 rounded-xl border border-lumen-gold/20 bg-lumen-gold/5 px-3.5 py-3">
              <p className="text-[10px] uppercase tracking-wide text-lumen-gold font-semibold mb-1">
                From your plan — {entry.personalizedTip.label}
              </p>
              <p className="text-xs text-cream-ivory/70 leading-relaxed">
                {entry.personalizedTip.detail}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

interface StyleGuideImageProps {
  label: string;
  src: string;
  alt: string;
}

// Unlike TargetLookCard (which only shows its placeholder when a type is
// genuinely unmatched), the image path here is ALWAYS considered "real" —
// so the placeholder instead has to catch the file simply not existing yet
// in public/style-guide/ (see lib/style-guide-images.ts), and swap to a
// text-only-friendly placeholder rather than a broken-image icon. The look
// and palette images are two independent instances of this, so one missing
// file never takes the other down with it.
function StyleGuideImage({ label, src, alt }: StyleGuideImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div>
      <div
        className={`relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-lumen-gold/[0.09] via-charcoal to-[#0A0A0A] ${
          failed ? "border border-dashed border-white/15" : "border border-white/10"
        }`}
      >
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <div className="w-11 h-11 rounded-2xl bg-lumen-gold/10 border border-lumen-gold/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-lumen-gold" />
            </div>
            <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-cream-ivory/35">
              Image coming soon
            </span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
      <p className="mt-1.5 text-[9px] font-bold tracking-[0.16em] uppercase text-cream-ivory/35">
        {label}
      </p>
    </div>
  );
}

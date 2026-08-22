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

      {/* Same 2-column stretching grid as TargetLook, for the same reason
          — fills the full width of the already-padded content area instead
          of leaving space unused beside two fixed-width cards. Look and
          Palette get different image treatment (see StyleGuideCard's `fit`
          prop): Look fills the card completely (object-cover) since a
          full-bleed outfit photo is the point of that card; Palette stays
          on object-contain since it's an arranged reference where cropping
          any of the swatches/items would defeat the purpose. */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-5"
      >
        <StyleGuideCard
          label="The Look"
          src={entry.images.look}
          alt={`${altSuffix} — outfit reference`}
          fit="cover"
        />
        <StyleGuideCard
          label="The Palette"
          src={entry.images.palette}
          alt={`${altSuffix} — color and clothing swatch reference`}
          fit="contain"
        />
      </motion.div>

      <div className="mt-6 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-5">
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
    </section>
  );
}

interface StyleGuideCardProps {
  label: string;
  src: string;
  alt: string;
  // "cover" (Look): fills the card completely, width and height, no
  // letterbox bands — object-top keeps the crop anchored to the top of the
  // image so a person shot never loses their head, only ever trimming from
  // the bottom regardless of how the card's aspect ratio compares to the
  // photo's. "contain" (Palette): the whole arranged reference must stay
  // visible, so it's never cropped — any leftover gap is filled by the
  // card's own dark gradient background rather than left blank.
  fit: "cover" | "contain";
}

// Unlike TargetLookCard (which only shows its placeholder when a type is
// genuinely unmatched), the image path here is ALWAYS considered "real" —
// so the placeholder instead has to catch the file simply not existing yet
// in public/style-guide/ (see lib/style-guide-images.ts), and swap to a
// text-only-friendly placeholder rather than a broken-image icon. The look
// and palette cards are two independent instances of this, so one missing
// file never takes the other down with it.
function StyleGuideCard({ label, src, alt, fit }: StyleGuideCardProps) {
  const [failed, setFailed] = useState(false);

  return (
    // No explicit width — a grid item (see StyleGuide above), same as
    // TargetLookCard, so Look and Palette stretch to fill their half of
    // the row instead of sitting at a fixed pixel width with space to
    // spare beside them.
    <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-3 transition-colors duration-300 hover:border-lumen-gold/25">
      {/* Fixed pixel height (not aspect-ratio) — see TargetLook.tsx for
          why. Both cards share this same h-96, so the row stays even
          regardless of which fit mode each image uses. */}
      <div
        className={`relative w-full h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-lumen-gold/[0.09] via-charcoal to-[#0A0A0A] ${
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
            className={`absolute inset-0 w-full h-full ${
              fit === "cover" ? "object-cover object-top" : "object-contain"
            }`}
          />
        )}
      </div>

      <div className="px-2 pt-4 pb-2">
        <p className="text-[9px] font-bold tracking-[0.16em] uppercase text-cream-ivory/35">
          {label}
        </p>
      </div>
    </div>
  );
}

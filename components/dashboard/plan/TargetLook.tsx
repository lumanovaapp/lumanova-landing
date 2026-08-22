"use client";

import { Droplet, Scissors, Wand2, Shirt, ImageIcon, LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Analysis, ProfileTypes } from "@/lib/types";
import { selectTargetLookAreas, TargetLookEntry } from "@/lib/target-look";

const ICONS: Record<string, LucideIcon> = { Droplet, Scissors, Wand2, Shirt };

interface TargetLookProps {
  analysis: Analysis | null;
  profileTypes?: ProfileTypes;
  className?: string;
}

export default function TargetLook({ analysis, profileTypes, className = "" }: TargetLookProps) {
  const reduceMotion = !!useReducedMotion();
  const areas = selectTargetLookAreas(analysis, profileTypes);

  if (areas.length === 0) return null;

  return (
    <section className={className}>
      <div className="max-w-2xl mb-6">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-3">
          Your Target Look
        </p>
        <h2 className="font-manrope leading-[1.15] tracking-[-0.02em] text-xl sm:text-2xl mb-2">
          <span className="font-light text-cream-ivory/80">Here&apos;s the</span>{" "}
          <span className="font-extrabold text-lumen-gold">destination</span>
        </h2>
        <p className="font-inter text-sm text-cream-ivory/55 leading-relaxed">
          Pulled from your analysis — the shape your daily habits are working
          toward for each focus area.
        </p>
      </div>

      {/* 2 columns, stretching to fill the row — a clean 2x2 for the (now
          always exactly 4, see lib/target-look.ts) cards, using the full
          width of the already-padded content area instead of leaving Style
          stranded alone with empty space beside it. This used to be a
          fixed-width flex-wrap specifically because card COUNT varied
          3-vs-4 between users, which made a stretching grid render
          inconsistently — that's no longer possible now that the selection
          logic always returns all four areas, so a plain stretching grid is
          safe again and gives every card the same size as a natural
          consequence of the grid being uniform, not by pinning a width. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {areas.map((area, i) => (
          <TargetLookCard key={area.key} area={area} index={i} reduceMotion={reduceMotion} />
        ))}
      </div>
    </section>
  );
}

function TargetLookCard({
  area,
  index,
  reduceMotion,
}: {
  area: TargetLookEntry;
  index: number;
  reduceMotion: boolean;
}) {
  const Icon = ICONS[area.icon] ?? ImageIcon;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      // No explicit width — a grid item, sized by its sm:grid-cols-2 track
      // (see TargetLook above), which is what makes it equal to the other
      // three cards: they all share the same grid, not a pinned width.
      className="group rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-3 transition-colors duration-300 hover:border-lumen-gold/25"
    >
      {/* Fixed pixel height (not aspect-ratio) — a card must render at this
          exact size for every image regardless of that image file's own
          natural dimensions (e.g. a 1536x1024 source), and regardless of
          whether the browser has resolved this element's width yet.
          aspect-ratio depends on that width already being known; a fixed
          height never does, so this is the one guarantee that holds for
          every user in every layout pass. See also StyleGuide.tsx, which
          uses this exact same height so the two sections match. */}
      <div
        className={`relative w-full h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-lumen-gold/[0.09] via-charcoal to-[#0A0A0A] ${
          area.imageUrl ? "border border-white/10" : "border border-dashed border-white/15"
        }`}
      >
        {area.imageUrl ? (
          // Swappable reference photo — see lib/target-look.ts. Plain <img>
          // since these are external/user-supplied URLs, not local assets.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={area.imageUrl}
            alt={area.label}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          // Dashed border + "coming soon" framing marks this as a deliberately
          // empty slot (not a broken/missing image) — swap it in via
          // lib/target-look-images.ts once a reference photo is ready.
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <div className="w-11 h-11 rounded-2xl bg-lumen-gold/10 border border-lumen-gold/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-lumen-gold" />
            </div>
            <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-cream-ivory/35">
              Image coming soon
            </span>
          </div>
        )}
      </div>

      <div className="px-2 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon className="w-3.5 h-3.5 text-lumen-gold flex-shrink-0" />
          <p className="font-manrope font-semibold text-sm text-cream-ivory">
            {area.label}
          </p>
        </div>
        <p className="text-xs text-cream-ivory/55 leading-relaxed">{area.caption}</p>
      </div>
    </motion.div>
  );
}

"use client";

import { useEffect, useState, CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Sparkles,
  Scissors,
  Wind,
  Shirt,
  ScanLine,
  ChevronDown,
  ChevronUp,
  LucideIcon,
} from "lucide-react";
import {
  Analysis,
  AnalysisCategory,
  AnalysisZone,
  CategoryPriority,
} from "@/lib/types";
import { Accent, ACCENT_THEME, ACCENT_LABELS } from "@/lib/accent";
import { itemText } from "@/lib/format";

interface AnalysisRevealProps {
  imageUrl: string;
  analysis: Analysis;
}

// Fallback marker positions for analyses saved before "zone" was tracked.
const DEFAULT_ZONES: Record<string, AnalysisZone> = {
  Hair: { x: 50, y: 12 },
  Skin: { x: 42, y: 34 },
  "Facial Hair & Grooming": { x: 52, y: 58 },
  "Style & Presentation": { x: 46, y: 84 },
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Skin: Sparkles,
  Hair: Scissors,
  "Facial Hair & Grooming": Wind,
  "Style & Presentation": Shirt,
};

const SCAN_DURATION_MS = 1800;
const HIGHLIGHT_DURATION_MS = 1200;
const OBSERVATION_LIMIT = 3;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveZone(category: AnalysisCategory): AnalysisZone {
  return category.zone ?? DEFAULT_ZONES[category.name] ?? { x: 50, y: 50 };
}

function resolvePriority(category: AnalysisCategory): CategoryPriority {
  return category.priority ?? "refine";
}

export default function AnalysisReveal({
  imageUrl,
  analysis,
}: AnalysisRevealProps) {
  const reduceMotion = !!useReducedMotion();

  const [scanning, setScanning] = useState(!reduceMotion);
  const [scanComplete, setScanComplete] = useState(reduceMotion);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      setScanning(false);
      setScanComplete(true);
      return;
    }
    const timer = setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
    }, SCAN_DURATION_MS);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  function handleMarkerClick(category: string) {
    const id = slugify(category);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
    setHighlighted(id);
    window.setTimeout(() => {
      setHighlighted((current) => (current === id ? null : current));
    }, HIGHLIGHT_DURATION_MS);
  }

  const topQuickWins = analysis.quick_wins.slice(0, 3);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero: content left, scan image right on desktop — asymmetric, not centered */}
      <div
        className="hero-glow grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-14 items-start"
        style={{ "--glow-color": "rgba(244, 196, 48, 0.14)" } as CSSProperties}
      >
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          animate={scanComplete ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: reduceMotion ? 0.25 : 0.5,
            delay: reduceMotion ? 0 : 0.1,
          }}
          className="order-2 lg:order-1"
        >
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70">
            Your Analysis
          </p>
          <p className="mt-3 font-manrope font-bold text-3xl sm:text-4xl text-cream-ivory leading-tight text-balance">
            {analysis.summary}
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {analysis.focus_areas.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-cream-ivory/45 mb-3">
                  We&apos;ll work on
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {analysis.focus_areas.map((area) => (
                    <span
                      key={itemText(area)}
                      className="bg-lumen-gold/10 border border-lumen-gold/20 text-lumen-gold px-2.5 py-1 rounded-full text-xs font-medium"
                    >
                      {itemText(area)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {topQuickWins.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-cream-ivory/45 mb-3">
                  Quick wins this week
                </p>
                <div className="flex flex-col gap-2">
                  {topQuickWins.map((win, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-lumen-gold/20 bg-lumen-gold/5 p-3 flex items-start gap-2.5"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lumen-gold text-pure-black text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm text-cream-ivory">
                        {itemText(win)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Scan hero */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-8">
          <div className="relative w-full max-w-[420px] mx-auto lg:mx-0 aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Your selfie"
                className="w-full h-full object-cover"
              />
            )}

            <motion.div
              className="absolute inset-0 bg-pure-black/50 pointer-events-none"
              initial={{ opacity: reduceMotion ? 0 : 0.6 }}
              animate={{ opacity: scanComplete ? 0 : 0.6 }}
              transition={{ duration: 0.5 }}
            />

            {scanning && !reduceMotion && (
              <motion.div
                className="absolute left-0 right-0 h-20 bg-gradient-to-b from-transparent via-lumen-gold/50 to-transparent pointer-events-none"
                initial={{ top: "-15%" }}
                animate={{ top: "110%" }}
                transition={{ duration: SCAN_DURATION_MS / 1000, ease: "linear" }}
              />
            )}

            {scanning && !reduceMotion && (
              <>
                <CornerBracket position="top-left" />
                <CornerBracket position="top-right" />
                <CornerBracket position="bottom-left" />
                <CornerBracket position="bottom-right" />
              </>
            )}

            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-pure-black/70 border border-lumen-gold/30 rounded-full px-3 py-1">
              {scanComplete ? (
                <>
                  <Check className="w-3.5 h-3.5 text-lumen-gold" />
                  <span className="text-[11px] tracking-widest uppercase text-lumen-gold font-medium">
                    Analysis Complete
                  </span>
                </>
              ) : (
                <>
                  <ScanLine className="w-3.5 h-3.5 text-lumen-gold animate-pulse" />
                  <span className="text-[11px] tracking-widest uppercase text-lumen-gold font-medium">
                    Analyzing…
                  </span>
                </>
              )}
            </div>

            {scanComplete &&
              analysis.categories.map((category, i) => {
                const zone = resolveZone(category);
                const side = zone.x < 50 ? "left" : "right";
                return (
                  <Marker
                    key={category.name}
                    category={category.name}
                    zone={zone}
                    side={side}
                    index={i}
                    reduceMotion={reduceMotion}
                    boosted={hoveredCategory === category.name}
                    onClick={() => handleMarkerClick(category.name)}
                    onHoverChange={(hover) =>
                      setHoveredCategory(hover ? category.name : null)
                    }
                  />
                );
              })}
          </div>
        </div>
      </div>

      {/* Category cards — every card shares the same footprint (boxed
          feature-crop image + text side), alternating which side the image
          sits on so the grid still has editorial rhythm without any card
          breaking the pattern. */}
      <p className="mt-16 text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70">
        The Breakdown
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {analysis.categories.map((category, i) => (
          <CategoryCard
            key={category.name}
            category={category}
            index={i}
            imageUrl={imageUrl}
            isHighlighted={highlighted === slugify(category.name)}
            isHovered={hoveredCategory === category.name}
            onHoverChange={(hover) =>
              setHoveredCategory(hover ? category.name : null)
            }
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-3xl border border-lumen-gold/20 bg-gradient-to-br from-lumen-gold/[0.07] to-lumen-gold/[0.02] p-8 sm:p-10 text-center">
        <p className="font-manrope font-semibold text-lg sm:text-xl text-cream-ivory mb-6">
          Ready to turn this into your plan?
        </p>
        <Link
          href="/dashboard/plan"
          className="inline-flex w-full sm:w-auto sm:min-w-[280px] h-14 px-8 rounded-full bg-lumen-gold text-pure-black font-manrope font-bold items-center justify-center gap-2 hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] active:scale-95 transition-all duration-300 focus-gold"
        >
          Generate my 90-day plan
        </Link>
      </div>
    </div>
  );
}

interface CategoryCardProps {
  category: AnalysisCategory;
  index: number;
  imageUrl: string;
  isHighlighted: boolean;
  isHovered: boolean;
  onHoverChange: (hovering: boolean) => void;
  reduceMotion: boolean;
}

function CategoryCard({
  category,
  index,
  imageUrl,
  isHighlighted,
  isHovered,
  onHoverChange,
  reduceMotion,
}: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const Icon = CATEGORY_ICONS[category.name] ?? Sparkles;
  const id = slugify(category.name);
  const zone = resolveZone(category);
  const priority = resolvePriority(category);
  const accent: Accent = priority;
  const theme = ACCENT_THEME[accent];
  const imageOnRight = index % 2 === 1;

  const observations = category.observations.map(itemText);
  const recommendations = category.recommendations.map(itemText);
  const visibleObservations = expanded
    ? observations
    : observations.slice(0, OBSERVATION_LIMIT);
  const hasMoreObservations = observations.length > OBSERVATION_LIMIT;

  return (
    <motion.div
      id={id}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: reduceMotion ? 0.25 : 0.5,
        delay: reduceMotion ? 0 : index * 0.1,
      }}
      className={`overflow-visible rounded-3xl border bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-6 scroll-mt-24 transition-[border-color,box-shadow] duration-300 ${
        isHighlighted || isHovered
          ? `${theme.border} ${theme.ring}`
          : "border-white/[0.08] hover:border-white/[0.16]"
      }`}
    >
      <div
        className={`flex flex-col sm:gap-6 gap-5 items-center sm:items-start ${
          imageOnRight ? "sm:flex-row-reverse" : "sm:flex-row"
        }`}
      >
        <FeatureCrop
          imageUrl={imageUrl}
          zone={zone}
          icon={Icon}
          theme={theme}
        />

        <div className="flex-1 w-full min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-manrope font-bold text-lg text-cream-ivory">
              {category.name}
            </h2>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border ${theme.border} ${theme.bgSoft} ${theme.text}`}
            >
              {ACCENT_LABELS[accent]}
            </span>
          </div>

          {category.style_suggestion && (
            <div className="mt-3 inline-flex items-start gap-2 rounded-xl border border-lumen-gold/25 bg-lumen-gold/5 px-3 py-2">
              <Scissors className="w-3.5 h-3.5 text-lumen-gold flex-shrink-0 mt-0.5" />
              <p className="text-xs text-cream-ivory leading-relaxed">
                <span className="uppercase tracking-wide text-lumen-gold font-semibold text-[10px] mr-1.5">
                  Suggested style
                </span>
                {category.style_suggestion}
              </p>
            </div>
          )}

          {visibleObservations.length > 0 && (
            <div className="mt-3 space-y-1">
              {visibleObservations.map((observation, oi) => (
                <p
                  key={oi}
                  className="text-sm text-cream-ivory/50 leading-relaxed"
                >
                  {observation}
                </p>
              ))}
              {hasMoreObservations && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className={`flex items-center gap-1 text-xs font-medium ${theme.text} hover:underline mt-1 focus-gold`}
                >
                  {expanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  {expanded
                    ? "Show less"
                    : `Show ${observations.length - OBSERVATION_LIMIT} more`}
                </button>
              )}
            </div>
          )}

          {recommendations.length > 0 && (
            <ul className="mt-4 space-y-2.5">
              {recommendations.map((recommendation, ri) => (
                <li
                  key={ri}
                  className="flex items-start gap-2.5 text-sm text-cream-ivory"
                >
                  <Check
                    className={`w-4 h-4 ${theme.text} flex-shrink-0 mt-0.5`}
                  />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface FeatureCropProps {
  imageUrl: string;
  zone: AnalysisZone;
  icon: LucideIcon;
  theme: (typeof ACCENT_THEME)[Accent];
}

function FeatureCrop({ imageUrl, zone, icon: Icon, theme }: FeatureCropProps) {
  return (
    <div
      className={`relative w-[180px] h-[180px] max-w-full flex-shrink-0 rounded-2xl overflow-hidden border ${theme.border} bg-white/5`}
      style={
        imageUrl
          ? {
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "280%",
              backgroundPosition: `${zone.x}% ${zone.y}%`,
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      <span
        className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-pure-black/80 border ${theme.border} flex items-center justify-center`}
      >
        <Icon className={`w-4 h-4 ${theme.text}`} />
      </span>
    </div>
  );
}

interface CornerBracketProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

function CornerBracket({ position }: CornerBracketProps) {
  const positionClasses: Record<CornerBracketProps["position"], string> = {
    "top-left": "top-3 left-3 border-t-2 border-l-2",
    "top-right": "top-3 right-3 border-t-2 border-r-2",
    "bottom-left": "bottom-3 left-3 border-b-2 border-l-2",
    "bottom-right": "bottom-3 right-3 border-b-2 border-r-2",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`absolute w-6 h-6 border-lumen-gold pointer-events-none ${positionClasses[position]}`}
    />
  );
}

interface MarkerProps {
  category: string;
  zone: AnalysisZone;
  side: "left" | "right";
  index: number;
  reduceMotion: boolean;
  boosted: boolean;
  onClick: () => void;
  onHoverChange: (hovering: boolean) => void;
}

function Marker({
  category,
  zone,
  side,
  index,
  reduceMotion,
  boosted,
  onClick,
  onHoverChange,
}: MarkerProps) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
      initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: reduceMotion ? 0 : index * 0.15,
      }}
    >
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        aria-label={`Jump to ${category}`}
        className="relative block w-3 h-3 -translate-x-1/2 -translate-y-1/2 focus-gold"
      >
        <span className="relative flex items-center justify-center w-3 h-3">
          {!reduceMotion && (
            <motion.span
              className={`absolute inline-flex h-full w-full rounded-full ${
                boosted ? "bg-lumen-gold/90" : "bg-lumen-gold/60"
              }`}
              animate={{
                scale: boosted ? [1, 2.6, 1] : [1, 1.9, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: boosted ? 0.9 : 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          <span
            className={`relative rounded-full bg-lumen-gold shadow-[0_0_8px_rgba(244,196,48,0.8)] transition-all duration-200 ${
              boosted ? "w-3.5 h-3.5" : "w-2.5 h-2.5"
            }`}
          />
        </span>

        <span
          className={`absolute top-1/2 -translate-y-1/2 flex items-center whitespace-nowrap ${
            side === "right" ? "left-full pl-1" : "right-full pr-1 flex-row-reverse"
          }`}
        >
          <span className="h-px w-4 bg-lumen-gold/60" />
          <span className="mx-1 bg-pure-black/80 border border-lumen-gold/30 text-cream-ivory text-[11px] font-medium px-2 py-1 rounded-full">
            {category}
          </span>
        </span>
      </button>
    </motion.div>
  );
}

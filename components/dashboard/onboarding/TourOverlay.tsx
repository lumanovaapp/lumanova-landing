"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { TourStep } from "@/lib/tour-steps";

interface TourOverlayProps {
  step: TourStep;
  index: number;
  total: number;
  onNext: () => void;
  onBack?: () => void;
  onSkip: () => void;
  // Called when the step's target can't be found in the DOM after a few
  // seconds — e.g. a transient render delay. Advances past it.
  onUnavailable: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const LOCATE_TIMEOUT_MS = 3000;
const LOCATE_POLL_MS = 50;
// Only paid when the target genuinely isn't in view yet (just navigated, or
// the mobile nav drawer is still sliding open) — covers a smooth scroll or
// the drawer's 250ms slide-in. Steps that are already visible skip this
// entirely and render immediately, which is the common case.
const SETTLE_WAIT_MS = 250;
const DESKTOP_BREAKPOINT_PX = 640;
const SPOTLIGHT_PADDING = 8;
const TOOLTIP_WIDTH = 340;
const VIEWPORT_MARGIN = 16;
// Small gap between the spotlight and the panel that hugs it, and a rough
// height estimate used purely for placement math (deciding which side has
// room, and vertically centering next to the target) — copy is short and
// fixed, so this doesn't need to be pixel-measured.
const TARGET_GAP = 16;
const PANEL_HEIGHT_ESTIMATE = 280;

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`);
    setIsDesktop(mql.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);
  return isDesktop;
}

function rectFromElement(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function isFullyInViewport(r: DOMRect): boolean {
  return (
    r.top >= 0 &&
    r.left >= 0 &&
    r.bottom <= window.innerHeight &&
    r.right <= window.innerWidth
  );
}

export default function TourOverlay({
  step,
  index,
  total,
  onNext,
  onBack,
  onSkip,
  onUnavailable,
}: TourOverlayProps) {
  const reduceMotion = !!useReducedMotion();
  const isDesktop = useIsDesktop();
  const [rect, setRect] = useState<Rect | null>(null);
  const elementRef = useRef<Element | null>(null);

  // Locate the target for this step, retrying while it's not yet mounted
  // (e.g. right after a route change), and give up gracefully if it never
  // shows up. If it's already on screen, show it immediately — no wait.
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    setRect(null);
    elementRef.current = null;

    function tryLocate() {
      if (cancelled) return;
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        elementRef.current = el;
        const domRect = el.getBoundingClientRect();

        if (reduceMotion || isFullyInViewport(domRect)) {
          setRect(rectFromElement(el));
          return;
        }

        // Only scroll (and wait for it to settle) when actually needed.
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => {
          if (!cancelled && elementRef.current) {
            setRect(rectFromElement(elementRef.current));
          }
        }, SETTLE_WAIT_MS);
        return;
      }
      attempts += 1;
      if (attempts * LOCATE_POLL_MS >= LOCATE_TIMEOUT_MS) {
        onUnavailable();
        return;
      }
      window.setTimeout(tryLocate, LOCATE_POLL_MS);
    }

    tryLocate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.target]);

  // Keep the spotlight glued to the target through scroll/resize.
  useEffect(() => {
    function remeasure() {
      if (elementRef.current) setRect(rectFromElement(elementRef.current));
    }
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", remeasure, true);
    return () => {
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure, true);
    };
  }, []);

  if (!rect) return null;

  const spotlight: Rect = {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
  };

  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 768;

  // Hug the target: prefer the side with the most room (right first, then
  // left, then below/above), sitting close with just TARGET_GAP between
  // them — not pinned to the screen edge.
  const spaceRight = viewportW - (spotlight.left + spotlight.width) - VIEWPORT_MARGIN;
  const spaceLeft = spotlight.left - VIEWPORT_MARGIN;
  const spaceBelow = viewportH - (spotlight.top + spotlight.height) - VIEWPORT_MARGIN;
  const spaceAbove = spotlight.top - VIEWPORT_MARGIN;
  const neededHorizontal = TOOLTIP_WIDTH + TARGET_GAP;
  const neededVertical = PANEL_HEIGHT_ESTIMATE + TARGET_GAP;

  let panelSide: "right" | "left" | "bottom" | "top";
  if (spaceRight >= neededHorizontal) panelSide = "right";
  else if (spaceLeft >= neededHorizontal) panelSide = "left";
  else if (spaceBelow >= neededVertical) panelSide = "bottom";
  else if (spaceAbove >= neededVertical) panelSide = "top";
  else panelSide = spaceRight >= spaceLeft ? "right" : "left";

  let panelLeft: number;
  let panelTop: number;
  if (panelSide === "right" || panelSide === "left") {
    panelLeft =
      panelSide === "right"
        ? spotlight.left + spotlight.width + TARGET_GAP
        : spotlight.left - TARGET_GAP - TOOLTIP_WIDTH;
    panelTop = spotlight.top + spotlight.height / 2 - PANEL_HEIGHT_ESTIMATE / 2;
  } else {
    panelTop =
      panelSide === "bottom"
        ? spotlight.top + spotlight.height + TARGET_GAP
        : spotlight.top - TARGET_GAP - PANEL_HEIGHT_ESTIMATE;
    panelLeft = spotlight.left + spotlight.width / 2 - TOOLTIP_WIDTH / 2;
  }

  // Clamp fully into the viewport — if the target sits near an edge, the
  // panel shifts just enough to stay fully visible while remaining on the
  // chosen side.
  panelLeft = Math.min(
    Math.max(panelLeft, VIEWPORT_MARGIN),
    Math.max(VIEWPORT_MARGIN, viewportW - TOOLTIP_WIDTH - VIEWPORT_MARGIN)
  );
  panelTop = Math.min(
    Math.max(panelTop, VIEWPORT_MARGIN),
    Math.max(VIEWPORT_MARGIN, viewportH - PANEL_HEIGHT_ESTIMATE - VIEWPORT_MARGIN)
  );

  // Arrow sits on the panel edge facing the target, offset along that edge
  // to stay aimed at the target even after the clamp above shifts the panel.
  const arrowCenterY = Math.min(
    Math.max(spotlight.top + spotlight.height / 2 - panelTop, 20),
    PANEL_HEIGHT_ESTIMATE - 20
  );
  const arrowCenterX = Math.min(
    Math.max(spotlight.left + spotlight.width / 2 - panelLeft, 20),
    TOOLTIP_WIDTH - 20
  );

  const isLast = index === total - 1;
  const transition = reduceMotion
    ? { duration: 0.1 }
    : { duration: 0.18, ease: "easeOut" as const };

  return (
    <div className="fixed inset-0 z-[59]" aria-hidden={false}>
      {/* Click absorber — keeps the dimmed page behind the tour inert.
          Deliberately a no-op on click rather than dismissing the tour, so
          a stray tap doesn't cancel it; use the Skip controls for that. */}
      <div className="absolute inset-0" />

      {/* Spotlight cutout: the box-shadow paints the dimmed backdrop, the
          box itself stays transparent so the target reads as "lit up." */}
      <motion.div
        className="absolute rounded-2xl border-2 border-lumen-gold/70 pointer-events-none"
        initial={false}
        animate={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
        }}
        transition={transition}
        style={{
          boxShadow:
            "0 0 0 9999px rgba(10,10,10,0.82), 0 0 28px rgba(244,196,48,0.35)",
        }}
      />

      {isDesktop ? (
        <motion.div
          key={step.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, top: panelTop, left: panelLeft }}
          transition={transition}
          className="fixed rounded-2xl border border-lumen-gold/25 bg-charcoal p-5 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
          style={{ width: TOOLTIP_WIDTH }}
        >
          {/* Arrow sits on whichever panel edge faces the target — left/right
              edge when the panel sits beside it, top/bottom edge when it sits
              above/below (only reached when neither side has room). */}
          <span
            className="absolute w-3 h-3 bg-charcoal rotate-45"
            style={
              panelSide === "right"
                ? {
                    top: arrowCenterY - 6,
                    left: -6,
                    borderBottom: "1px solid",
                    borderLeft: "1px solid",
                    borderColor: "rgba(244,196,48,0.25)",
                  }
                : panelSide === "left"
                ? {
                    top: arrowCenterY - 6,
                    right: -6,
                    borderTop: "1px solid",
                    borderRight: "1px solid",
                    borderColor: "rgba(244,196,48,0.25)",
                  }
                : panelSide === "bottom"
                ? {
                    left: arrowCenterX - 6,
                    top: -6,
                    borderTop: "1px solid",
                    borderLeft: "1px solid",
                    borderColor: "rgba(244,196,48,0.25)",
                  }
                : {
                    left: arrowCenterX - 6,
                    bottom: -6,
                    borderBottom: "1px solid",
                    borderRight: "1px solid",
                    borderColor: "rgba(244,196,48,0.25)",
                  }
            }
          />
          <TourCard
            step={step}
            index={index}
            total={total}
            isLast={isLast}
            onNext={onNext}
            onBack={onBack}
            onSkip={onSkip}
          />
        </motion.div>
      ) : (
        <motion.div
          key={step.id}
          initial={{ y: reduceMotion ? 0 : "100%" }}
          animate={{ y: 0 }}
          transition={transition}
          className="fixed inset-x-0 bottom-0 rounded-t-3xl border-t border-lumen-gold/25 bg-charcoal p-5 [padding-bottom:max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <TourCard
            step={step}
            index={index}
            total={total}
            isLast={isLast}
            onNext={onNext}
            onBack={onBack}
            onSkip={onSkip}
          />
        </motion.div>
      )}
    </div>
  );
}

interface TourCardProps {
  step: TourStep;
  index: number;
  total: number;
  isLast: boolean;
  onNext: () => void;
  onBack?: () => void;
  onSkip: () => void;
}

function TourCard({ step, index, total, isLast, onNext, onBack, onSkip }: TourCardProps) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[10px] uppercase tracking-widest text-lumen-gold font-semibold">
          Step {index + 1} of {total}
        </span>
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip tour"
          className="text-cream-ivory/40 hover:text-cream-ivory transition-colors -mt-1 -mr-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="font-manrope font-bold text-lg text-cream-ivory">{step.title}</h3>
      <p className="font-inter text-sm text-cream-ivory/70 mt-1.5 leading-relaxed">
        {step.body}
      </p>

      <div className="flex items-center gap-1.5 mt-4">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-5 bg-lumen-gold" : "w-1.5 bg-white/15"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-5">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-medium text-cream-ivory/50 hover:text-cream-ivory transition-colors"
        >
          Skip tour
        </button>
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/15 text-cream-ivory/70 hover:bg-white/5 hover:text-cream-ivory transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="h-9 px-4 rounded-lg bg-lumen-gold text-pure-black text-sm font-manrope font-bold hover:shadow-[0_0_20px_rgba(244,196,48,0.4)] transition-shadow duration-300"
          >
            {isLast ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

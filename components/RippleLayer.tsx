"use client";

import { useReducedMotion } from "framer-motion";
import { RippleSpec } from "@/lib/use-ripple";

interface RippleLayerProps {
  ripples: RippleSpec[];
  // Defaults to a dark ink spread for buttons on the light gold fill used
  // across primary CTAs; pass a light color for dark-background buttons.
  color?: string;
}

// Renders as the first child of a `relative overflow-hidden` button, paired
// with useRipple()'s onPointerDown. No-ops entirely for
// prefers-reduced-motion — the click/tap itself is feedback enough.
export default function RippleLayer({
  ripples,
  color = "rgba(0, 0, 0, 0.18)",
}: RippleLayerProps) {
  const reduceMotion = !!useReducedMotion();
  if (reduceMotion || ripples.length === 0) return null;

  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none"
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
          }}
        />
      ))}
    </span>
  );
}

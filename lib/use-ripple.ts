"use client";

import { useCallback, useState, PointerEvent } from "react";

export interface RippleSpec {
  id: number;
  x: number;
  y: number;
  size: number;
}

let rippleId = 0;

// Attach `onPointerDown` to a `relative overflow-hidden` element and render
// the returned `ripples` via <RippleLayer /> as its first child. Purely a
// tactile click affordance — never gates or delays the element's own
// onClick behavior.
export function useRipple() {
  const [ripples, setRipples] = useState<RippleSpec[]>([]);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const id = ++rippleId;

    setRipples((prev) => [
      ...prev,
      { id, x: event.clientX - rect.left - size / 2, y: event.clientY - rect.top - size / 2, size },
    ]);

    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  }, []);

  return { ripples, onPointerDown };
}

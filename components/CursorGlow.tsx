"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const hovered = useRef(false);
  const visible = useRef(false);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const tick = () => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      const { x, y } = pos.current;

      if (outer) {
        const size = hovered.current ? 100 : 60;
        const opacity = visible.current ? (hovered.current ? 0.5 : 0.3) : 0;
        outer.style.width = `${size}px`;
        outer.style.height = `${size}px`;
        outer.style.opacity = String(opacity);
        outer.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
      }

      if (inner) {
        const opacity = visible.current ? (hovered.current ? 0.9 : 0.65) : 0;
        inner.style.opacity = String(opacity);
        inner.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      visible.current = true;
    };
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) hovered.current = true;
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) hovered.current = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      {/* Outer soft glow */}
      <div
        ref={outerRef}
        aria-hidden="true"
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998] hidden md:block"
        style={{
          width: 60,
          height: 60,
          background:
            "radial-gradient(circle, rgba(244,196,48,1) 0%, rgba(244,196,48,0.3) 40%, transparent 70%)",
          filter: "blur(16px)",
          opacity: 0,
          willChange: "transform, width, height, opacity",
          transition: "width 0.2s ease, height 0.2s ease, opacity 0.2s ease",
        }}
      />
      {/* Inner sharp dot */}
      <div
        ref={innerRef}
        aria-hidden="true"
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] hidden md:block"
        style={{
          width: 8,
          height: 8,
          background: "#F4C430",
          opacity: 0,
          willChange: "transform, opacity",
          transition: "opacity 0.2s ease",
        }}
      />
    </>
  );
}

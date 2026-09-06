"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ProgressStage, useStagedProgress } from "@/lib/use-staged-progress";

const STAGES: ProgressStage[] = [
  { label: "Scanning your features…", progress: 20 },
  { label: "Analyzing skin & tone…", progress: 50 },
  { label: "Reviewing hair & grooming…", progress: 75 },
  { label: "Finishing up…", progress: 90 },
];

const STEP_MS = 3500;
const RING_SIZE = 128;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function AnalyzingStatus() {
  const router = useRouter();
  const { stage, stageIndex, reduceMotion } = useStagedProgress(STAGES, STEP_MS);

  // The real completion signal — photo.status flipping away from
  // "analyzing" server-side. This component is swapped out for the real
  // result the moment that happens; the progress above never claims 100%
  // on its own.
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(interval);
  }, [router]);

  const offset = RING_CIRCUMFERENCE * (1 - stage.progress / 100);

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center py-16 sm:py-24 text-center">
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
        {!reduceMotion && (
          <motion.span
            className="absolute inset-0 rounded-full border border-lumen-gold/25"
            animate={{ scale: [1, 1.15], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={RING_STROKE}
          />
          <motion.circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="#F4C430"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-manrope font-black text-3xl text-lumen-gold">
            {stage.progress}%
          </span>
        </div>
      </div>

      <p className="mt-8 text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70">
        Analyzing
      </p>
      <h1 className="mt-3 font-manrope leading-tight text-2xl sm:text-3xl min-h-[1.3em]">
        <span className="font-extrabold text-lumen-gold">{stage.label}</span>
      </h1>
      <p className="mt-3 font-inter text-sm text-cream-ivory/55 max-w-sm">
        This can take up to 15 seconds. This page updates automatically.
      </p>

      {/* Stepped status — each stage lights up as it becomes active/passed,
          so the wait reads as real progress instead of a bare spinner. */}
      <div className="mt-10 flex items-center gap-2">
        {STAGES.map((s, i) => {
          const done = i < stageIndex;
          const active = i === stageIndex;
          return (
            <div key={s.label} className="flex items-center gap-2">
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full border transition-colors duration-500 ${
                  done
                    ? "bg-lumen-gold border-transparent"
                    : active
                    ? "border-lumen-gold bg-lumen-gold/15"
                    : "border-white/15 bg-white/[0.03]"
                }`}
              >
                {done ? (
                  <Check className="w-3.5 h-3.5 text-pure-black" />
                ) : (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      active ? "bg-lumen-gold" : "bg-white/20"
                    }`}
                  />
                )}
              </span>
              {i < STAGES.length - 1 && (
                <span
                  className={`h-px w-6 sm:w-10 transition-colors duration-500 ${
                    done ? "bg-lumen-gold/60" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

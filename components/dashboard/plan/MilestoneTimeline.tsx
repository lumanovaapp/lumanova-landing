"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, Check, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Plan, PhotoMilestone, MilestonePhotoSummary } from "@/lib/types";
import { toDateOnlyUTC, addDays } from "@/lib/streak";
import DayDrawer from "@/components/dashboard/plan/DayDrawer";

interface MilestoneTimelineProps {
  plan: Plan;
  createdAt: string;
  /** Current plan day, 1–90 — already derived from the plan's real
   * created_at by PlanView. Progression here is purely date-based: a
   * milestone unlocks by calendar day, never by how consistent the user was. */
  day: number;
  checkinsByDate: Record<string, Record<string, boolean>>;
  onToggleHabit: (habitId: string) => void;
  errorHabitId: string | null;
  milestonePhotos: Partial<Record<PhotoMilestone, MilestonePhotoSummary>>;
  frozenDays: number[];
  baselinePhotoUrl: string | null;
  className?: string;
}

interface TimelinePoint {
  key: PhotoMilestone;
  day: number;
  label: string;
  phase: 1 | 2 | 3;
}

// Fixed points, grouped by phase: Foundation covers baseline + Day 30,
// Build covers Day 60, Refine covers Day 90.
const POINTS: TimelinePoint[] = [
  { key: "baseline", day: 1, label: "Baseline", phase: 1 },
  { key: "day_30", day: 30, label: "Day 30", phase: 1 },
  { key: "day_60", day: 60, label: "Day 60", phase: 2 },
  { key: "day_90", day: 90, label: "Day 90", phase: 3 },
];

export default function MilestoneTimeline({
  plan,
  createdAt,
  day,
  checkinsByDate,
  onToggleHabit,
  errorHabitId,
  milestonePhotos,
  frozenDays,
  baselinePhotoUrl,
  className = "",
}: MilestoneTimelineProps) {
  const reduceMotion = !!useReducedMotion();
  // Opening this drawer is how every "Compare vs baseline" / "Upload your
  // Day N photo" action is served — it's the same shared DayDrawer the week
  // strip and full calendar use, so the upload + comparison + retry flows
  // are reused verbatim rather than re-implemented here.
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const planStart = toDateOnlyUTC(new Date(createdAt));
  const dateForDay = (d: number) =>
    addDays(planStart, d - 1).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  // The earliest point the user hasn't reached yet — highlighted as "coming up".
  const nextUpcomingDay = POINTS.find((p) => day < p.day)?.day ?? null;
  const phaseTitle = (n: number) =>
    plan.phases.find((p) => p.number === n)?.title ?? `Phase ${n}`;

  return (
    <section className={className}>
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-3">
          Progress Photos
        </p>
        <h2 className="font-manrope leading-[1.15] tracking-[-0.02em] text-xl sm:text-2xl">
          <span className="font-light text-cream-ivory/80">Your transformation,</span>{" "}
          <span className="font-extrabold text-lumen-gold">across 90 days</span>
        </h2>
      </div>

      <div className="relative">
        {POINTS.map((point, i) => {
          const isLast = i === POINTS.length - 1;
          const nextPoint = POINTS[i + 1];
          const isBaseline = point.key === "baseline";
          const photo = isBaseline ? undefined : milestonePhotos[point.key];

          const reached = day >= point.day;
          const thumbUrl = isBaseline ? baselinePhotoUrl : photo?.photoUrl ?? null;
          const captured = isBaseline ? !!baselinePhotoUrl : !!photo;
          const hasComparison = !!photo?.comparison;
          const analyzing = !!photo && photo.status === "analyzing" && !hasComparison;
          const failed = !!photo && photo.status === "failed" && !hasComparison;
          const due = !isBaseline && reached && !photo;
          const isNextUpcoming = !reached && point.day === nextUpcomingDay;
          const locked = !reached && !isNextUpcoming;

          const canOpen = !isBaseline && (captured || due);
          const openDrawer = () => canOpen && setSelectedDay(point.day);

          // How far the plan has moved from this point toward the next one —
          // fills the connector line, same motif as PhaseJourney's spine.
          const segFill = nextPoint
            ? Math.min(
                100,
                Math.max(0, ((day - point.day) / (nextPoint.day - point.day)) * 100)
              )
            : 0;

          const showPhaseLabel = i === 0 || POINTS[i - 1].phase !== point.phase;

          const daysUntil = Math.max(0, point.day - day);

          const highlight = due || isNextUpcoming;

          return (
            <div key={point.key}>
              {showPhaseLabel && (
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.18em] text-cream-ivory/40 ${
                    i === 0 ? "mb-3" : "mt-2 mb-3"
                  } ml-[3.75rem] sm:ml-[4.5rem]`}
                >
                  {phaseTitle(point.phase)}
                </p>
              )}

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative flex gap-4 sm:gap-6"
              >
                {/* Spine: node + connector down to the next point */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                      captured
                        ? "bg-lumen-gold border-transparent text-pure-black shadow-[0_0_0_3px_rgba(244,196,48,0.22)]"
                        : due
                        ? "bg-lumen-gold/10 border-lumen-gold text-lumen-gold"
                        : isNextUpcoming
                        ? "bg-lumen-gold/5 border-lumen-gold/50 text-lumen-gold/80"
                        : "bg-white/5 border-white/15 text-cream-ivory/30"
                    }`}
                  >
                    {locked ? (
                      <Lock className="w-4 h-4" />
                    ) : analyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : captured && hasComparison ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </div>
                  {!isLast && (
                    <div className="w-0.5 flex-1 min-h-[72px] rounded-full bg-white/[0.08] mt-1 overflow-hidden">
                      <motion.div
                        className="w-full bg-gradient-to-b from-lumen-gold/70 to-lumen-gold rounded-full"
                        initial={reduceMotion ? false : { height: 0 }}
                        whileInView={{ height: `${segFill}%` }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{
                          duration: reduceMotion ? 0.2 : 0.8,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 min-w-0 rounded-3xl border p-4 sm:p-5 mb-4 transition-shadow duration-500 ${
                    highlight
                      ? "border-lumen-gold/25 bg-gradient-to-br from-lumen-gold/[0.07] to-lumen-gold/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35),0_0_28px_rgba(244,196,48,0.06)]"
                      : captured
                      ? "border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02]"
                      : "border-white/[0.06] bg-white/[0.015]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail (captured points only) */}
                    {thumbUrl ? (
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbUrl}
                          alt={`${point.label} progress photo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`flex-shrink-0 w-16 h-16 rounded-xl border flex items-center justify-center ${
                          highlight
                            ? "border-lumen-gold/25 bg-lumen-gold/[0.06] text-lumen-gold/70"
                            : "border-white/[0.08] bg-white/[0.02] text-cream-ivory/25"
                        }`}
                      >
                        {locked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`font-manrope font-bold text-sm sm:text-base ${
                            locked ? "text-cream-ivory/50" : "text-cream-ivory"
                          }`}
                        >
                          {point.label}
                          {!isBaseline && (
                            <span className="text-cream-ivory/35 font-normal">
                              {" "}
                              · Day {point.day}
                            </span>
                          )}
                        </h3>
                        <StatusChip
                          isBaseline={isBaseline}
                          captured={captured}
                          hasComparison={hasComparison}
                          analyzing={analyzing}
                          failed={failed}
                          due={due}
                          isNextUpcoming={isNextUpcoming}
                        />
                      </div>

                      <p className="text-xs text-cream-ivory/45 mt-1">
                        {dateForDay(point.day)}
                        {isBaseline && baselinePhotoUrl && " · where you started"}
                      </p>

                      {/* State-specific line + action */}
                      {isBaseline ? null : analyzing ? (
                        <p className="mt-2 text-xs text-cream-ivory/60 flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Analyzing your progress…
                        </p>
                      ) : failed ? (
                        <button
                          type="button"
                          onClick={openDrawer}
                          className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-warm-coral hover:underline underline-offset-4 focus-gold"
                        >
                          Comparison didn&apos;t finish — open to retry
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : captured ? (
                        <button
                          type="button"
                          onClick={openDrawer}
                          className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-lumen-gold hover:underline underline-offset-4 focus-gold"
                        >
                          Compare vs baseline
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : due ? (
                        <button
                          type="button"
                          onClick={openDrawer}
                          className="mt-2.5 inline-flex items-center gap-2 h-9 px-4 rounded-full bg-lumen-gold text-pure-black text-xs font-manrope font-bold hover:bg-lumen-gold/90 hover:shadow-[0_0_20px_rgba(244,196,48,0.35)] active:scale-95 transition-all duration-300 focus-gold"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Upload your {point.label} photo
                        </button>
                      ) : isNextUpcoming ? (
                        <p className="mt-2 text-xs text-cream-ivory/70">
                          <span className="text-lumen-gold font-semibold">
                            {daysUntil} {daysUntil === 1 ? "day" : "days"}
                          </span>{" "}
                          until your {point.label} photo 📸
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-cream-ivory/40 flex items-center gap-1.5">
                          <Lock className="w-3 h-3" />
                          Unlocks on Day {point.day}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      <DayDrawer
        plan={plan}
        createdAt={createdAt}
        checkinsByDate={checkinsByDate}
        onToggleHabit={onToggleHabit}
        errorHabitId={errorHabitId}
        milestonePhotos={milestonePhotos}
        frozenDays={frozenDays}
        baselinePhotoUrl={baselinePhotoUrl}
        selectedDay={selectedDay}
        onClose={() => setSelectedDay(null)}
      />
    </section>
  );
}

interface StatusChipProps {
  isBaseline: boolean;
  captured: boolean;
  hasComparison: boolean;
  analyzing: boolean;
  failed: boolean;
  due: boolean;
  isNextUpcoming: boolean;
}

function StatusChip({
  isBaseline,
  captured,
  hasComparison,
  analyzing,
  failed,
  due,
  isNextUpcoming,
}: StatusChipProps) {
  let text: string;
  let tone: "gold" | "neutral" | "coral";

  if (isBaseline) {
    text = "Starting point";
    tone = captured ? "gold" : "neutral";
  } else if (failed) {
    text = "Retry needed";
    tone = "coral";
  } else if (analyzing) {
    text = "Comparing…";
    tone = "neutral";
  } else if (captured) {
    text = hasComparison ? "Captured" : "Uploaded";
    tone = "gold";
  } else if (due) {
    text = "Due now";
    tone = "gold";
  } else if (isNextUpcoming) {
    text = "Coming up";
    tone = "gold";
  } else {
    text = "Locked";
    tone = "neutral";
  }

  const toneClass =
    tone === "gold"
      ? "text-lumen-gold bg-lumen-gold/10 border-lumen-gold/25"
      : tone === "coral"
      ? "text-warm-coral bg-warm-coral/10 border-warm-coral/25"
      : "text-cream-ivory/40 bg-white/5 border-white/10";

  return (
    <span
      className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full border ${toneClass}`}
    >
      {text}
    </span>
  );
}

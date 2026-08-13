"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { Plan, PhaseNumber } from "@/lib/types";
import { ACCENT_THEME, ACCENT_ORDER } from "@/lib/accent";

interface PhaseJourneyProps {
  plan: Plan;
  day: number;
  currentPhaseNumber: PhaseNumber;
  className?: string;
}

// A deliberately un-spoiling stand-in for a locked phase's habit list — same
// motif as TomorrowTeaser's GhostRow, reused here so "locked content ahead"
// reads as one consistent visual language across the page.
function GhostLine({ width }: { width: string }) {
  return (
    <span
      className="block h-2 rounded-full bg-white/[0.06]"
      style={{ width }}
    />
  );
}

export default function PhaseJourney({
  plan,
  day,
  currentPhaseNumber,
  className = "",
}: PhaseJourneyProps) {
  const reduceMotion = !!useReducedMotion();

  return (
    <section className={className}>
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-3">
            Your Journey
          </p>
          <h2 className="font-manrope leading-[1.15] tracking-[-0.02em] text-xl sm:text-2xl">
            <span className="font-light text-cream-ivory/80">Three phases,</span>{" "}
            <span className="font-extrabold text-lumen-gold">one path</span>
          </h2>
        </div>
        <p className="hidden sm:block text-xs text-cream-ivory/45 flex-shrink-0 pb-1">
          Day {day} of 90
        </p>
      </div>

      <div className="relative">
        {plan.phases.map((phase, i) => {
          const isCurrent = phase.number === currentPhaseNumber;
          const isPast = phase.number < currentPhaseNumber;
          const isFuture = phase.number > currentPhaseNumber;
          const isLast = i === plan.phases.length - 1;

          const accent = ACCENT_ORDER[i % ACCENT_ORDER.length];
          const theme = ACCENT_THEME[accent];

          const daysIntoPhase = Math.min(30, Math.max(0, day - (phase.number - 1) * 30));
          const phaseProgressPct = isPast ? 100 : isFuture ? 0 : Math.round((daysIntoPhase / 30) * 100);

          // Segment below this node, connecting to the next one — fills as
          // the plan moves through this phase's 30 days.
          const segmentFillPct = Math.min(
            100,
            Math.max(0, Math.round(((day - i * 30) / 30) * 100))
          );

          const newHabitsCount = plan.daily_habits.filter(
            (h) => h.phase_start === phase.number
          ).length;

          return (
            <motion.div
              key={phase.number}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex gap-4 sm:gap-6"
            >
              {/* Spine: node + connecting line down to the next node */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors duration-500 ${
                    isCurrent
                      ? `${theme.bgSolid} border-transparent ${theme.solidText} ${theme.ring}`
                      : isPast
                      ? `${theme.bgSoft} ${theme.border} ${theme.text}`
                      : "bg-white/5 border-white/15 text-cream-ivory/30"
                  }`}
                >
                  {isPast ? (
                    <Check className="w-5 h-5" />
                  ) : isFuture ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    phase.number
                  )}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 min-h-[64px] rounded-full bg-white/[0.08] mt-1 overflow-hidden">
                    <motion.div
                      className="w-full bg-gradient-to-b from-lumen-gold/70 to-lumen-gold rounded-full"
                      initial={reduceMotion ? false : { height: 0 }}
                      whileInView={{ height: `${segmentFillPct}%` }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: reduceMotion ? 0.2 : 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                )}
              </div>

              {/* Card */}
              <div
                className={`flex-1 min-w-0 rounded-3xl border p-5 sm:p-6 mb-6 transition-shadow duration-500 ${
                  isCurrent
                    ? `${theme.border} ${theme.bgSoft} shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35),0_0_28px_rgba(244,196,48,0.06)]`
                    : isPast
                    ? "border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] opacity-70"
                    : "border-white/[0.06] bg-white/[0.015]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <h3
                    className={`font-manrope font-bold text-base sm:text-lg ${
                      isFuture ? "text-cream-ivory/50" : "text-cream-ivory"
                    }`}
                  >
                    {phase.title}
                  </h3>
                  {isCurrent && (
                    <span
                      className={`text-[10px] uppercase tracking-wide font-semibold ${theme.text} ${theme.bgSoft} border ${theme.border} px-2 py-0.5 rounded-full`}
                    >
                      Current
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[10px] uppercase tracking-wide font-semibold text-cream-ivory/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  )}
                  {isFuture && (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide font-semibold text-cream-ivory/35 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5" />
                      Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-cream-ivory/50 mb-3">{phase.day_range}</p>

                {isCurrent && (
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[11px] text-cream-ivory/55">
                        Day {daysIntoPhase} of 30 in this phase
                      </span>
                      <span className="text-[11px] text-lumen-gold font-medium">
                        {phaseProgressPct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-lumen-gold rounded-full"
                        initial={reduceMotion ? false : { width: 0 }}
                        whileInView={{ width: `${phaseProgressPct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: reduceMotion ? 0.2 : 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                {isFuture ? (
                  <>
                    <div className="space-y-1.5 mb-3" aria-hidden="true">
                      <GhostLine width="85%" />
                      <GhostLine width="60%" />
                    </div>
                    <p className="text-xs text-cream-ivory/45 leading-relaxed">
                      {newHabitsCount > 0
                        ? `Phase ${phase.number} unlocks ${newHabitsCount} new habit${
                            newHabitsCount === 1 ? "" : "s"
                          } — come back once Phase ${phase.number - 1} is underway.`
                        : `Phase ${phase.number} builds on what you've already started.`}
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className={`text-sm mb-4 ${
                        isCurrent ? "text-cream-ivory/70" : "text-cream-ivory/45"
                      }`}
                    >
                      {phase.focus}
                    </p>
                    <ul className="space-y-1.5">
                      {phase.milestones.map((milestone, mi) => (
                        <li
                          key={mi}
                          className={`flex items-start gap-2 text-sm ${
                            isCurrent ? "text-cream-ivory/80" : "text-cream-ivory/40"
                          }`}
                        >
                          <Check
                            className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                              isCurrent ? theme.text : "text-cream-ivory/30"
                            }`}
                          />
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Clock,
  Gauge,
  Leaf,
  ShoppingBag,
  Droplet,
  Scissors,
  Shirt,
  Wand2,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { DailyHabit, HabitCategory, HabitDifficulty } from "@/lib/types";
import { TimeOfDaySectionTheme } from "@/lib/time-of-day";

// One glanceable icon per habit dimension — falls back to a neutral spark
// when the plan predates habit `category` tagging or the value was dropped
// server-side.
const CATEGORY_ICONS: Record<HabitCategory, LucideIcon> = {
  skin: Droplet,
  hair: Scissors,
  beard: Wand2,
  style: Shirt,
};

const DIFFICULTY_LABEL: Record<HabitDifficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  advanced: "Advanced",
};

// Steps beyond this count hide behind a "N more steps" toggle so a single
// habit never turns into a wall of text. The why-line and the what-to-use
// rows always stay visible — they're short and they're the point.
const STEP_PEEK = 2;

interface HabitCardProps {
  habit: DailyHabit;
  done: boolean;
  onToggle: (habitId: string) => void;
  // The parent routine section's time-of-day theme, reused for this card's
  // "done" accent so a checked habit matches its section.
  theme: TimeOfDaySectionTheme;
  interactive?: boolean;
  // This habit is mid check-in pop animation (owned by PlanView).
  popped?: boolean;
  hasError?: boolean;
}

export default function HabitCard({
  habit,
  done,
  onToggle,
  theme,
  interactive = true,
  popped = false,
  hasError = false,
}: HabitCardProps) {
  const Icon = (habit.category && CATEGORY_ICONS[habit.category]) || Sparkles;

  const steps = habit.steps ?? [];
  const hasStructured =
    steps.length > 0 ||
    !!habit.why_it_works ||
    !!habit.natural_option ||
    !!habit.product_option;
  const hasMeta = !!habit.time_minutes || !!habit.difficulty;

  const stepsNeedToggle = steps.length > STEP_PEEK;
  const [expanded, setExpanded] = useState(false);
  const visibleSteps = expanded ? steps : steps.slice(0, STEP_PEEK);
  const hiddenStepCount = steps.length - STEP_PEEK;

  // Body (steps / why / what-to-use) collapses away once the habit is
  // checked — a done routine should read as a tight list, not stay a full
  // page of instructions.
  const showBody = !done;

  return (
    <div>
      <div
        className={`rounded-2xl border transition-colors duration-300 ${
          done
            ? `${theme.border} ${theme.bgSoft} ${theme.ring}`
            : "border-white/10 bg-pure-black/20"
        }`}
      >
        {/* Header row — the whole thing is the check-off control */}
        <button
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onToggle(habit.id)}
          aria-pressed={done}
          className={`w-full flex items-start gap-3 rounded-2xl px-3.5 sm:px-4 pt-3.5 sm:pt-4 text-left transition-colors duration-300 focus-gold ${
            showBody ? "pb-2.5" : "pb-3.5 sm:pb-4"
          } ${
            interactive
              ? "cursor-pointer hover:bg-white/[0.03]"
              : "cursor-default opacity-80"
          }`}
        >
          <motion.span
            animate={popped ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              done ? `${theme.border} bg-current ${theme.text}` : "border-white/20"
            }`}
          >
            {done && <Check className="w-3.5 h-3.5 text-pure-black" />}
          </motion.span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  done ? "text-cream-ivory/35" : theme.text
                }`}
              />
              <p
                className={`text-sm font-semibold ${
                  done ? "text-cream-ivory/50 line-through" : "text-cream-ivory"
                }`}
              >
                {habit.label}
              </p>
            </div>

            {hasMeta && (
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-cream-ivory/45">
                {habit.time_minutes ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {habit.time_minutes} min
                  </span>
                ) : null}
                {habit.difficulty ? (
                  <span className="inline-flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    {DIFFICULTY_LABEL[habit.difficulty]}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </button>

        {showBody && (
          <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pl-[3.4rem] space-y-3">
            {hasStructured ? (
              <>
                {steps.length > 0 && (
                  <div>
                    <ol className="space-y-1.5">
                      {visibleSteps.map((step, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-[13px] leading-relaxed text-cream-ivory/75"
                        >
                          <span
                            className={`flex-shrink-0 font-semibold tabular-nums ${theme.text}`}
                          >
                            {i + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    {stepsNeedToggle && (
                      <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        className="mt-2 inline-flex items-center gap-1 rounded text-[11px] font-medium text-cream-ivory/50 hover:text-cream-ivory/85 transition-colors focus-gold"
                      >
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-300 ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                        {expanded
                          ? "Show less"
                          : `${hiddenStepCount} more step${
                              hiddenStepCount === 1 ? "" : "s"
                            }`}
                      </button>
                    )}
                  </div>
                )}

                {habit.why_it_works && (
                  <p className="text-[13px] leading-relaxed text-cream-ivory/60">
                    <span className="font-semibold text-cream-ivory/80">
                      Why it works —{" "}
                    </span>
                    {habit.why_it_works}
                  </p>
                )}

                {(habit.natural_option || habit.product_option) && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cream-ivory/40">
                      What to use
                    </p>

                    {habit.natural_option && (
                      <div className="flex items-start gap-2 rounded-xl border border-aurora-mist/25 bg-aurora-mist/[0.07] px-2.5 py-2">
                        <Leaf className="w-3.5 h-3.5 text-aurora-mist flex-shrink-0 mt-0.5" />
                        <p className="text-[12px] leading-relaxed text-cream-ivory/85">
                          <span className="font-semibold text-aurora-mist">
                            Free ·{" "}
                          </span>
                          {habit.natural_option.text}
                        </p>
                      </div>
                    )}

                    {habit.product_option && (
                      <div className="flex items-start gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-cream-ivory/40 flex-shrink-0 mt-0.5" />
                        <p className="text-[12px] leading-relaxed text-cream-ivory/55">
                          <span className="font-semibold text-cream-ivory/70">
                            Optional ·{" "}
                          </span>
                          {habit.product_option.category}
                          {habit.product_option.budget
                            ? ` (${habit.product_option.budget})`
                            : ""}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              habit.detail && (
                <p className="text-[13px] leading-relaxed text-cream-ivory/60">
                  {habit.detail}
                </p>
              )
            )}
          </div>
        )}
      </div>

      {hasError && (
        <p className="mt-1 px-1 text-[10px] text-warm-coral">
          Couldn&apos;t save — reverted. Try again.
        </p>
      )}
    </div>
  );
}

"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

interface HabitCardProps {
  habit: DailyHabit;
  done: boolean;
  onToggle: (habitId: string) => void;
  // Expansion is controlled by the parent section so it can enforce
  // single-open and seed the "first incomplete habit" auto-expand.
  expanded: boolean;
  onExpandToggle: () => void;
  // The parent routine section's time-of-day theme, reused for this card's
  // "done" / accent styling so a checked habit matches its section.
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
  expanded,
  onExpandToggle,
  theme,
  interactive = true,
  popped = false,
  hasError = false,
}: HabitCardProps) {
  const reduceMotion = !!useReducedMotion();
  const Icon = (habit.category && CATEGORY_ICONS[habit.category]) || Sparkles;

  const steps = habit.steps ?? [];
  const hasStructured =
    steps.length > 0 ||
    !!habit.why_it_works ||
    !!habit.natural_option ||
    !!habit.product_option;
  const hasMeta = !!habit.time_minutes || !!habit.difficulty;
  // Anything worth opening the card for. A done habit stays collapsed to its
  // compact row regardless.
  const canExpand = !done && (hasStructured || !!habit.detail);
  const showBody = canExpand && expanded;

  return (
    <div>
      <div
        className={`rounded-2xl border transition-colors duration-300 ${
          done
            ? `${theme.border} ${theme.bgSoft} ${theme.ring}`
            : expanded
            ? "border-white/20 bg-white/[0.03]"
            : "border-white/10 bg-pure-black/20"
        }`}
      >
        {/* Compact header row: check control + tap-to-expand summary. The two
            are sibling buttons (never nested) so the check circle toggles
            completion without ever expanding the card. */}
        <div
          className={`flex items-start gap-3 px-3.5 sm:px-4 pt-3.5 sm:pt-4 ${
            showBody ? "pb-2.5" : "pb-3.5 sm:pb-4"
          }`}
        >
          <button
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onToggle(habit.id)}
            aria-pressed={done}
            aria-label={done ? "Mark not done" : "Mark done"}
            className={`flex-shrink-0 mt-0.5 rounded-full focus-gold ${
              interactive ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <motion.span
              animate={popped ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`block w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                done
                  ? `${theme.border} bg-current ${theme.text}`
                  : "border-white/20"
              }`}
            >
              {done && <Check className="w-3.5 h-3.5 text-pure-black" />}
            </motion.span>
          </button>

          <button
            type="button"
            onClick={canExpand ? onExpandToggle : undefined}
            disabled={!canExpand}
            aria-expanded={canExpand ? expanded : undefined}
            className={`flex-1 min-w-0 flex items-start gap-2 rounded-lg text-left transition-colors duration-200 focus-gold ${
              canExpand ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    done ? "text-cream-ivory/35" : theme.text
                  }`}
                />
                <p
                  className={`text-sm font-semibold ${
                    done
                      ? "text-cream-ivory/50 line-through"
                      : "text-cream-ivory"
                  }`}
                >
                  {habit.label}
                </p>
              </div>

              {hasMeta && !done && (
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

            {canExpand && (
              <ChevronDown
                className={`w-4 h-4 flex-shrink-0 mt-0.5 text-cream-ivory/35 transition-transform duration-300 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showBody && (
            <motion.div
              key="body"
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="overflow-hidden"
            >
              <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pl-[3.4rem] space-y-3">
                {hasStructured ? (
                  <>
                    {steps.length > 0 && (
                      <ol className="space-y-1.5">
                        {steps.map((step, i) => (
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasError && (
        <p className="mt-1 px-1 text-[10px] text-warm-coral">
          Couldn&apos;t save — reverted. Try again.
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import { Check, Flame, Shield } from "lucide-react";
import { Plan, PhotoMilestone, MilestonePhotoSummary } from "@/lib/types";
import { ACCENT_THEME, ACCENT_ORDER } from "@/lib/accent";
import PlanCalendar from "@/components/PlanCalendar";

const MAX_FREEZES = 2;

interface PlanViewProps {
  plan: Plan;
  createdAt: string;
  currentStreak: number;
  bestStreak: number;
  freezes: number;
  checkinsByDate: Record<string, Record<string, boolean>>;
  milestonePhotos: Partial<Record<PhotoMilestone, MilestonePhotoSummary>>;
  frozenDays: number[];
  baselinePhotoUrl: string | null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function computeDay(createdAt: string): number {
  const start = new Date(createdAt);
  const startUTC = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  );
  const now = new Date();
  const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const day = Math.floor((nowUTC - startUTC) / MS_PER_DAY) + 1;
  return Math.min(90, Math.max(1, day));
}

export default function PlanView({
  plan,
  createdAt,
  currentStreak,
  bestStreak,
  freezes,
  checkinsByDate: checkinsByDateProp,
  milestonePhotos,
  frozenDays,
  baselinePhotoUrl,
}: PlanViewProps) {
  const reduceMotion = !!useReducedMotion();

  const day = computeDay(createdAt);
  const currentPhaseNumber = Math.min(3, Math.ceil(day / 30)) as 1 | 2 | 3;
  const progressPct = Math.round((day / 90) * 100);
  const todayStr = new Date().toISOString().slice(0, 10);

  const [checkinsByDate, setCheckinsByDate] =
    useState<Record<string, Record<string, boolean>>>(checkinsByDateProp);
  const checks = checkinsByDate[todayStr] ?? {};
  const [streak, setStreak] = useState(currentStreak);
  const [best, setBest] = useState(bestStreak);
  const [freezeCount, setFreezeCount] = useState(freezes);
  const [freezePop, setFreezePop] = useState(false);
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const prevAllDoneRef = useRef(false);

  // BUG FIX: this component can stay mounted across a router.refresh() (e.g.
  // triggered elsewhere on the page), and useState's initializer only runs on
  // mount — without this, stale local state would silently fight fresh server
  // data, which is exactly what makes a checkbox look like it "reverts."
  useEffect(() => {
    setCheckinsByDate(checkinsByDateProp);
  }, [checkinsByDateProp]);

  useEffect(() => {
    setStreak(currentStreak);
  }, [currentStreak]);

  useEffect(() => {
    setBest(bestStreak);
  }, [bestStreak]);

  useEffect(() => {
    setFreezeCount(freezes);
  }, [freezes]);

  const activeHabits = plan.daily_habits.filter(
    (h) => h.phase_start <= currentPhaseNumber
  );
  const allDone =
    activeHabits.length > 0 && activeHabits.every((h) => checks[h.id]);

  useEffect(() => {
    if (allDone && !prevAllDoneRef.current) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 1600);
      prevAllDoneRef.current = allDone;
      return () => clearTimeout(timer);
    }
    prevAllDoneRef.current = allDone;
  }, [allDone]);

  async function toggleHabit(habitId: string) {
    const next = !checks[habitId];
    setCheckinsByDate((prev) => ({
      ...prev,
      [todayStr]: { ...(prev[todayStr] ?? {}), [habitId]: next },
    }));
    setErrorId(null);

    if (next && !reduceMotion) {
      setPoppedId(habitId);
      window.setTimeout(() => {
        setPoppedId((current) => (current === habitId ? null : current));
      }, 400);
    }

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit_id: habitId, date: todayStr, done: next }),
      });
      if (!response.ok) throw new Error("Failed to save check-in");

      const data = (await response.json()) as {
        current: number;
        best: number;
        freezes: number;
        freezeUsedToday: boolean;
        freezeEarnedToday: boolean;
      };
      setStreak(data.current);
      setBest(data.best);
      setFreezeCount(data.freezes);

      if (data.freezeUsedToday) {
        toast("🛡️ Streak freeze used — streak saved!");
      }
      if (data.freezeEarnedToday) {
        toast.success("Freeze earned! You can miss a day without breaking your streak.");
        if (!reduceMotion) {
          setFreezePop(true);
          window.setTimeout(() => setFreezePop(false), 500);
        }
      }
    } catch {
      setCheckinsByDate((prev) => ({
        ...prev,
        [todayStr]: { ...(prev[todayStr] ?? {}), [habitId]: !next },
      }));
      setErrorId(habitId);
      window.setTimeout(() => {
        setErrorId((current) => (current === habitId ? null : current));
      }, 3000);
    }
  }

  const currentPhase = plan.phases.find((p) => p.number === currentPhaseNumber);
  const streakTheme = ACCENT_THEME.refine;

  return (
    <>
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Slim status header — compact streak + thin progress bar, side by side */}
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.25 : 0.5, delay: reduceMotion ? 0 : 0.1 }}
        style={{ "--glow-color": "rgba(244, 196, 48, 0.22)" } as CSSProperties}
        className={`hero-glow rounded-xl border ${streakTheme.border} bg-gradient-to-br from-lumen-gold/15 to-transparent px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 glow-gold-sm`}
      >
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-lumen-gold fill-lumen-gold drop-shadow-[0_0_6px_rgba(244,196,48,0.6)]" />
            <span className="font-manrope font-black text-lg bg-gradient-to-br from-lumen-gold to-amber-300 bg-clip-text text-transparent">
              {streak}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-cream-ivory/50">
              Streak
            </span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="font-manrope font-bold text-sm text-cream-ivory">
              {best}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-cream-ivory/50">
              Best
            </span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <motion.div
            className="flex items-center gap-1"
            animate={freezePop ? { scale: [1, 1.35, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {Array.from({ length: MAX_FREEZES }, (_, i) => (
              <Shield
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < freezeCount
                    ? "text-aurora-mist fill-aurora-mist/30"
                    : "text-cream-ivory/15"
                }`}
              />
            ))}
          </motion.div>
        </div>

        <div className="flex-1 min-w-[120px]">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-medium text-cream-ivory">
              Day {day} <span className="text-cream-ivory/40">/ 90</span>
            </span>
            <span className="text-[11px] text-cream-ivory/50">{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-lumen-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: reduceMotion ? 0.25 : 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Calendar (left) + Today's Habits (right, desktop only) — mobile relies
          on the calendar drawer instead, so the two never show the same list. */}
      <div className="mt-6 mb-10 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
        <PlanCalendar
          plan={plan}
          createdAt={createdAt}
          checkinsByDate={checkinsByDate}
          onToggleHabit={toggleHabit}
          errorHabitId={errorId}
          milestonePhotos={milestonePhotos}
          frozenDays={frozenDays}
          baselinePhotoUrl={baselinePhotoUrl}
        />

        {/* Today's habits — compact list, desktop side panel only */}
        <motion.div
          animate={
            celebrate && !reduceMotion
              ? {
                  boxShadow: [
                    "0 0 0 0px rgba(127,224,211,0.5)",
                    "0 0 0 14px rgba(127,224,211,0)",
                  ],
                }
              : {}
          }
          transition={{ duration: 0.9 }}
          className="hidden md:block card-lift overflow-visible rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-manrope font-semibold text-sm text-cream-ivory">
              Today&apos;s Habits
            </h2>
            {currentPhase && (
              <span className="text-[10px] text-cream-ivory/50">
                Phase {currentPhase.number}
              </span>
            )}
          </div>

          <div className="overflow-visible">
            {activeHabits.map((habit) => {
              const done = !!checks[habit.id];
              const hasError = errorId === habit.id;
              const doneTheme = ACCENT_THEME.maintain;
              return (
                <div key={habit.id} className="mb-1.5 last:mb-0">
                  <button
                    type="button"
                    onClick={() => toggleHabit(habit.id)}
                    className={`overflow-visible w-full flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all duration-300 ${
                      done
                        ? `${doneTheme.border} ${doneTheme.bgSoft} ${doneTheme.ring}`
                        : "border-white/10 bg-pure-black/20 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <motion.span
                      animate={
                        poppedId === habit.id ? { scale: [1, 1.3, 1] } : { scale: 1 }
                      }
                      transition={{ duration: 0.4 }}
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        done
                          ? `${doneTheme.bgSolid} border-transparent`
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {done && <Check className={`w-3 h-3 ${doneTheme.solidText}`} />}
                    </motion.span>
                    <p
                      className={`flex-1 min-w-0 text-xs font-medium ${
                        done ? "text-cream-ivory/50 line-through" : "text-cream-ivory"
                      }`}
                    >
                      {habit.label}
                    </p>
                  </button>
                  {hasError && (
                    <p className="mt-1 px-1 text-[10px] text-warm-coral">
                      Couldn&apos;t save — reverted. Try again.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {celebrate && (
              <motion.div
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.05 }}
                transition={{ duration: 0.35 }}
                className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-aurora-mist/40 bg-aurora-mist/10 py-2 text-center"
              >
                <span className="text-sm">🎉</span>
                <span className="font-manrope font-bold text-[11px] text-aurora-mist uppercase tracking-wide">
                  All done for today
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Plan overview — now sits with the rest, ahead of the phases */}
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.25 : 0.5 }}
      >
        <p className="text-xs uppercase tracking-widest text-lumen-gold font-medium mb-3">
          Your 90-Day Plan
        </p>
        <p className="font-manrope font-semibold text-2xl sm:text-3xl text-cream-ivory leading-relaxed">
          {plan.overview}
        </p>
      </motion.div>

      {/* Phases — horizontal timeline, one accent per phase */}
      <div className="mt-10">
        <h2 className="font-manrope font-bold text-xl text-cream-ivory mb-6">
          Your Phases
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative overflow-visible">
          <div className="hidden sm:block absolute top-6 left-[16.6%] right-[16.6%] h-px bg-white/10 -z-10" />
          {plan.phases.map((phase, i) => {
            const isCurrent = phase.number === currentPhaseNumber;
            const isPast = phase.number < currentPhaseNumber;
            const accent = ACCENT_ORDER[i % ACCENT_ORDER.length];
            const theme = ACCENT_THEME[accent];

            return (
              <motion.div
                key={phase.number}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: reduceMotion ? 0.25 : 0.5,
                  delay: reduceMotion ? 0 : i * 0.12,
                }}
                className="overflow-visible"
              >
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 mb-3">
                  <span
                    className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      isCurrent
                        ? `${theme.bgSolid} border-transparent ${theme.solidText}`
                        : isPast
                        ? "bg-white/10 border-white/20 text-cream-ivory/50"
                        : "bg-pure-black border-white/20 text-cream-ivory/40"
                    }`}
                  >
                    {phase.number}
                  </span>
                </div>

                <div
                  className={`card-lift overflow-visible rounded-2xl border p-6 sm:p-7 transition-shadow duration-500 ${
                    isCurrent
                      ? `${theme.border} ${theme.bgSoft} ${theme.ring}`
                      : "border-white/10 bg-white/5 opacity-60 hover:opacity-90"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-manrope font-bold text-lg text-cream-ivory">
                      {phase.title}
                    </h3>
                    {isCurrent && (
                      <span
                        className={`text-[11px] uppercase tracking-wide font-semibold ${theme.text} ${theme.bgSoft} border ${theme.border} px-2 py-0.5 rounded-full`}
                      >
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cream-ivory/50 mb-3">{phase.day_range}</p>
                  <p className="text-sm text-cream-ivory/70 mb-4">{phase.focus}</p>
                  <ul className="space-y-1.5">
                    {phase.milestones.map((milestone, mi) => (
                      <li
                        key={mi}
                        className="flex items-start gap-2 text-sm text-cream-ivory/80"
                      >
                        <Check
                          className={`w-4 h-4 ${theme.text} flex-shrink-0 mt-0.5`}
                        />
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}

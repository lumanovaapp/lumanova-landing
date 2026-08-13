"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import { Check, Flame, Shield } from "lucide-react";
import { Analysis, Plan, PhotoMilestone, MilestonePhotoSummary } from "@/lib/types";
import { ACCENT_THEME } from "@/lib/accent";
import PlanCalendar from "@/components/PlanCalendar";
import { fetchWithTimeout } from "@/lib/api-error";
import { showAchievementToasts } from "@/components/AchievementToast";
import DailyCoachLine from "@/components/dashboard/plan/DailyCoachLine";
import MilestoneCountdown from "@/components/dashboard/plan/MilestoneCountdown";
import TomorrowTeaser from "@/components/dashboard/plan/TomorrowTeaser";
import DayCompleteCelebration from "@/components/dashboard/plan/DayCompleteCelebration";
import TargetLook from "@/components/dashboard/plan/TargetLook";
import PhaseJourney from "@/components/dashboard/plan/PhaseJourney";

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
  coachLine: string | null;
  analysis: Analysis | null;
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
  coachLine,
  analysis,
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
      const response = await fetchWithTimeout("/api/checkin", {
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
        newlyUnlocked?: string[];
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
      if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
        showAchievementToasts(data.newlyUnlocked);
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
  const doneTheme = ACCENT_THEME.maintain;

  return (
    <>
    <DayCompleteCelebration active={celebrate} streak={streak} />
    <div>
      {/* Page header — left-aligned, editorial, matches the rest of the app */}
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.25 : 0.5 }}
        className="mb-8"
      >
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-3">
          Your 90-Day Plan
        </p>
        <h1 className="font-manrope leading-[1.15] tracking-[-0.02em] text-2xl sm:text-3xl lg:text-4xl mb-3">
          <span className="font-light text-cream-ivory/80">Day {day} of 90 on your</span>{" "}
          <span className="font-extrabold text-lumen-gold">path to lasting change</span>
        </h1>
        <p className="font-inter text-sm sm:text-base text-cream-ivory/55 max-w-2xl leading-relaxed">
          {plan.overview}
        </p>
      </motion.div>

      {/* Status band — streak/progress and the milestone countdown side by
          side, so momentum (today) and destination (next photo check-in)
          read together at a glance, right up top. */}
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.25 : 0.5, delay: reduceMotion ? 0 : 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 lg:gap-5 items-stretch"
      >
        <div
          style={{ "--glow-color": "rgba(244, 196, 48, 0.22)" } as CSSProperties}
          className={`hero-glow rounded-2xl border ${streakTheme.border} bg-gradient-to-br from-lumen-gold/15 to-transparent px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 glow-gold-sm`}
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
        </div>

        <MilestoneCountdown day={day} className="h-full" />
      </motion.div>

      {/* Today — the daily coach line plus every active habit, front and
          center on every screen size (not just a desktop sidebar) since
          this is the day-to-day heartbeat of the whole plan. Once the full
          day is done, the card shifts to a gold "completed" treatment and
          the locked teaser for tomorrow appears underneath. */}
      <motion.section
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.25 : 0.5, delay: reduceMotion ? 0 : 0.15 }}
        className="mt-8 md:mt-10"
      >
        <motion.div
          animate={
            celebrate && !reduceMotion
              ? {
                  boxShadow: [
                    "0 0 0 0px rgba(244,196,48,0.5)",
                    "0 0 0 14px rgba(244,196,48,0)",
                  ],
                }
              : {}
          }
          transition={{ duration: 0.9 }}
          className={`rounded-3xl border p-6 sm:p-8 transition-colors duration-500 ${
            allDone
              ? "border-lumen-gold/30 bg-gradient-to-b from-lumen-gold/[0.07] to-lumen-gold/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35),0_0_28px_rgba(244,196,48,0.08)]"
              : "border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)]"
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70">
              Today
            </p>
            {currentPhase && (
              <span className="text-[10px] text-cream-ivory/50">
                Phase {currentPhase.number}
              </span>
            )}
          </div>
          <h2 className="font-manrope font-bold text-lg sm:text-xl text-cream-ivory mb-4">
            Your habits for today
          </h2>

          <DailyCoachLine line={coachLine} className="mb-5" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeHabits.map((habit) => {
              const done = !!checks[habit.id];
              const hasError = errorId === habit.id;
              return (
                <div key={habit.id}>
                  <button
                    type="button"
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-full flex items-start gap-3 rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-300 focus-gold ${
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
                      className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        done
                          ? `${doneTheme.bgSolid} border-transparent`
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {done && <Check className={`w-3.5 h-3.5 ${doneTheme.solidText}`} />}
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          done ? "text-cream-ivory/50 line-through" : "text-cream-ivory"
                        }`}
                      >
                        {habit.label}
                      </p>
                      {habit.detail && (
                        <p
                          className={`text-xs mt-0.5 leading-relaxed ${
                            done ? "text-cream-ivory/25" : "text-cream-ivory/45"
                          }`}
                        >
                          {habit.detail}
                        </p>
                      )}
                    </div>
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

          {/* Always mounted — reserves its own space at all times so
              flipping `allDone` only ever changes opacity/scale (paint),
              never the card's height. A conditional mount/unmount here
              would grow the card the instant the last habit is checked,
              which is exactly what was shifting scroll position (see
              DayCompleteCelebration for the actual celebration overlay,
              which is `fixed` and was never the cause). */}
          <motion.div
            initial={false}
            animate={
              allDone
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: reduceMotion ? 1 : 0.85 }
            }
            transition={{ duration: 0.35 }}
            aria-hidden={!allDone}
            className={`mt-4 flex items-center justify-center gap-2 rounded-lg border border-lumen-gold/40 bg-lumen-gold/10 py-2 text-center ${
              allDone ? "" : "pointer-events-none"
            }`}
          >
            <motion.span
              animate={
                allDone ? { scale: 1, rotate: 0 } : { scale: 0.4, rotate: -20 }
              }
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 16,
                delay: allDone ? 0.1 : 0,
              }}
              className="w-4 h-4 rounded-full bg-lumen-gold flex items-center justify-center flex-shrink-0"
            >
              <Check className="w-2.5 h-2.5 text-pure-black" />
            </motion.span>
            <span className="font-manrope font-bold text-[11px] text-lumen-gold uppercase tracking-wide">
              All done for today
            </span>
          </motion.div>
        </motion.div>

        {/* Same reasoning as above — always mounted, opacity-only reveal,
            so the teaser appearing never displaces the calendar/journey
            sections underneath it. */}
        <motion.div
          initial={false}
          animate={{ opacity: allDone ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          aria-hidden={!allDone}
          className={`mt-4 ${allDone ? "" : "pointer-events-none"}`}
        >
          <TomorrowTeaser nextDay={Math.min(90, day + 1)} />
        </motion.div>
      </motion.section>

      {/* Your Target Look — reference visuals for the user's real focus
          areas, so the daily habits above point at a concrete destination. */}
      <TargetLook analysis={analysis} className="mt-8 md:mt-10" />

      {/* The phase journey — a path, not a flat list: current phase
          expanded, past phases marked complete, future phases previewed
          but locked. */}
      <PhaseJourney
        plan={plan}
        day={day}
        currentPhaseNumber={currentPhaseNumber}
        className="mt-8 md:mt-10"
      />

      {/* Calendar — full width now that Today's Habits lives in its own
          section above instead of squeezed into a side panel next to it. */}
      <motion.section
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.25 : 0.5, delay: reduceMotion ? 0 : 0.1 }}
        className="mt-8 md:mt-10 mb-12"
      >
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
      </motion.section>
    </div>
    </>
  );
}

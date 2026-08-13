"use client";

import { useEffect, useLayoutEffect, useRef, useState, CSSProperties } from "react";
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
import HabitList from "@/components/dashboard/plan/HabitList";

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

  const activeHabits = plan.daily_habits.filter(
    (h) => h.phase_start <= currentPhaseNumber
  );
  const allDone =
    activeHabits.length > 0 && activeHabits.every((h) => checks[h.id]);

  // Seeded from the FIRST render's (persisted) allDone value, not hardcoded
  // `false` — otherwise a day that was already fully checked off in an
  // earlier session reads as a fresh "not done -> done" transition the
  // instant this component mounts, firing the celebration on every page
  // load/scroll-into-view instead of only right after a live completion.
  const prevAllDoneRef = useRef(allDone);
  // Captured synchronously at the start of a habit toggle, restored in a
  // layout effect right after the resulting DOM update commits (before the
  // browser paints) — a deterministic guarantee that no reflow anywhere in
  // this render (celebration, completion banner, calendar cell colors, etc.)
  // can ever leave the page scrolled anywhere other than where it started.
  const scrollRestoreRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (allDone && !prevAllDoneRef.current) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 2200);
      prevAllDoneRef.current = allDone;
      return () => clearTimeout(timer);
    }
    prevAllDoneRef.current = allDone;
  }, [allDone]);

  useLayoutEffect(() => {
    if (scrollRestoreRef.current !== null) {
      window.scrollTo(0, scrollRestoreRef.current);
      scrollRestoreRef.current = null;
    }
  }, [checkinsByDate]);

  async function toggleHabit(habitId: string) {
    scrollRestoreRef.current = window.scrollY;
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

          <HabitList
            habits={activeHabits}
            checks={checks}
            onToggle={toggleHabit}
            poppedId={poppedId}
            errorId={errorId}
            showDetail
          />

          {/* Always mounted — reserves its own space at all times so this
              never grows/shrinks the card's height (a conditional
              mount/unmount here is exactly what used to shift scroll
              position). Visibility is gated on `celebrate` (the transient
              "just crossed into all-done THIS session" signal), not the
              persisted `allDone` value — so it pops in right after the
              live completion and fades back out a couple seconds later,
              instead of staying permanently visible any time the day
              happens to already be complete (including on page load). The
              card's gold border/background above is a separate, persistent
              status treatment — that one stays tied to `allDone`, since a
              color isn't a "pop-up." */}
          <motion.div
            initial={false}
            animate={
              celebrate
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: reduceMotion ? 1 : 0.85 }
            }
            transition={{ duration: 0.35 }}
            aria-hidden={!celebrate}
            className={`mt-4 flex items-center justify-center gap-2 rounded-lg border border-lumen-gold/40 bg-lumen-gold/10 py-2 text-center ${
              celebrate ? "" : "pointer-events-none"
            }`}
          >
            <motion.span
              animate={
                celebrate ? { scale: 1, rotate: 0 } : { scale: 0.4, rotate: -20 }
              }
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 16,
                delay: celebrate ? 0.1 : 0,
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

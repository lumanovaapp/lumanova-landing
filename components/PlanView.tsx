"use client";

import { useEffect, useLayoutEffect, useRef, useState, CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import { Flame, Shield } from "lucide-react";
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
import StyleGuide from "@/components/dashboard/plan/StyleGuide";
import PhaseJourney from "@/components/dashboard/plan/PhaseJourney";
import MilestoneTimeline from "@/components/dashboard/plan/MilestoneTimeline";
import WeekStrip from "@/components/dashboard/plan/WeekStrip";
import TodayRoutine from "@/components/dashboard/plan/TodayRoutine";
import { useTour } from "@/components/dashboard/onboarding/TourProvider";

const MAX_FREEZES = 2;

type PlanTab = "today" | "journey";

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
  const [tab, setTab] = useState<PlanTab>("today");
  const { activeTarget } = useTour();

  // The guided tour's plan-page steps live on the Today tab (streak bar,
  // week strip, routine) — force that tab active when one of them is the
  // current step, same reasoning as MobileNav opening its drawer for
  // nav-targeted steps. A plain route push to the same URL doesn't reset
  // component state, so without this a user already sitting on the Journey
  // tab would have the tour point at elements that aren't on screen.
  useEffect(() => {
    if (
      activeTarget === "tour-plan-streak" ||
      activeTarget === "tour-week-strip" ||
      activeTarget === "tour-routine"
    ) {
      setTab("today");
    }
  }, [activeTarget]);

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
  // this render (celebration, routine section pops, calendar cell colors,
  // etc.) can ever leave the page scrolled anywhere other than where it
  // started.
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
      const timer = setTimeout(() => setCelebrate(false), 2600);
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

  const streakTheme = ACCENT_THEME.refine;

  return (
    <>
    <DayCompleteCelebration active={celebrate} streak={streak} coachLine={coachLine} />
    <div>
      {/* Page header — left-aligned, editorial, matches the rest of the app */}
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.25 : 0.5 }}
        className="mb-6"
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

      {/* Tab control — Today (the daily loop, default) vs. Journey (the
          big-picture view, checked occasionally). */}
      <div className="mb-6 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
        <button
          type="button"
          onClick={() => setTab("today")}
          aria-pressed={tab === "today"}
          className={`px-5 py-2 rounded-full text-sm font-manrope font-semibold transition-all duration-300 focus-gold ${
            tab === "today"
              ? "bg-lumen-gold text-pure-black shadow-[0_0_16px_rgba(244,196,48,0.3)]"
              : "text-cream-ivory/55 hover:text-cream-ivory"
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setTab("journey")}
          aria-pressed={tab === "journey"}
          data-tour="tour-journey-tab"
          className={`px-5 py-2 rounded-full text-sm font-manrope font-semibold transition-all duration-300 focus-gold ${
            tab === "journey"
              ? "bg-lumen-gold text-pure-black shadow-[0_0_16px_rgba(244,196,48,0.3)]"
              : "text-cream-ivory/55 hover:text-cream-ivory"
          }`}
        >
          Journey
        </button>
      </div>

      {tab === "today" ? (
        <motion.div
          key="today"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.35 }}
        >
          {/* Compact streak bar — streak, best, freezes, day progress, and
              the milestone countdown, folded into one slim row instead of
              a multi-card block, so the daily screen stays short. */}
          <div
            data-tour="tour-plan-streak"
            style={{ "--glow-color": "rgba(244, 196, 48, 0.22)" } as CSSProperties}
            className={`hero-glow rounded-2xl border ${streakTheme.border} bg-gradient-to-br from-lumen-gold/15 to-transparent px-5 py-3.5 flex flex-wrap items-center gap-x-5 gap-y-2.5 glow-gold-sm`}
          >
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-lumen-gold fill-lumen-gold drop-shadow-[0_0_6px_rgba(244,196,48,0.6)]" />
              <span className="font-manrope font-black text-base bg-gradient-to-br from-lumen-gold to-amber-300 bg-clip-text text-transparent">
                {streak}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-cream-ivory/50">
                Streak
              </span>
            </div>
            <div className="h-5 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="font-manrope font-bold text-sm text-cream-ivory">
                {best}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-cream-ivory/50">
                Best
              </span>
            </div>
            <div className="h-5 w-px bg-white/10 hidden sm:block" />
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
            <div className="h-5 w-px bg-white/10 hidden sm:block" />
            <div className="flex-1 min-w-[140px] flex items-center gap-2">
              <span className="text-[11px] text-cream-ivory whitespace-nowrap">
                Day {day}<span className="text-cream-ivory/40">/90</span>
              </span>
              <div className="flex-1 min-w-[50px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-lumen-gold rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: reduceMotion ? 0.25 : 0.8, ease: "easeOut" }}
                />
              </div>
              <span className="text-[11px] text-cream-ivory/50">{progressPct}%</span>
            </div>
            <div className="h-5 w-px bg-white/10 hidden sm:block" />
            <MilestoneCountdown day={day} compact />
          </div>

          {/* Week strip — the default, glanceable view of "where am I."
              Tapping a day (mobile: bottom drawer, desktop: inline panel)
              shows that day read-only/locked; "View full plan" switches to
              the Journey tab's full 90-day map instead of inlining it here. */}
          <div data-tour="tour-week-strip" className="mt-4">
            <WeekStrip
              plan={plan}
              createdAt={createdAt}
              checkinsByDate={checkinsByDate}
              onToggleHabit={toggleHabit}
              errorHabitId={errorId}
              milestonePhotos={milestonePhotos}
              frozenDays={frozenDays}
              baselinePhotoUrl={baselinePhotoUrl}
              onViewFullPlan={() => setTab("journey")}
            />
          </div>

          {/* Today's routine — the main content of this tab. Always shown,
              no tap needed: the coach line, then Morning/Afternoon/Evening/
              Anytime as their own color-coded, checkable cards (see
              TodayRoutine + RoutineSection). Once every section is done,
              the locked teaser for tomorrow appears underneath and the
              bigger day-complete overlay fires once (see
              DayCompleteCelebration above). */}
          <section data-tour="tour-routine" className="mt-8">
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-1">
              Today
            </p>
            <h2 className="font-manrope font-bold text-lg sm:text-xl text-cream-ivory mb-4">
              Your routine for today
            </h2>

            <DailyCoachLine line={coachLine} className="mb-5" />

            <TodayRoutine
              habits={activeHabits}
              checks={checks}
              onToggle={toggleHabit}
              poppedId={poppedId}
              errorId={errorId}
            />

            {/* Always mounted — reserves its own space at all times so this
                never grows/shrinks the layout (a conditional mount/unmount
                here is exactly what used to shift scroll position).
                Opacity-only reveal, tied to the persisted `allDone` (this
                is meant to stay visible as a status card, unlike the
                transient celebrations). */}
            <motion.div
              initial={false}
              animate={{ opacity: allDone ? 1 : 0 }}
              transition={{ duration: 0.35 }}
              aria-hidden={!allDone}
              className={`mt-4 ${allDone ? "" : "pointer-events-none"}`}
            >
              <TomorrowTeaser nextDay={Math.min(90, day + 1)} />
            </motion.div>
          </section>
        </motion.div>
      ) : (
        <motion.div
          key="journey"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.35 }}
          className="mb-12"
        >
          {/* The phase journey — a path, not a flat list: current phase
              expanded, past phases marked complete, future phases previewed
              but locked. */}
          <PhaseJourney
            plan={plan}
            day={day}
            currentPhaseNumber={currentPhaseNumber}
          />

          {/* Progress photos as a date-based timeline — baseline / 30 / 60 /
              90 grouped by phase, each captured milestone linking into the
              same DayDrawer used everywhere else for its comparison. */}
          <MilestoneTimeline
            plan={plan}
            createdAt={createdAt}
            day={day}
            checkinsByDate={checkinsByDate}
            onToggleHabit={toggleHabit}
            errorHabitId={errorId}
            milestonePhotos={milestonePhotos}
            frozenDays={frozenDays}
            baselinePhotoUrl={baselinePhotoUrl}
            className="mt-8 md:mt-10"
          />

          {/* Your Target Look — reference visuals for the user's real focus
              areas, so the daily habits point at a concrete destination. */}
          <TargetLook
            analysis={analysis}
            profileTypes={plan.profile_types}
            className="mt-8 md:mt-10"
          />

          {/* Your Colors & Style — type-matched by skin undertone the same
              way Target Look is type-matched by beard/hair, placed right
              after it so the two visual reference sections read as one
              group. */}
          <StyleGuide analysis={analysis} plan={plan} className="mt-8 md:mt-10" />

          {/* Full 90-day map — the "zoomed out" view. Checked occasionally,
              not part of the daily loop, so it's fine for this tab to
              scroll freely. */}
          <div className="mt-8 md:mt-10">
            <h2 className="font-manrope font-bold text-lg sm:text-xl text-cream-ivory mb-4">
              Full 90-day map
            </h2>
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
          </div>
        </motion.div>
      )}
    </div>
    </>
  );
}

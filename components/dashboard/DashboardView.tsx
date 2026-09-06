"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Camera,
  Sparkles,
  MessageCircle,
  Flame,
  Shield,
  Check,
  ArrowRight,
  Upload,
  CalendarDays,
} from "lucide-react";
import { Ethnicity, Goal } from "@/types/database";
import { Plan } from "@/lib/types";
import { ACCENT_THEME } from "@/lib/accent";
import GeneratePlanButton from "@/components/dashboard/plan/GeneratePlanButton";
import DailyCoachLine from "@/components/dashboard/plan/DailyCoachLine";
import MilestoneCountdown from "@/components/dashboard/plan/MilestoneCountdown";
import TomorrowTeaser from "@/components/dashboard/plan/TomorrowTeaser";
import ProgressRing from "@/components/dashboard/ProgressRing";
import WeekHeatmap, { WeekHeatmapDay } from "@/components/dashboard/WeekHeatmap";

const ETHNICITY_LABELS: Record<Ethnicity, string> = {
  south_asian: "South Asian",
  east_asian: "East Asian",
  latino: "Latino",
  african: "African",
  middle_eastern: "Middle Eastern",
  southeast_asian: "Southeast Asian",
  mixed: "Mixed / Other",
  other: "Mixed / Other",
};

const GOAL_LABELS: Record<Goal, string> = {
  skincare: "Skincare",
  grooming: "Grooming",
  fitness: "Fitness",
  confidence: "Confidence",
  sleep: "Sleep",
  style: "Style",
};

const MAX_FREEZES = 2;
const HABIT_PREVIEW_LIMIT = 4;

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
};

// Card surfaces — matches the gradient-surface recipe used across the
// premium-redesigned public pages (Testimonials.tsx, WhyDifferent.tsx).
const cardClass =
  "rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-6 sm:p-8";
const goldCardClass =
  "rounded-3xl border border-lumen-gold/20 bg-gradient-to-br from-lumen-gold/[0.07] to-lumen-gold/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-6 sm:p-8";
const eyebrowClass =
  "text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70";

interface DashboardViewProps {
  fullName: string;
  age: number | null;
  ethnicity: Ethnicity | null;
  goals: Goal[];
  hasAnalysis: boolean;
  hasPlan: boolean;
  latestPhotoId: string | null;
  plan: Plan | null;
  planDay: number;
  streak: number;
  bestStreak: number;
  freezes: number;
  todayChecks: Record<string, boolean>;
  coachLine: string | null;
  weekHeatmap: WeekHeatmapDay[];
}

export default function DashboardView({
  fullName,
  age,
  ethnicity,
  goals,
  hasAnalysis,
  hasPlan,
  latestPhotoId,
  plan,
  planDay,
  streak,
  bestStreak,
  freezes,
  todayChecks,
  coachLine,
  weekHeatmap,
}: DashboardViewProps) {
  const currentPhaseNumber = plan
    ? (Math.min(3, Math.ceil(planDay / 30)) as 1 | 2 | 3)
    : 1;
  const phaseTitle = plan?.phases.find((p) => p.number === currentPhaseNumber)?.title;
  const activeHabits = plan
    ? plan.daily_habits.filter((h) => h.phase_start <= currentPhaseNumber)
    : [];
  const doneCount = activeHabits.filter((h) => todayChecks[h.id]).length;
  const doneTheme = ACCENT_THEME.maintain;
  const dayComplete = activeHabits.length > 0 && doneCount === activeHabits.length;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 lg:space-y-10"
    >
      {/* Page header — left-aligned, editorial, matches the landing page
          recipe. The ring on the right is the dashboard's one big "graphical"
          element: overall 90-day completion, at a glance. */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
      >
        <div className="max-w-2xl">
          <p className={`${eyebrowClass} mb-3`}>
            {hasPlan ? `Day ${planDay} of 90${phaseTitle ? ` · ${phaseTitle}` : ""}` : "Your Dashboard"}
          </p>
          <h1 className="font-manrope text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] tracking-[-0.02em]">
            <span className="font-light text-cream-ivory/80">Welcome back,</span>{" "}
            <span className="font-extrabold text-lumen-gold">{fullName}</span>
          </h1>
          <p className="font-inter text-base text-cream-ivory/55 mt-3">
            {hasPlan
              ? `Day ${planDay} of your 90-day glow-up 🔥`
              : hasAnalysis
              ? "Your analysis is ready — turn it into your 90-day plan."
              : "Upload a selfie to kick off your 90-day glow-up."}
          </p>
        </div>
        {hasPlan && <ProgressRing day={planDay} className="w-full lg:w-auto" />}
      </motion.div>

      {hasPlan && (
        <motion.div variants={itemVariants}>
          <MilestoneCountdown day={planDay} />
        </motion.div>
      )}

      {/* Main content — asymmetric 12-col grid, full width */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {hasPlan && plan && (
          <>
            {/* Streak + 7-day consistency */}
            <motion.div
              variants={itemVariants}
              data-tour="tour-streak"
              className={`${goldCardClass} lg:col-span-4`}
            >
              <div className="flex items-center justify-around gap-4">
                <div className="flex flex-col items-center">
                  <Flame className="w-8 h-8 text-lumen-gold fill-lumen-gold drop-shadow-[0_0_10px_rgba(244,196,48,0.5)]" />
                  <span className="font-manrope font-black text-4xl bg-gradient-to-br from-lumen-gold to-amber-300 bg-clip-text text-transparent mt-2">
                    {streak}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-cream-ivory/50 mt-1">
                    Day Streak
                  </span>
                </div>
                <div className="h-14 w-px bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="font-manrope font-black text-2xl text-cream-ivory/80 mt-1.5">
                    {bestStreak}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-cream-ivory/50 mt-1">
                    Best
                  </span>
                </div>
                <div className="h-14 w-px bg-white/10" />
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: MAX_FREEZES }, (_, i) => (
                      <Shield
                        key={i}
                        className={`w-5 h-5 ${
                          i < freezes
                            ? "text-aurora-mist fill-aurora-mist/30"
                            : "text-cream-ivory/15"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-cream-ivory/50 mt-1">
                    Freezes
                  </span>
                </div>
              </div>

              {weekHeatmap.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cream-ivory/40 mb-3">
                    Last 7 Days
                  </p>
                  <WeekHeatmap days={weekHeatmap} />
                </div>
              )}
            </motion.div>

            {/* Today's habits preview — gold "completed" treatment once every
                active habit is checked, matching the plan page's Today's
                Habits panel instead of staying visually identical to
                mid-progress. */}
            <motion.div
              variants={itemVariants}
              data-tour="tour-habits"
              className={`${dayComplete ? goldCardClass : cardClass} lg:col-span-8 transition-colors duration-500`}
            >
              <DailyCoachLine line={coachLine} className="mb-5" />
              <div className="flex items-center justify-between mb-5">
                <p className={eyebrowClass}>Today&apos;s Habits</p>
                <span className="text-xs text-cream-ivory/50">
                  {doneCount}/{activeHabits.length} done
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {activeHabits.slice(0, HABIT_PREVIEW_LIMIT).map((habit) => {
                  const done = !!todayChecks[habit.id];
                  return (
                    <div
                      key={habit.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors duration-300 ${
                        done
                          ? `${doneTheme.border} ${doneTheme.bgSoft}`
                          : "border-white/10 bg-pure-black/20"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          done
                            ? `${doneTheme.bgSolid} border-transparent`
                            : "border-white/20"
                        }`}
                      >
                        {done && (
                          <Check className={`w-3.5 h-3.5 ${doneTheme.solidText}`} />
                        )}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          done
                            ? "text-cream-ivory/50 line-through"
                            : "text-cream-ivory"
                        }`}
                      >
                        {habit.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {activeHabits.length > HABIT_PREVIEW_LIMIT && (
                <p className="text-xs text-cream-ivory/40 mt-3">
                  +{activeHabits.length - HABIT_PREVIEW_LIMIT} more
                </p>
              )}
              <Link
                href="/dashboard/plan"
                className="focus-gold mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-lumen-gold hover:underline underline-offset-4"
              >
                Check in on today
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              {dayComplete && (
                <TomorrowTeaser
                  nextDay={Math.min(90, planDay + 1)}
                  className="mt-5"
                />
              )}
            </motion.div>
          </>
        )}

        <motion.div
          variants={itemVariants}
          className={`${cardClass} ${hasPlan ? "lg:col-span-4" : "lg:col-span-5"}`}
        >
          <p className={`${eyebrowClass} mb-6`}>Your Profile</p>
          <div className="grid grid-cols-2 gap-5 mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-cream-ivory/40 mb-1.5">
                Age
              </p>
              <p className="font-manrope text-xl font-bold text-cream-ivory">
                {age ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-cream-ivory/40 mb-1.5">
                Ethnicity
              </p>
              <p className="font-manrope text-xl font-bold text-cream-ivory">
                {ethnicity ? ETHNICITY_LABELS[ethnicity] : "—"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-cream-ivory/40 mb-2.5">
              Goals
            </p>
            <div className="flex flex-wrap gap-2">
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <span
                    key={goal}
                    className="bg-lumen-gold/15 border border-lumen-gold/20 text-lumen-gold px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {GOAL_LABELS[goal]}
                  </span>
                ))
              ) : (
                <span className="text-base text-cream-ivory/60">—</span>
              )}
            </div>
          </div>
        </motion.div>

        {hasPlan ? (
          <motion.div variants={itemVariants} className={`${cardClass} lg:col-span-8`}>
            <p className={`${eyebrowClass} mb-6`}>Quick Actions</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Link
                href="/dashboard/plan"
                className="focus-gold flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-pure-black/20 hover:border-lumen-gold/40 hover:bg-lumen-gold/5 transition-colors duration-300 p-4"
              >
                <CalendarDays className="w-5 h-5 text-lumen-gold flex-shrink-0" />
                <span className="text-sm font-medium text-cream-ivory">
                  View my plan &amp; calendar
                </span>
              </Link>
              <Link
                href="/dashboard/upload"
                className="focus-gold flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-pure-black/20 hover:border-lumen-gold/40 hover:bg-lumen-gold/5 transition-colors duration-300 p-4"
              >
                <Upload className="w-5 h-5 text-lumen-gold flex-shrink-0" />
                <span className="text-sm font-medium text-cream-ivory">
                  Upload a new photo
                </span>
              </Link>
              <Link
                href="/dashboard/coach"
                className="focus-gold flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-pure-black/20 hover:border-lumen-gold/40 hover:bg-lumen-gold/5 transition-colors duration-300 p-4"
              >
                <MessageCircle className="w-5 h-5 text-lumen-gold flex-shrink-0" />
                <span className="text-sm font-medium text-cream-ivory">
                  Ask your AI coach
                </span>
              </Link>
            </div>
          </motion.div>
        ) : hasAnalysis ? (
          <motion.div variants={itemVariants} className={`${cardClass} lg:col-span-7`}>
            <div className="w-16 h-16 rounded-2xl bg-lumen-gold/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-lumen-gold" />
            </div>
            <h2 className="font-manrope font-bold text-2xl text-cream-ivory mt-6">
              Your Analysis Is Ready
            </h2>
            <p className="font-inter text-base text-cream-ivory/70 mt-2">
              Turn it into a structured 90-day plan with daily habits.
            </p>
            <div className="mt-6 w-full">
              <GeneratePlanButton />
            </div>
            <div className="flex items-center gap-4 mt-4">
              {latestPhotoId && (
                <Link
                  href={`/dashboard/upload/${latestPhotoId}`}
                  className="focus-gold text-sm text-cream-ivory/50 hover:text-cream-ivory underline underline-offset-4"
                >
                  View my analysis
                </Link>
              )}
              <Link
                href="/dashboard/upload"
                className="focus-gold text-sm text-cream-ivory/50 hover:text-cream-ivory underline underline-offset-4"
              >
                Upload a new photo
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className={`${cardClass} lg:col-span-7`}>
            <div className="w-16 h-16 rounded-2xl bg-lumen-gold/10 flex items-center justify-center">
              <Camera className="w-8 h-8 text-lumen-gold" />
            </div>
            <h2 className="font-manrope font-bold text-2xl text-cream-ivory mt-6">
              Upload Your First Selfie
            </h2>
            <p className="font-inter text-base text-cream-ivory/70 mt-2">
              We&apos;ll analyze your features and build your personalized 90-day plan.
            </p>
            <Link
              href="/dashboard/upload"
              className="focus-gold mt-6 w-full h-14 rounded-full bg-lumen-gold text-pure-black font-bold flex items-center justify-center hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] active:scale-95 transition-all duration-300"
            >
              Upload Photo
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

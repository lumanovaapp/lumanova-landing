"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Camera,
  Sparkles,
  FileText,
  CheckSquare,
  MessageCircle,
  TrendingUp,
  LucideIcon,
} from "lucide-react";
import { Ethnicity, Goal } from "@/types/database";
import GeneratePlanButton from "@/components/dashboard/plan/GeneratePlanButton";

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

const COMING_SOON_FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: Sparkles, label: "AI face analysis" },
  { icon: FileText, label: "Personalized 90-day plan" },
  { icon: CheckSquare, label: "Daily habits tracker" },
  { icon: MessageCircle, label: "AI coach chat" },
  { icon: TrendingUp, label: "Progress tracking" },
];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
};

const cardClass = "rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8";

interface DashboardViewProps {
  fullName: string;
  age: number | null;
  ethnicity: Ethnicity | null;
  goals: Goal[];
  hasAnalysis: boolean;
  hasPlan: boolean;
  latestPhotoId: string | null;
}

export default function DashboardView({
  fullName,
  age,
  ethnicity,
  goals,
  hasAnalysis,
  hasPlan,
  latestPhotoId,
}: DashboardViewProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
    >
      <motion.div
        variants={itemVariants}
        className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-lumen-gold/20 bg-gradient-to-br from-lumen-gold/10 to-transparent p-8"
      >
        <h1 className="font-manrope font-bold text-3xl sm:text-4xl text-cream-ivory leading-tight">
          Welcome, {fullName}
        </h1>
        <p className="font-inter text-base text-cream-ivory/70 mt-2">
          Day 1 of your 90-day glow-up 🔥
        </p>
        <div className="w-full h-2 bg-white/10 rounded-full mt-6 xl:max-w-md">
          <div className="w-[1%] h-full bg-lumen-gold rounded-full" />
        </div>
        <p className="font-inter text-sm text-cream-ivory/60 mt-2">Day 1 / 90</p>
      </motion.div>

      <motion.div variants={itemVariants} className={cardClass}>
        <p className="text-xs uppercase tracking-widest text-lumen-gold font-medium mb-4">
          Your Profile
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center min-h-[44px]">
            <span className="text-sm text-cream-ivory/60">Age</span>
            <span className="text-base text-cream-ivory font-medium">
              {age ?? "—"}
            </span>
          </div>
          <div className="flex justify-between items-center min-h-[44px]">
            <span className="text-sm text-cream-ivory/60">Ethnicity</span>
            <span className="text-base text-cream-ivory font-medium">
              {ethnicity ? ETHNICITY_LABELS[ethnicity] : "—"}
            </span>
          </div>
          <div>
            <span className="text-sm text-cream-ivory/60 block mb-2">Goals</span>
            <div className="flex flex-wrap gap-2">
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <span
                    key={goal}
                    className="bg-lumen-gold/20 text-lumen-gold px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {GOAL_LABELS[goal]}
                  </span>
                ))
              ) : (
                <span className="text-base text-cream-ivory/60">—</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {hasPlan ? (
        <motion.div variants={itemVariants} className={cardClass}>
          <div className="w-16 h-16 rounded-2xl bg-lumen-gold/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-lumen-gold" />
          </div>
          <h2 className="font-manrope font-bold text-2xl text-cream-ivory mt-6">
            Your 90-Day Plan
          </h2>
          <p className="font-inter text-base text-cream-ivory/70 mt-2">
            Keep the streak going — check in on today&apos;s habits.
          </p>
          <Link
            href="/dashboard/plan"
            className="mt-6 w-full h-14 rounded-xl bg-lumen-gold text-pure-black font-semibold flex items-center justify-center hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300"
          >
            View my plan
          </Link>
          <Link
            href="/dashboard/upload"
            className="mt-3 text-sm text-cream-ivory/50 hover:text-cream-ivory text-center underline underline-offset-4"
          >
            Upload a new photo
          </Link>
        </motion.div>
      ) : hasAnalysis ? (
        <motion.div variants={itemVariants} className={cardClass}>
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
          <div className="flex items-center gap-4 mt-3">
            {latestPhotoId && (
              <Link
                href={`/dashboard/upload/${latestPhotoId}`}
                className="text-sm text-cream-ivory/50 hover:text-cream-ivory underline underline-offset-4"
              >
                View my analysis
              </Link>
            )}
            <Link
              href="/dashboard/upload"
              className="text-sm text-cream-ivory/50 hover:text-cream-ivory underline underline-offset-4"
            >
              Upload a new photo
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className={cardClass}>
          <div className="w-16 h-16 rounded-2xl bg-lumen-gold/10 flex items-center justify-center">
            <Camera className="w-12 h-12 text-lumen-gold" />
          </div>
          <h2 className="font-manrope font-bold text-2xl text-cream-ivory mt-6">
            Upload Your First Selfie
          </h2>
          <p className="font-inter text-base text-cream-ivory/70 mt-2">
            We&apos;ll analyze your features and build your personalized 90-day plan.
          </p>
          <Link
            href="/dashboard/upload"
            className="mt-6 w-full h-14 rounded-xl bg-lumen-gold text-pure-black font-semibold flex items-center justify-center hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300"
          >
            Upload Photo
          </Link>
        </motion.div>
      )}

      <motion.div
        variants={itemVariants}
        className={`${cardClass} sm:col-span-2 xl:col-span-1`}
      >
        <p className="text-xs uppercase tracking-widest text-lumen-gold font-medium mb-6">
          Coming Soon
        </p>
        <div className="space-y-4">
          {COMING_SOON_FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-4 min-h-[44px]">
              <div className="w-10 h-10 rounded-full bg-lumen-gold/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-lumen-gold" />
              </div>
              <span className="text-cream-ivory/60 text-base font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

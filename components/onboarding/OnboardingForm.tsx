"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Ethnicity, Goal } from "@/types/database";
import Toggle from "@/components/dashboard/settings/Toggle";

const DEFAULT_REMINDER_TIME = "20:00";

const ETHNICITY_OPTIONS: { value: Ethnicity; label: string }[] = [
  { value: "south_asian", label: "South Asian" },
  { value: "east_asian", label: "East Asian" },
  { value: "latino", label: "Latino" },
  { value: "african", label: "African" },
  { value: "middle_eastern", label: "Middle Eastern" },
  { value: "southeast_asian", label: "Southeast Asian" },
  { value: "mixed", label: "Mixed" },
];

const MIN_GOALS = 2;
const MAX_GOALS = 4;

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: "skincare", label: "Skincare" },
  { value: "grooming", label: "Grooming" },
  { value: "fitness", label: "Fitness" },
  { value: "confidence", label: "Confidence" },
  { value: "sleep", label: "Sleep" },
  { value: "style", label: "Style" },
];

const TOTAL_STEPS = 4;

const inputClass =
  "w-full h-14 rounded-xl bg-white/5 border border-white/10 text-cream-ivory text-base placeholder:text-cream-ivory/40 px-4 text-center focus:outline-none focus:border-lumen-gold transition-colors";

const pillClass = (selected: boolean) =>
  `h-12 px-5 rounded-xl border text-sm font-manrope font-medium transition-colors ${
    selected
      ? "bg-lumen-gold border-lumen-gold text-pure-black"
      : "bg-white/5 border-white/10 text-cream-ivory/70 hover:border-white/30"
  }`;

interface OnboardingFormProps {
  userId: string;
  initialAge: number | null;
  initialEthnicity: Ethnicity | null;
  initialGoals: Goal[];
}

export default function OnboardingForm({
  userId,
  initialAge,
  initialEthnicity,
  initialGoals,
}: OnboardingFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [age, setAge] = useState(initialAge ? String(initialAge) : "");
  const [ethnicity, setEthnicity] = useState<Ethnicity | null>(initialEthnicity);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleGoal(goal: Goal) {
    setGoals((prev) => {
      if (prev.includes(goal)) return prev.filter((g) => g !== goal);
      if (prev.length >= MAX_GOALS) return prev;
      return [...prev, goal];
    });
  }

  function validateStep(forStep: number): string {
    if (forStep === 0) {
      const parsed = Number(age);
      if (!age.trim() || !Number.isInteger(parsed) || parsed < 13 || parsed > 100) {
        return "Enter an age between 13 and 100.";
      }
    }
    if (forStep === 1 && !ethnicity) {
      return "Pick the option closest to you.";
    }
    if (forStep === 2 && (goals.length < MIN_GOALS || goals.length > MAX_GOALS)) {
      return `Choose between ${MIN_GOALS} and ${MAX_GOALS} goals.`;
    }
    return "";
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleFormKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    // A form with only one visible text field submits implicitly on Enter
    // even with no submit button present — steps 1-2 must intercept that.
    if (e.key === "Enter" && step < TOTAL_STEPS - 1) {
      e.preventDefault();
      goNext();
    }
  }

  async function completeSetup(finalReminderEnabled: boolean, finalReminderTime: string) {
    setLoading(true);
    setError("");

    const { error: updateError } = await supabase
      .from("users")
      .update({
        age: Number(age),
        ethnicity,
        goals,
        reminder_enabled: finalReminderEnabled,
        reminder_time: finalReminderTime,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  function handleSkipReminder() {
    completeSetup(false, DEFAULT_REMINDER_TIME);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (step !== TOTAL_STEPS - 1) {
      goNext();
      return;
    }

    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }

    await completeSetup(reminderEnabled, reminderTime);
  }

  return (
    <div className="w-full max-w-[400px] sm:max-w-[500px]">
      <p className="font-inter text-xs font-medium tracking-wide text-cream-ivory/50 text-center mb-3">
        Step {step + 1} of {TOTAL_STEPS}
      </p>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-8">
        <motion.div
          className="h-full rounded-full bg-lumen-gold"
          animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} noValidate>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="age"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <h1 className="font-manrope font-bold text-2xl sm:text-3xl text-cream-ivory text-center leading-tight">
                How old are you?
              </h1>
              <p className="font-inter text-sm text-cream-ivory/70 text-center mt-2 mb-8">
                We tailor your plan to your age.
              </p>
              <input
                type="number"
                inputMode="numeric"
                autoFocus
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={inputClass}
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="ethnicity"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <h1 className="font-manrope font-bold text-2xl sm:text-3xl text-cream-ivory text-center leading-tight">
                What&apos;s your background?
              </h1>
              <p className="font-inter text-sm text-cream-ivory/70 text-center mt-2 mb-8">
                Helps us fine-tune recommendations for you.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {ETHNICITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEthnicity(opt.value)}
                    className={pillClass(ethnicity === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <h1 className="font-manrope font-bold text-2xl sm:text-3xl text-cream-ivory text-center leading-tight">
                What do you want to work on?
              </h1>
              <p className="font-inter text-sm text-cream-ivory/70 text-center mt-2 mb-8">
                Choose {MIN_GOALS}-{MAX_GOALS}.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {GOAL_OPTIONS.map((opt) => {
                  const selected = goals.includes(opt.value);
                  const disabled = !selected && goals.length >= MAX_GOALS;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleGoal(opt.value)}
                      className={`${pillClass(selected)} ${
                        disabled ? "opacity-30 cursor-not-allowed" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="reminder"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-lumen-gold/10 flex items-center justify-center mb-6">
                <Bell className="w-7 h-7 text-lumen-gold" />
              </div>
              <h1 className="font-manrope font-bold text-2xl sm:text-3xl text-cream-ivory text-center leading-tight">
                Want a daily reminder to keep your streak?
              </h1>
              <p className="font-inter text-sm text-cream-ivory/70 text-center mt-2 mb-8">
                We&apos;ll nudge you once a day. You can change this anytime in Settings.
              </p>

              <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-cream-ivory">
                    Daily reminder
                  </span>
                  <Toggle
                    checked={reminderEnabled}
                    onChange={setReminderEnabled}
                    label="Daily reminder"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={`text-sm ${
                      reminderEnabled ? "text-cream-ivory" : "text-cream-ivory/40"
                    }`}
                  >
                    Reminder time
                  </span>
                  <input
                    type="time"
                    value={reminderTime}
                    disabled={!reminderEnabled}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="h-11 rounded-xl bg-white/5 border border-white/10 text-cream-ivory text-sm px-3 focus:outline-none focus:border-lumen-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSkipReminder}
                disabled={loading}
                className="mt-5 text-sm text-cream-ivory/50 hover:text-cream-ivory/80 transition-colors disabled:opacity-60"
              >
                Skip — I&apos;ll turn this on later
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 mt-10">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="h-14 px-6 rounded-2xl border border-white/15 text-cream-ivory/70 font-manrope font-medium text-base hover:bg-white/5 hover:text-cream-ivory transition-colors"
            >
              Back
            </button>
          )}

          {step < TOTAL_STEPS - 1 ? (
            <motion.button
              type="button"
              onClick={goNext}
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-14 rounded-2xl bg-lumen-gold text-pure-black font-manrope font-bold text-base hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300"
            >
              Continue
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-14 rounded-2xl bg-lumen-gold text-pure-black font-manrope font-bold text-base hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Complete Setup"}
            </motion.button>
          )}
        </div>
      </form>
    </div>
  );
}

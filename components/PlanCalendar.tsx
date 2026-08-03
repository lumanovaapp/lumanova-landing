"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Star, Check, X, Loader2, Shield, Lock } from "lucide-react";
import { Plan, PhotoMilestone, MilestonePhotoSummary } from "@/lib/types";
import { ACCENT_THEME } from "@/lib/accent";
import MilestoneUpload from "@/components/dashboard/plan/MilestoneUpload";

interface PlanCalendarProps {
  plan: Plan;
  createdAt: string;
  checkinsByDate: Record<string, Record<string, boolean>>;
  milestonePhotos: Partial<Record<PhotoMilestone, MilestonePhotoSummary>>;
  frozenDays: number[];
  baselinePhotoUrl: string | null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const MILESTONE_DAYS: Record<number, PhotoMilestone> = {
  30: "day_30",
  60: "day_60",
  90: "day_90",
};

const MILESTONE_LABELS: Record<PhotoMilestone, string> = {
  baseline: "Baseline",
  day_30: "Day 30 Check-In",
  day_60: "Day 60 Check-In",
  day_90: "Day 90 Check-In",
};

function toDateOnlyUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * MS_PER_DAY);
}

function dateToStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function PlanCalendar({
  plan,
  createdAt,
  checkinsByDate,
  milestonePhotos,
  frozenDays,
  baselinePhotoUrl,
}: PlanCalendarProps) {
  const router = useRouter();
  const reduceMotion = !!useReducedMotion();
  const frozenDaySet = new Set(frozenDays);

  const [localCheckins, setLocalCheckins] =
    useState<Record<string, Record<string, boolean>>>(checkinsByDate);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [errorHabitId, setErrorHabitId] = useState<string | null>(null);

  // BUG FIX: resync when fresh server data arrives via a re-render (e.g. a
  // router.refresh() from the milestone flow) instead of trusting stale local
  // state left over from before that refresh.
  useEffect(() => {
    setLocalCheckins(checkinsByDate);
  }, [checkinsByDate]);

  const planStart = toDateOnlyUTC(new Date(createdAt));
  const today = toDateOnlyUTC(new Date());
  const todayStr = dateToStr(today);
  const realDayNumber =
    Math.floor((today.getTime() - planStart.getTime()) / MS_PER_DAY) + 1;

  function dateForDay(day: number): Date {
    return addDays(planStart, day - 1);
  }

  function phaseForDay(day: number): 1 | 2 | 3 {
    return Math.min(3, Math.ceil(day / 30)) as 1 | 2 | 3;
  }

  function activeHabitsForDay(day: number) {
    const phase = phaseForDay(day);
    return plan.daily_habits.filter((h) => h.phase_start <= phase);
  }

  function dayVisualState(
    day: number
  ): "done" | "frozen" | "missed" | "neutral" | "future" {
    const dateStr = dateToStr(dateForDay(day));
    const activeHabits = activeHabitsForDay(day);
    const doneMap = localCheckins[dateStr] ?? {};
    const allDone =
      activeHabits.length > 0 && activeHabits.every((h) => doneMap[h.id]);
    if (dateStr > todayStr) return "future";
    if (allDone) return "done";
    if (dateStr < todayStr) return frozenDaySet.has(day) ? "frozen" : "missed";
    return "neutral";
  }

  async function toggleHabit(day: number, habitId: string) {
    const dateStr = dateToStr(dateForDay(day));
    if (dateStr !== todayStr) return;

    const current = !!localCheckins[dateStr]?.[habitId];
    const next = !current;

    setLocalCheckins((prev) => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] ?? {}), [habitId]: next },
    }));
    setErrorHabitId(null);

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit_id: habitId, date: dateStr, done: next }),
      });
      if (!response.ok) throw new Error("Failed to save check-in");
    } catch {
      setLocalCheckins((prev) => ({
        ...prev,
        [dateStr]: { ...(prev[dateStr] ?? {}), [habitId]: current },
      }));
      setErrorHabitId(habitId);
      window.setTimeout(() => {
        setErrorHabitId((id) => (id === habitId ? null : id));
      }, 3000);
    }
  }

  const selectedDateStr =
    selectedDay !== null ? dateToStr(dateForDay(selectedDay)) : null;
  const isSelectedToday = selectedDateStr === todayStr;
  const isSelectedFuture = !!selectedDateStr && selectedDateStr > todayStr;
  const selectedHabits = selectedDay !== null ? activeHabitsForDay(selectedDay) : [];
  const selectedMilestoneType =
    selectedDay !== null ? MILESTONE_DAYS[selectedDay] : undefined;
  const selectedMilestoneReached =
    selectedDay !== null && realDayNumber >= selectedDay;
  const selectedIsFrozen = selectedDay !== null && frozenDaySet.has(selectedDay);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-manrope font-bold text-xl text-cream-ivory">
          Your 90 Days
        </h2>
        <div className="flex items-center gap-3 text-[11px] text-cream-ivory/50">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-aurora-mist inline-block" />
            Done
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-warm-coral inline-block" />
            Missed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-deep-teal border border-aurora-mist/50 inline-block" />
            Frozen
          </span>
        </div>
      </div>

      {plan.phases.map((phase) => {
        const startDay = (phase.number - 1) * 30 + 1;
        const days = Array.from({ length: 30 }, (_, i) => startDay + i);

        return (
          <div key={phase.number} className="mb-6">
            <p className="text-xs uppercase tracking-widest text-cream-ivory/50 font-medium mb-2">
              Phase {phase.number} · {phase.title}
            </p>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 p-1 overflow-visible">
              {days.map((day) => {
                const visualState = dayVisualState(day);
                const dateStr = dateToStr(dateForDay(day));
                const isToday = dateStr === todayStr;
                const isMilestoneMarker =
                  day === 1 || day === 30 || day === 60 || day === 90;
                const milestoneType = MILESTONE_DAYS[day];
                const milestoneReached =
                  !!milestoneType && realDayNumber >= day;
                const milestoneNeedsAction =
                  milestoneReached && !milestonePhotos[milestoneType!]?.comparison;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    title={milestoneNeedsAction ? "Tap to check in" : undefined}
                    aria-label={
                      milestoneNeedsAction
                        ? `Day ${day} milestone — tap to check in`
                        : `Day ${day}`
                    }
                    className={`relative aspect-square overflow-visible rounded-lg flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer ${
                      visualState === "done"
                        ? `${ACCENT_THEME.maintain.bgSolid} ${ACCENT_THEME.maintain.solidText}`
                        : visualState === "frozen"
                        ? "bg-deep-teal/60 text-aurora-mist border border-aurora-mist/40"
                        : visualState === "missed"
                        ? `${ACCENT_THEME.focus.bgSoft} ${ACCENT_THEME.focus.text} border ${ACCENT_THEME.focus.border}`
                        : visualState === "future"
                        ? "bg-white/5 text-cream-ivory/30"
                        : "bg-white/10 text-cream-ivory"
                    } ${
                      isToday
                        ? "ring-2 ring-lumen-gold ring-offset-2 ring-offset-pure-black"
                        : ""
                    }`}
                  >
                    {day}
                    {visualState === "frozen" && (
                      <Shield className="absolute -top-1 -right-1 w-3 h-3 text-aurora-mist fill-aurora-mist/30" />
                    )}
                    {isMilestoneMarker && visualState !== "frozen" && (
                      <Star className="absolute -top-1 -right-1 w-3 h-3 text-lumen-gold fill-lumen-gold" />
                    )}
                    {milestoneNeedsAction && (
                      <motion.span
                        className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-lumen-gold"
                        animate={
                          reduceMotion
                            ? {}
                            : { scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }
                        }
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <AnimatePresence>
        {selectedDay !== null && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.2 }}
              className="fixed inset-0 z-40 bg-pure-black/70"
              onClick={() => setSelectedDay(null)}
            />
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label={`Day ${selectedDay}`}
              initial={{ y: reduceMotion ? 0 : "100%" }}
              animate={{ y: 0 }}
              exit={{ y: reduceMotion ? 0 : "100%" }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { type: "spring", damping: 30, stiffness: 300 }
              }
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-pure-black p-6 sm:p-8 sm:max-w-lg sm:mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-manrope font-bold text-xl text-cream-ivory">
                    Day {selectedDay}
                  </p>
                  <p className="text-xs text-cream-ivory/50">{selectedDateStr}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  aria-label="Close"
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-cream-ivory/70 hover:bg-white/5 hover:text-cream-ivory transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedIsFrozen && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-aurora-mist/30 bg-aurora-mist/10 px-3 py-2">
                  <Shield className="w-4 h-4 text-aurora-mist flex-shrink-0" />
                  <p className="text-xs text-aurora-mist">
                    A streak freeze covered this day — it doesn&apos;t break your streak.
                  </p>
                </div>
              )}

              {selectedMilestoneType && selectedMilestoneReached && (
                <div className="mb-6">
                  <MilestoneSection
                    milestoneType={selectedMilestoneType}
                    photo={milestonePhotos[selectedMilestoneType]}
                    baselinePhotoUrl={baselinePhotoUrl}
                    onUploaded={() => router.refresh()}
                  />
                </div>
              )}

              {selectedMilestoneType && !selectedMilestoneReached && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <Lock className="w-4 h-4 text-cream-ivory/40 flex-shrink-0" />
                  <p className="text-xs text-cream-ivory/50">
                    {MILESTONE_LABELS[selectedMilestoneType]} unlocks on day{" "}
                    {selectedDay}.
                  </p>
                </div>
              )}

              <p className="text-xs uppercase tracking-widest text-cream-ivory/50 font-medium mb-3">
                {isSelectedToday
                  ? "Today's Habits"
                  : isSelectedFuture
                  ? "Upcoming Habits"
                  : "Habits"}
              </p>
              <div className="p-1 overflow-visible">
                {selectedHabits.map((habit) => {
                  const done = !!localCheckins[selectedDateStr ?? ""]?.[habit.id];
                  const interactive = isSelectedToday;
                  const theme = ACCENT_THEME.maintain;
                  return (
                    <div key={habit.id} className="mb-2 last:mb-0">
                      <button
                        type="button"
                        disabled={!interactive}
                        onClick={() =>
                          selectedDay !== null && toggleHabit(selectedDay, habit.id)
                        }
                        className={`w-full flex items-center gap-3 overflow-visible rounded-xl border p-3 text-left transition-all duration-300 ${
                          done
                            ? `${theme.border} ${theme.bgSoft} ${theme.ring}`
                            : "border-white/10 bg-white/5"
                        } ${
                          interactive ? "cursor-pointer" : "opacity-70 cursor-default"
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            done
                              ? `${theme.bgSolid} border-transparent`
                              : "border-white/20"
                          }`}
                        >
                          {done && (
                            <Check className={`w-3.5 h-3.5 ${theme.solidText}`} />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              done
                                ? "text-cream-ivory/60 line-through"
                                : "text-cream-ivory"
                            }`}
                          >
                            {habit.label}
                          </p>
                        </div>
                      </button>
                      {errorHabitId === habit.id && (
                        <p className="mt-1.5 px-1 text-xs text-warm-coral">
                          Couldn&apos;t save that — reverted. Try again.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MilestoneSectionProps {
  milestoneType: PhotoMilestone;
  photo: MilestonePhotoSummary | undefined;
  baselinePhotoUrl: string | null;
  onUploaded: () => void;
}

function MilestoneSection({
  milestoneType,
  photo,
  baselinePhotoUrl,
  onUploaded,
}: MilestoneSectionProps) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  async function handleRetry() {
    if (!photo) return;
    setRetrying(true);
    setRetryError("");

    try {
      const response = await fetch("/api/milestone-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId: photo.id }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Comparison failed again.");
      }
      onUploaded();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRetrying(false);
    }
  }

  if (!photo) {
    return (
      <MilestoneUpload
        milestoneType={milestoneType}
        label={`Check in — ${MILESTONE_LABELS[milestoneType]}`}
        onUploaded={onUploaded}
      />
    );
  }

  if (photo.comparison) {
    const c = photo.comparison;
    return (
      <div className="rounded-2xl border border-lumen-gold/30 bg-lumen-gold/5 p-4">
        <p className="text-xs uppercase tracking-widest text-lumen-gold font-medium mb-2">
          {MILESTONE_LABELS[milestoneType]}
        </p>
        {(baselinePhotoUrl || photo.photoUrl) && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                {baselinePhotoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={baselinePhotoUrl}
                    alt="Baseline selfie"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="text-[10px] uppercase tracking-wide text-cream-ivory/40 mt-1 text-center">
                Before
              </p>
            </div>
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                {photo.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.photoUrl}
                    alt="Current progress selfie"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="text-[10px] uppercase tracking-wide text-cream-ivory/40 mt-1 text-center">
                After
              </p>
            </div>
          </div>
        )}
        <p className="font-manrope font-semibold text-sm text-cream-ivory mb-3">
          {c.headline}
        </p>
        {c.improvements.length > 0 && (
          <div className="mb-3">
            <p className="text-[11px] uppercase tracking-wide text-cream-ivory/50 font-medium mb-1.5">
              Improvements
            </p>
            <ul className="space-y-1">
              {c.improvements.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-cream-ivory"
                >
                  <Check className="w-3.5 h-3.5 text-lumen-gold flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {c.keep_working.length > 0 && (
          <div className="mb-3">
            <p className="text-[11px] uppercase tracking-wide text-cream-ivory/50 font-medium mb-1.5">
              Keep Working On
            </p>
            <ul className="space-y-1">
              {c.keep_working.map((item, i) => (
                <li key={i} className="text-xs text-cream-ivory/70">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-xs text-cream-ivory/60 italic">{c.next_focus}</p>
      </div>
    );
  }

  if (photo.status === "failed") {
    return (
      <div className="rounded-2xl border border-warm-coral/30 bg-warm-coral/5 p-4">
        <p className="text-sm text-warm-coral mb-2">
          {retryError || "We couldn't compare your progress photo."}
        </p>
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="h-9 px-4 rounded-lg bg-lumen-gold text-pure-black text-xs font-manrope font-bold flex items-center gap-2 disabled:opacity-60"
        >
          {retrying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {retrying ? "Retrying…" : "Try again"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
      <Loader2 className="w-4 h-4 text-lumen-gold animate-spin" />
      <p className="text-sm text-cream-ivory/70">Analyzing your progress…</p>
    </div>
  );
}

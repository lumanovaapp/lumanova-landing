import { redirect } from "next/navigation";
import { createClient, getUser } from "@/utils/supabase/server";
import { getUserState } from "@/lib/user-state";
import { getOrCreateDailyCoachLine } from "@/lib/daily-coach-line";
import { addDays, dateToStr, phaseForDay, toDateOnlyUTC } from "@/lib/streak";
import DashboardView from "@/components/dashboard/DashboardView";
import type { WeekHeatmapDay } from "@/components/dashboard/WeekHeatmap";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Independent of each other — fetched together instead of one after the
  // other so this page doesn't pay for two sequential round trips.
  const [{ data: profile }, state] = await Promise.all([
    supabase
      .from("users")
      .select("full_name, age, ethnicity, goals, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle(),
    getUserState(supabase, user.id),
  ]);

  // Only send them to the wizard when we POSITIVELY know it isn't done.
  // For an already-authenticated user the row always exists (created by the
  // signup trigger) — a null/unreadable read here is a transient session or
  // Router-Cache artifact, and bouncing to /onboarding on it is exactly the
  // "onboarding flashes before the dashboard" flicker. Treat unknown as
  // "let them in"; a genuine new user always arrives here with the flag
  // already set true (OnboardingForm sets it before pushing to /dashboard).
  if (profile && profile.onboarding_completed === false) {
    redirect("/onboarding");
  }

  const fullName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    "there";

  // Read-only — same queries the plan page already runs, just also surfaced
  // here so the dashboard can show a real streak snapshot and today's habits
  // instead of a static placeholder. No streak/checkin computation happens
  // here; that logic still lives solely in /api/checkin.
  let streak = 0;
  let bestStreak = 0;
  let freezes = 0;
  let planDay = 0;
  const todayChecks: Record<string, boolean> = {};
  let coachLine: string | null = null;
  let weekHeatmap: WeekHeatmapDay[] = [];

  if (state.hasPlan && state.plan && state.planCreatedAt) {
    const today = new Date().toISOString().slice(0, 10);
    const todayDate = toDateOnlyUTC(new Date());
    const planStartDate = toDateOnlyUTC(new Date(state.planCreatedAt));
    const sevenDaysAgoStr = dateToStr(addDays(todayDate, -6));

    const [{ data: streakRow }, { data: checkinRows }, { data: weekCheckinRows }, coachLineResult] =
      await Promise.all([
        supabase
          .from("streaks")
          .select("current_streak, longest_streak, freezes")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("daily_checkins")
          .select("habit_id, date, done")
          .eq("user_id", user.id)
          .eq("date", today),
        // Just the trailing week — enough to color the dashboard's 7-day
        // strip without pulling the whole plan's check-in history.
        supabase
          .from("daily_checkins")
          .select("habit_id, date, done")
          .eq("user_id", user.id)
          .gte("date", sevenDaysAgoStr),
        // Cache hit is a single cheap read; a miss (once per user per day)
        // just overlaps with the two queries above instead of adding latency.
        getOrCreateDailyCoachLine(supabase, user.id),
      ]);
    coachLine = coachLineResult;

    streak = streakRow?.current_streak ?? 0;
    bestStreak = streakRow?.longest_streak ?? 0;
    freezes = streakRow?.freezes ?? 0;

    const start = new Date(state.planCreatedAt);
    const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const now = new Date();
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    planDay = Math.min(90, Math.max(1, Math.floor((nowUTC - startUTC) / 86400000) + 1));

    for (const row of checkinRows ?? []) {
      if (row.done) todayChecks[row.habit_id] = true;
    }

    const weekCheckinMap = new Map<string, Set<string>>();
    for (const row of weekCheckinRows ?? []) {
      if (!row.done) continue;
      if (!weekCheckinMap.has(row.date)) weekCheckinMap.set(row.date, new Set());
      weekCheckinMap.get(row.date)!.add(row.habit_id);
    }

    weekHeatmap = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(todayDate, -(6 - i));
      const dateStr = dateToStr(date);
      const inRange =
        date.getTime() >= planStartDate.getTime() && date.getTime() <= todayDate.getTime();

      let done = false;
      if (inRange) {
        const dayNumber =
          Math.round((date.getTime() - planStartDate.getTime()) / 86400000) + 1;
        const phase = phaseForDay(dayNumber);
        const activeHabitIds = state.plan!.daily_habits
          .filter((h) => h.phase_start <= phase)
          .map((h) => h.id);
        const doneSet = weekCheckinMap.get(dateStr);
        done = activeHabitIds.length > 0 && activeHabitIds.every((id) => doneSet?.has(id));
      }

      return {
        label: WEEKDAY_LABELS[date.getUTCDay()],
        done,
        inRange,
        isToday: dateStr === dateToStr(todayDate),
      };
    });
  }

  return (
    <DashboardView
      fullName={fullName}
      age={profile?.age ?? null}
      ethnicity={profile?.ethnicity ?? null}
      goals={profile?.goals ?? []}
      hasAnalysis={state.hasAnalysis}
      hasPlan={state.hasPlan}
      latestPhotoId={state.latestPhotoId}
      plan={state.plan}
      planDay={planDay}
      streak={streak}
      bestStreak={bestStreak}
      freezes={freezes}
      todayChecks={todayChecks}
      coachLine={coachLine}
      weekHeatmap={weekHeatmap}
    />
  );
}

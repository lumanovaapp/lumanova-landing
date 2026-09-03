import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserState } from "@/lib/user-state";
import { getOrCreateDailyCoachLine } from "@/lib/daily-coach-line";
import DashboardView from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, age, ethnicity, goals, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

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

  const state = await getUserState(supabase, user.id);

  // Read-only — same queries the plan page already runs, just also surfaced
  // here so the dashboard can show a real streak snapshot and today's habits
  // instead of a static placeholder. No streak/checkin computation happens
  // here; that logic still lives solely in /api/checkin.
  let streak = 0;
  let freezes = 0;
  let planDay = 0;
  const todayChecks: Record<string, boolean> = {};
  let coachLine: string | null = null;

  if (state.hasPlan && state.plan && state.planCreatedAt) {
    const today = new Date().toISOString().slice(0, 10);

    const [{ data: streakRow }, { data: checkinRows }, coachLineResult] = await Promise.all([
      supabase
        .from("streaks")
        .select("current_streak, freezes")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("daily_checkins")
        .select("habit_id, date, done")
        .eq("user_id", user.id)
        .eq("date", today),
      // Cache hit is a single cheap read; a miss (once per user per day)
      // just overlaps with the two queries above instead of adding latency.
      getOrCreateDailyCoachLine(supabase, user.id),
    ]);
    coachLine = coachLineResult;

    streak = streakRow?.current_streak ?? 0;
    freezes = streakRow?.freezes ?? 0;

    const start = new Date(state.planCreatedAt);
    const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const now = new Date();
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    planDay = Math.min(90, Math.max(1, Math.floor((nowUTC - startUTC) / 86400000) + 1));

    for (const row of checkinRows ?? []) {
      if (row.done) todayChecks[row.habit_id] = true;
    }
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
      freezes={freezes}
      todayChecks={todayChecks}
      coachLine={coachLine}
    />
  );
}

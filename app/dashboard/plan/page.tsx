import { redirect } from "next/navigation";
import Link from "next/link";
import { Camera, Sparkles, ArrowRight } from "lucide-react";
import { createClient, getUser } from "@/utils/supabase/server";
import { getUserState } from "@/lib/user-state";
import { MilestonePhotoSummary, PhotoMilestone } from "@/lib/types";
import { buildDoneFlags, computeStreakState } from "@/lib/streak";
import { getOrCreateDailyCoachLine } from "@/lib/daily-coach-line";
import GeneratePlanButton from "@/components/dashboard/plan/GeneratePlanButton";
import PlanView from "@/components/PlanView";

const SIGNED_URL_TTL_SECONDS = 3600;

export default async function PlanPage({
  searchParams,
}: {
  // `?generate=1` is set by the analysis page's "Generate my 90-day plan"
  // CTA — it makes the "analysis ready" screen below start generating
  // immediately instead of waiting for a second click. Ignored once a plan
  // exists (PlanView just renders).
  searchParams?: { generate?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/login");
  }

  const state = await getUserState(supabase, user.id);

  if (state.hasPlan && state.plan && state.planCreatedAt) {
    // These five reads are all independent of one another (the baseline
    // fallback pair is the only internal chain), so they used to run as five
    // sequential round trips to Postgres — a straight-line waterfall that
    // was the biggest single contributor to this page's load latency. Fired
    // together instead: one round trip's worth of wall-clock time for all of
    // them. The coach line is kicked off in the same batch — a cache hit
    // resolves instantly either way, and a cache miss (one Anthropic call,
    // once per user per day) overlaps with everything else in flight.
    const [
      { data: checkinRows },
      { data: streakRow },
      { data: milestoneRows },
      { data: explicitBaseline },
      { data: earliestAnalyzed },
      coachLine,
    ] = await Promise.all([
      supabase
        .from("daily_checkins")
        .select("habit_id, date, done")
        .eq("user_id", user.id),
      supabase
        .from("streaks")
        .select("current_streak, longest_streak, freezes")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("photos")
        .select("id, photo_type, status, comparison, storage_path")
        .eq("user_id", user.id)
        .in("photo_type", ["day_30", "day_60", "day_90"])
        .order("created_at", { ascending: true }),
      supabase
        .from("photos")
        .select("storage_path")
        .eq("user_id", user.id)
        .eq("photo_type", "baseline")
        .maybeSingle(),
      // Only used when there's no explicit baseline, but cheap enough to
      // just always fetch alongside everything else rather than adding a
      // second sequential stage for the rare case it's needed.
      supabase
        .from("photos")
        .select("storage_path")
        .eq("user_id", user.id)
        .not("analysis", "is", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      getOrCreateDailyCoachLine(supabase, user.id),
    ]);

    const baselineStoragePath =
      explicitBaseline?.storage_path ?? earliestAnalyzed?.storage_path ?? null;

    const [baselineSigned, ...milestoneSigned] = await Promise.all([
      baselineStoragePath
        ? supabase.storage
            .from("selfies")
            .createSignedUrl(baselineStoragePath, SIGNED_URL_TTL_SECONDS)
        : Promise.resolve({ data: null, error: null }),
      ...(milestoneRows ?? []).map((row) =>
        supabase.storage
          .from("selfies")
          .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS)
      ),
    ]);

    const checkinsByDate: Record<string, Record<string, boolean>> = {};
    for (const row of checkinRows ?? []) {
      if (!checkinsByDate[row.date]) checkinsByDate[row.date] = {};
      checkinsByDate[row.date][row.habit_id] = row.done;
    }

    const milestonePhotos: Partial<Record<PhotoMilestone, MilestonePhotoSummary>> =
      {};
    (milestoneRows ?? []).forEach((row, i) => {
      if (!row.photo_type) return;
      milestonePhotos[row.photo_type] = {
        id: row.id,
        status: row.status,
        comparison: row.comparison,
        photoUrl: milestoneSigned[i]?.data?.signedUrl ?? null,
      };
    });

    const doneFlags = buildDoneFlags(
      state.planCreatedAt,
      state.plan.daily_habits,
      checkinRows ?? []
    );
    const frozenDays = computeStreakState(doneFlags).frozenDayIndices.map(
      (i) => i + 1
    );

    return (
      <PlanView
        plan={state.plan}
        createdAt={state.planCreatedAt}
        currentStreak={streakRow?.current_streak ?? 0}
        bestStreak={streakRow?.longest_streak ?? 0}
        freezes={streakRow?.freezes ?? 0}
        checkinsByDate={checkinsByDate}
        milestonePhotos={milestonePhotos}
        frozenDays={frozenDays}
        baselinePhotoUrl={baselineSigned?.data?.signedUrl ?? null}
        coachLine={coachLine}
        analysis={state.latestAnalysis}
      />
    );
  }

  if (state.hasAnalysis) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center py-16 sm:py-20 text-center">
        <div className="w-full rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] px-6 sm:px-10 py-10 sm:py-12 flex flex-col items-center">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-5">
            Your 90-Day Plan
          </p>
          <div className="w-16 h-16 rounded-2xl bg-lumen-gold/10 border border-lumen-gold/20 flex items-center justify-center mb-6">
            <Sparkles className="w-7 h-7 text-lumen-gold" />
          </div>
          <h1 className="font-manrope leading-tight text-2xl sm:text-3xl">
            <span className="font-light text-cream-ivory/80">Your analysis is</span>{" "}
            <span className="font-extrabold text-lumen-gold">ready</span>
          </h1>
          <p className="font-inter text-base text-cream-ivory/55 mt-3 mb-8 max-w-sm leading-relaxed">
            We&apos;ll turn your saved analysis into a phased plan with daily
            habits built for streaks.
          </p>
          <GeneratePlanButton autoStart={searchParams?.generate === "1"} />
          {state.latestPhotoId && (
            <Link
              href={`/dashboard/upload/${state.latestPhotoId}`}
              className="mt-5 text-sm text-cream-ivory/60 hover:text-cream-ivory underline underline-offset-4 focus-gold"
            >
              View my analysis
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center py-16 sm:py-20 text-center">
      <div className="w-full rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] px-6 sm:px-10 py-10 sm:py-12 flex flex-col items-center">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-5">
          Your 90-Day Plan
        </p>
        <div className="w-16 h-16 rounded-2xl bg-lumen-gold/10 border border-lumen-gold/20 flex items-center justify-center mb-6">
          <Camera className="w-7 h-7 text-lumen-gold" />
        </div>
        <h1 className="font-manrope leading-tight text-2xl sm:text-3xl">
          <span className="font-light text-cream-ivory/80">Analyze a photo</span>{" "}
          <span className="font-extrabold text-lumen-gold">first</span>
        </h1>
        <p className="font-inter text-base text-cream-ivory/55 mt-3 mb-8 max-w-sm leading-relaxed">
          Your 90-day plan is built from your grooming analysis. Upload a
          selfie to get started.
        </p>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center gap-2 bg-lumen-gold text-pure-black font-bold rounded-full px-8 py-4 hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] active:scale-95 transition-all duration-300 focus-gold"
        >
          Upload a selfie
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

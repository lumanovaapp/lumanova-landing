import { redirect } from "next/navigation";
import Link from "next/link";
import { Camera, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getUserState } from "@/lib/user-state";
import { MilestonePhotoSummary, PhotoMilestone } from "@/lib/types";
import { buildDoneFlags, computeStreakState } from "@/lib/streak";
import GeneratePlanButton from "@/components/dashboard/plan/GeneratePlanButton";
import PlanView from "@/components/PlanView";

const SIGNED_URL_TTL_SECONDS = 3600;

export default async function PlanPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const state = await getUserState(supabase, user.id);

  if (state.hasPlan && state.plan && state.planCreatedAt) {
    const { data: checkinRows } = await supabase
      .from("daily_checkins")
      .select("habit_id, date, done")
      .eq("user_id", user.id);

    const { data: streakRow } = await supabase
      .from("streaks")
      .select("current_streak, longest_streak, freezes")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: milestoneRows } = await supabase
      .from("photos")
      .select("id, photo_type, status, comparison, storage_path")
      .eq("user_id", user.id)
      .in("photo_type", ["day_30", "day_60", "day_90"])
      .order("created_at", { ascending: true });

    const { data: explicitBaseline } = await supabase
      .from("photos")
      .select("storage_path")
      .eq("user_id", user.id)
      .eq("photo_type", "baseline")
      .maybeSingle();

    let baselineStoragePath = explicitBaseline?.storage_path ?? null;
    if (!baselineStoragePath) {
      const { data: earliestAnalyzed } = await supabase
        .from("photos")
        .select("storage_path")
        .eq("user_id", user.id)
        .not("analysis", "is", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      baselineStoragePath = earliestAnalyzed?.storage_path ?? null;
    }

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
      />
    );
  }

  if (state.hasAnalysis) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-lumen-gold/10 flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-lumen-gold" />
        </div>
        <h1 className="font-manrope font-bold text-2xl text-cream-ivory">
          Your analysis is ready
        </h1>
        <p className="font-inter text-base text-cream-ivory/70 mt-2 mb-8">
          We&apos;ll turn your saved analysis into a phased plan with daily
          habits built for streaks.
        </p>
        <GeneratePlanButton />
        {state.latestPhotoId && (
          <Link
            href={`/dashboard/upload/${state.latestPhotoId}`}
            className="mt-4 text-sm text-cream-ivory/60 hover:text-cream-ivory underline underline-offset-4"
          >
            View my analysis
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-lumen-gold/10 flex items-center justify-center mb-6">
        <Camera className="w-8 h-8 text-lumen-gold" />
      </div>
      <h1 className="font-manrope font-bold text-2xl text-cream-ivory">
        Analyze a photo first
      </h1>
      <p className="font-inter text-base text-cream-ivory/70 mt-2 mb-8">
        Your 90-day plan is built from your grooming analysis. Upload a
        selfie to get started.
      </p>
      <Link
        href="/dashboard/upload"
        className="w-full h-14 rounded-xl bg-lumen-gold text-pure-black font-manrope font-bold flex items-center justify-center hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300"
      >
        Upload a selfie
      </Link>
    </div>
  );
}

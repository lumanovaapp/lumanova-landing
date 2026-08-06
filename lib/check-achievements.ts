import { createClient } from "@/utils/supabase/server";
import { BADGES } from "@/lib/badges";

interface AchievementSignals {
  bestStreak: number;
  totalHabitCheckins: number;
  // 'baseline' is derived (any completed photo with an analysis), day_30 /
  // day_60 / day_90 are the explicit photo_type values set on milestone
  // uploads — see lib/upload-photo.ts and app/api/milestone-compare/route.ts.
  unlockedPhotoTypes: Set<string>;
}

async function loadSignals(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<AchievementSignals> {
  const [
    { data: streakRow, error: streakError },
    { count: checkinCount },
    { data: photoRows },
  ] = await Promise.all([
    // Real columns on `streaks` are current_streak / longest_streak (see
    // types/database.ts and the upsert in app/api/checkin/route.ts, which
    // already writes both under these exact names). BUG: this used to only
    // select longest_streak and feed that alone into every streak badge
    // condition — if longest_streak ever lagged behind current_streak for
    // any reason, a real current-streak milestone would never unlock. Now
    // reads both and unlocks off whichever is higher.
    supabase
      .from("streaks")
      .select("current_streak, longest_streak")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("daily_checkins")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("done", true),
    supabase
      .from("photos")
      .select("photo_type, status, analysis")
      .eq("user_id", userId),
  ]);

  if (streakError) {
    console.error("ACHIEVEMENTS ERROR: streaks query failed:", streakError);
  }

  const unlockedPhotoTypes = new Set<string>();
  let hasBaselineAnalysis = false;
  for (const row of photoRows ?? []) {
    if (row.status !== "complete") continue;
    if (row.analysis) hasBaselineAnalysis = true;
    if (row.photo_type) unlockedPhotoTypes.add(row.photo_type);
  }
  if (hasBaselineAnalysis) unlockedPhotoTypes.add("baseline");

  // Coerce explicitly — Postgres integer columns come back as `number` via
  // postgrest-js, but a null/undefined row (no streaks row yet) must not
  // silently become NaN in a `>=` comparison.
  const currentStreak = Number(streakRow?.current_streak ?? 0);
  const longestStreak = Number(streakRow?.longest_streak ?? 0);

  console.log("STREAK CHECK:", {
    userId,
    currentStreak,
    best: longestStreak,
  });

  return {
    bestStreak: Math.max(currentStreak, longestStreak),
    totalHabitCheckins: checkinCount ?? 0,
    unlockedPhotoTypes,
  };
}

// "streak_90" ("finished the plan") is keyed off bestStreak rather than a
// separate plan-completion counter — the app doesn't track elapsed plan days
// anywhere else (plans.current_day is unused), and a 90-entry best streak
// already accounts for freeze-covered gaps the same way the rest of the
// streak system does, so it's the closest real signal to "finished."
const CONDITIONS: Record<string, (s: AchievementSignals) => boolean> = {
  streak_7: (s) => s.bestStreak >= 7,
  streak_30: (s) => s.bestStreak >= 30,
  streak_60: (s) => s.bestStreak >= 60,
  streak_90: (s) => s.bestStreak >= 90,
  habits_10: (s) => s.totalHabitCheckins >= 10,
  habits_50: (s) => s.totalHabitCheckins >= 50,
  habits_100: (s) => s.totalHabitCheckins >= 100,
  habits_250: (s) => s.totalHabitCheckins >= 250,
  photo_baseline: (s) => s.unlockedPhotoTypes.has("baseline"),
  photo_day30: (s) => s.unlockedPhotoTypes.has("day_30"),
  photo_day60: (s) => s.unlockedPhotoTypes.has("day_60"),
  photo_day90: (s) => s.unlockedPhotoTypes.has("day_90"),
};

// Evaluates every badge condition for a user and persists any newly-met ones.
// Safe to call repeatedly (e.g. from multiple routes in the same request
// lifecycle, or a user replaying the same action) — already-unlocked badges
// are filtered out before insert, and the (user_id, badge_key) unique
// constraint plus `ignoreDuplicates` make the insert itself idempotent
// against a race with a concurrent call.
export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
  const supabase = createClient();

  const [signals, { data: existingRows }] = await Promise.all([
    loadSignals(supabase, userId),
    supabase.from("achievements").select("badge_key").eq("user_id", userId),
  ]);

  const alreadyUnlocked = new Set((existingRows ?? []).map((row) => row.badge_key));

  const toUnlock = BADGES.filter(
    (badge) => !alreadyUnlocked.has(badge.key) && CONDITIONS[badge.key]?.(signals)
  );

  if (toUnlock.length === 0) return [];

  const { data: inserted, error } = await supabase
    .from("achievements")
    .upsert(
      toUnlock.map((badge) => ({ user_id: userId, badge_key: badge.key })),
      { onConflict: "user_id,badge_key", ignoreDuplicates: true }
    )
    .select("badge_key");

  if (error) {
    // An achievements hiccup should never break the caller's real action
    // (a check-in, an analysis, a milestone upload) — log and move on.
    console.error("ACHIEVEMENTS ERROR:", error);
    return [];
  }

  return (inserted ?? []).map((row) => row.badge_key);
}

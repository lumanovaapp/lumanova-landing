import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { BADGES } from "@/lib/badges";
import AchievementsGrid from "@/components/dashboard/achievements/AchievementsGrid";

export default async function AchievementsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows } = await supabase
    .from("achievements")
    .select("badge_key, unlocked_at")
    .eq("user_id", user.id);

  const unlockedMap: Record<string, string> = {};
  for (const row of rows ?? []) {
    unlockedMap[row.badge_key] = row.unlocked_at;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <p className="text-xs uppercase tracking-widest text-lumen-gold font-medium mb-3">
        Achievements
      </p>
      <h1 className="font-manrope font-bold text-3xl sm:text-4xl text-cream-ivory leading-tight">
        Your badges
      </h1>
      <p className="font-inter text-base text-cream-ivory/70 mt-2">
        Unlocked automatically as you build your streak, stay consistent, and hit
        photo milestones.
      </p>

      <AchievementsGrid
        badges={BADGES}
        unlockedMap={unlockedMap}
        unlockedCount={Object.keys(unlockedMap).length}
        totalCount={BADGES.length}
      />
    </div>
  );
}

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
    <div>
      <div className="max-w-2xl">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-4">
          Achievements
        </p>
        <h1 className="font-manrope text-3xl sm:text-4xl leading-[1.1] tracking-[-0.02em]">
          <span className="font-light text-cream-ivory/80">Your</span>{" "}
          <span className="font-extrabold text-lumen-gold">badges.</span>
        </h1>
        <p className="font-inter text-base text-cream-ivory/55 mt-3">
          Unlocked automatically as you build your streak, stay consistent, and hit
          photo milestones.
        </p>
      </div>

      <AchievementsGrid
        badges={BADGES}
        unlockedMap={unlockedMap}
        unlockedCount={Object.keys(unlockedMap).length}
        totalCount={BADGES.length}
      />
    </div>
  );
}

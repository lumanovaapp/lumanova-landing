import type { createClient } from "@/utils/supabase/server";
import { Analysis, Plan } from "@/lib/types";

type SupabaseServerClient = ReturnType<typeof createClient>;

export interface UserState {
  hasAnalysis: boolean;
  latestAnalysis: Analysis | null;
  latestPhotoId: string | null;
  hasPlan: boolean;
  plan: Plan | null;
  planCreatedAt: string | null;
}

export async function getUserState(
  supabase: SupabaseServerClient,
  userId: string
): Promise<UserState> {
  const [{ data: photo }, { data: planRow }] = await Promise.all([
    supabase
      .from("photos")
      .select("id, analysis")
      .eq("user_id", userId)
      .not("analysis", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("plans")
      .select("plan_json, created_at")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    hasAnalysis: !!photo?.analysis,
    latestAnalysis: photo?.analysis ?? null,
    latestPhotoId: photo?.id ?? null,
    hasPlan: !!planRow,
    plan: planRow?.plan_json ?? null,
    planCreatedAt: planRow?.created_at ?? null,
  };
}

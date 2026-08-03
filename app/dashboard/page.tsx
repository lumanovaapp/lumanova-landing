import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserState } from "@/lib/user-state";
import DashboardShell from "@/components/dashboard/DashboardShell";
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
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const fullName =
    profile.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    "there";

  const state = await getUserState(supabase, user.id);

  return (
    <DashboardShell fullName={fullName} email={user.email}>
      <DashboardView
        fullName={fullName}
        age={profile.age}
        ethnicity={profile.ethnicity}
        goals={profile.goals ?? []}
        hasAnalysis={state.hasAnalysis}
        hasPlan={state.hasPlan}
        latestPhotoId={state.latestPhotoId}
      />
    </DashboardShell>
  );
}

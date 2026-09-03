import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_completed, age, ethnicity, goals")
    .eq("id", user.id)
    .maybeSingle();

  // Mirror of the dashboard guard: only bounce to /dashboard when we
  // positively confirm onboarding is done. A transient null read shows the
  // wizard (correct for a real new user); the dashboard's own guard no
  // longer bounces back here on an ambiguous read, so the two can't ping-pong.
  if (profile?.onboarding_completed === true) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-pure-black flex items-center justify-center px-6 py-10 [padding-top:max(2.5rem,env(safe-area-inset-top))] [padding-bottom:max(2.5rem,env(safe-area-inset-bottom))]">
      <OnboardingForm
        userId={user.id}
        initialAge={profile?.age ?? null}
        initialEthnicity={profile?.ethnicity ?? null}
        initialGoals={profile?.goals ?? []}
      />
    </main>
  );
}

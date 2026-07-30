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
    .single();

  if (profile?.onboarding_completed) {
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

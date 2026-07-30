import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

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
    .select("full_name, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const fullName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email;

  return (
    <main className="min-h-screen bg-pure-black flex items-center justify-center px-6 py-10 [padding-top:max(2.5rem,env(safe-area-inset-top))] [padding-bottom:max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md text-center flex flex-col items-center">
        <h1 className="font-manrope font-bold text-3xl sm:text-4xl text-cream-ivory leading-tight">
          Welcome to Lumanova, {fullName}!
        </h1>
        <p className="font-inter text-base text-cream-ivory/70 mt-4">
          You&apos;re user #1 of the glow-up revolution.
        </p>
        <p className="font-inter text-sm text-cream-ivory/50 mt-2">
          Full dashboard coming soon...
        </p>

        <LogoutButton />
      </div>
    </main>
  );
}

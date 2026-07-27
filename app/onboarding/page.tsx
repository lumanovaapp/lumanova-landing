import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-pure-black flex items-center justify-center px-6 py-10 [padding-top:max(2.5rem,env(safe-area-inset-top))] [padding-bottom:max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md text-center flex flex-col items-center">
        <h1 className="font-manrope font-bold text-3xl sm:text-4xl text-cream-ivory leading-tight">
          You&apos;re in.
        </h1>
        <p className="font-inter text-base text-cream-ivory/70 mt-4">
          Onboarding is coming soon — for now, jump into your dashboard.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 h-14 px-8 inline-flex items-center justify-center rounded-2xl bg-lumen-gold text-pure-black font-manrope font-bold text-base hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}

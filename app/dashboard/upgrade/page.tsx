import { redirect } from "next/navigation";
import { getUser } from "@/utils/supabase/server";
import PricingCards from "@/components/billing/PricingCards";

export default async function UpgradePage() {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto text-center py-6 sm:py-10">
      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70">
        Lumanova Pro
      </p>
      <h1 className="mt-3 font-manrope leading-tight text-3xl sm:text-4xl">
        <span className="font-light text-cream-ivory/80">Unlock your full </span>
        <span className="font-extrabold text-lumen-gold">90-day transformation</span>
      </h1>
      <p className="mt-3 max-w-xl mx-auto font-inter text-base text-cream-ivory/55">
        Your personalized plan, AI coach, and progress tracking — everything
        beyond your first analysis.
      </p>

      <div className="mt-10">
        <PricingCards />
      </div>

      <p className="mt-8 text-xs text-cream-ivory/40">
        Cancel anytime. Your Pro access stays active until the end of the
        period you&apos;ve already paid for.
      </p>
    </div>
  );
}

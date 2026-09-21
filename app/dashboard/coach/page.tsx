import { redirect } from "next/navigation";
import { createClient, getUser } from "@/utils/supabase/server";
import { isPro } from "@/lib/subscription";
import CoachChat from "@/components/CoachChat";
import Paywall from "@/components/billing/Paywall";

export default async function CoachPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("plan, current_period_end")
    .eq("id", user.id)
    .maybeSingle();

  if (!isPro(profile)) {
    return (
      <div className="max-w-2xl mx-auto py-10 sm:py-16 text-center">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-3">
          AI Coach
        </p>
        <h1 className="font-manrope leading-tight text-2xl sm:text-3xl">
          <span className="font-light text-cream-ivory/80">Your coach is </span>
          <span className="font-extrabold text-lumen-gold">one upgrade away</span>
        </h1>
        <p className="font-inter text-base text-cream-ivory/55 mt-3">
          Upgrade to Pro to start chatting.
        </p>
        <Paywall
          title="Unlock your AI grooming coach"
          description="Personalized, on-demand advice grounded in your analysis, plan, and streak — upgrade to Pro to start chatting."
        />
      </div>
    );
  }

  const { data: messageRows } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return <CoachChat initialMessages={messageRows ?? []} />;
}

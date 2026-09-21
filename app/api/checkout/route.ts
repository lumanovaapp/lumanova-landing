import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createCheckout, BillingPlan } from "@/lib/lemonsqueezy";
import { appUrl } from "@/lib/app-url";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { plan?: string };
  const plan: BillingPlan | null =
    body.plan === "monthly" || body.plan === "yearly" ? body.plan : null;

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const url = await createCheckout({
      plan,
      userId: user.id,
      email: user.email,
      // Lands back in the app right where the paywall was, and lets the
      // plan page show a brief "activating your subscription" state if the
      // webhook hasn't landed yet by the time the redirect completes.
      redirectUrl: `${appUrl()}/dashboard/plan?upgraded=1`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/utils/supabase/server";
import { isPro } from "@/lib/subscription";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/login");
  }

  // maybeSingle, not single: right after login/refresh the users row can read
  // back empty for a beat (session cookie mid-rotation, or a stale RSC from
  // the Router Cache). `single` turns that into a thrown error; we'd rather
  // fall through with `onboarded` unknown and let TourProvider resolve it
  // against a fresh client read before anything paints.
  const [{ data: profile }, { data: planRow }] = await Promise.all([
    supabase
      .from("users")
      // plan/current_period_end are read here purely to decide whether the
      // sidebar shows the Pro badge — the layout gates nothing. Every actual
      // gate re-reads them in its own server component or route handler.
      .select("full_name, onboarded, plan, current_period_end")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("plans").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);

  const fullName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    "there";

  return (
    <DashboardShell
      fullName={fullName}
      email={user.email}
      userId={user.id}
      onboarded={profile?.onboarded ?? false}
      hasPlan={!!planRow}
      isPro={isPro(profile)}
    >
      {children}
    </DashboardShell>
  );
}

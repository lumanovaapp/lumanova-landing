import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // maybeSingle, not single: right after login/refresh the users row can read
  // back empty for a beat (session cookie mid-rotation, or a stale RSC from
  // the Router Cache). `single` turns that into a thrown error; we'd rather
  // fall through with `onboarded` unknown and let TourProvider resolve it
  // against a fresh client read before anything paints.
  const [{ data: profile }, { data: planRow }] = await Promise.all([
    supabase.from("users").select("full_name, onboarded").eq("id", user.id).maybeSingle(),
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
    >
      {children}
    </DashboardShell>
  );
}

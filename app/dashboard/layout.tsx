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

  const { data: profile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const fullName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    "there";

  return (
    <DashboardShell fullName={fullName} email={user.email}>
      {children}
    </DashboardShell>
  );
}

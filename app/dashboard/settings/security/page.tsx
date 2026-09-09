import { redirect } from "next/navigation";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { createClient, getUser } from "@/utils/supabase/server";
import SettingsBackHeader from "@/components/dashboard/settings/SettingsBackHeader";
import SettingsCard from "@/components/dashboard/settings/SettingsCard";

function formatChangedDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(iso));
}

export default async function SecuritySettingsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("password_changed_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div>
      <SettingsBackHeader title="Security" backHref="/dashboard/settings" />

      <SettingsCard>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-lumen-gold/10 flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-4 h-4 text-lumen-gold" />
          </div>
          <h3 className="font-manrope font-semibold text-cream-ivory">Password</h3>
        </div>
        <p className="text-sm text-cream-ivory/50 ml-12 mb-5">
          {profile?.password_changed_at
            ? `Last changed: ${formatChangedDate(profile.password_changed_at)}`
            : "Keep your account secure with a strong password."}
        </p>
        <Link
          href="/dashboard/settings/security/change-password"
          className="focus-gold ml-12 inline-flex items-center h-11 px-5 rounded-full bg-lumen-gold text-pure-black font-manrope font-bold text-sm hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] transition-all duration-300"
        >
          Change Password
        </Link>
      </SettingsCard>
    </div>
  );
}

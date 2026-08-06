import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import EditNameCard from "@/components/dashboard/settings/EditNameCard";
import ChangePasswordCard from "@/components/dashboard/settings/ChangePasswordCard";
import ChangeEmailCard from "@/components/dashboard/settings/ChangeEmailCard";
import DeleteAccountCard from "@/components/dashboard/settings/DeleteAccountCard";
import LogoutCard from "@/components/dashboard/settings/LogoutCard";
import RemindersCard from "@/components/dashboard/settings/RemindersCard";
import PlanAnalysisCard from "@/components/dashboard/settings/PlanAnalysisCard";
import AboutCard from "@/components/dashboard/settings/AboutCard";
import packageJson from "@/package.json";

const sectionLabelClass =
  "text-xs uppercase tracking-widest text-cream-ivory/40 font-semibold mb-3";

// Each card's entrance is offset by a small stagger so the page cascades in
// on load instead of popping in all at once.
const STAGGER_STEP = 0.06;

export default async function SettingsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, reminder_enabled, reminder_time")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <p className="text-xs uppercase tracking-widest text-lumen-gold font-medium mb-3">
        Settings
      </p>
      <h1 className="font-manrope font-bold text-3xl sm:text-4xl text-cream-ivory leading-tight">
        Account &amp; preferences
      </h1>
      <p className="font-inter text-base text-cream-ivory/70 mt-2">
        Manage your profile, reminders, and account.
      </p>

      {/* Editorial split, matching Plan/Analysis: a wider primary column
          (Account) alongside a narrower running sidebar of the lighter
          sections, so the page uses the full width instead of stacking
          everything in one centered strip. */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
        {/* Account */}
        <section>
          <h2 className={sectionLabelClass}>Account</h2>
          <div className="flex flex-col gap-4">
            <EditNameCard
              userId={user.id}
              initialFullName={profile?.full_name ?? ""}
              delay={0 * STAGGER_STEP}
            />
            <ChangePasswordCard delay={1 * STAGGER_STEP} />
            <ChangeEmailCard currentEmail={user.email ?? ""} delay={2 * STAGGER_STEP} />
            <LogoutCard delay={3 * STAGGER_STEP} />
          </div>

          {/* Danger zone — pulled slightly apart from the rest of Account so
              a destructive action never reads as just another settings row. */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <DeleteAccountCard delay={4 * STAGGER_STEP} />
          </div>
        </section>

        {/* Reminders / Plan & Analysis / About & Legal */}
        <div className="flex flex-col gap-6">
          <section>
            <h2 className={sectionLabelClass}>Reminders</h2>
            <RemindersCard
              userId={user.id}
              initialReminderEnabled={profile?.reminder_enabled ?? true}
              initialReminderTime={profile?.reminder_time ?? "20:00"}
              delay={5 * STAGGER_STEP}
            />
          </section>

          <section>
            <h2 className={sectionLabelClass}>Plan &amp; analysis</h2>
            <PlanAnalysisCard delay={6 * STAGGER_STEP} />
          </section>

          <section className="pb-4">
            <h2 className={sectionLabelClass}>About &amp; legal</h2>
            <AboutCard appVersion={packageJson.version} delay={7 * STAGGER_STEP} />
          </section>
        </div>
      </div>
    </div>
  );
}

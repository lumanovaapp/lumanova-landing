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
  "text-xs font-bold tracking-[0.18em] uppercase text-cream-ivory/40 mb-4";

const cardGridClass = "grid grid-cols-1 md:grid-cols-2 gap-6";

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
    <div>
      <header className="max-w-2xl">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-3">
          Settings
        </p>
        <h1 className="font-manrope text-3xl sm:text-4xl leading-tight">
          <span className="font-light text-cream-ivory/80">Account &amp; </span>
          <span className="font-extrabold text-lumen-gold">preferences</span>
        </h1>
        <p className="font-inter text-base text-cream-ivory/55 mt-3">
          Manage your profile, reminders, and account.
        </p>
      </header>

      {/* Full-width, grouped sections — cards run 2-up within each group
          instead of stacking one-per-row down a narrow center column. */}
      <div className="mt-10 lg:mt-12 flex flex-col gap-14">
        {/* Account */}
        <section>
          <h2 className={sectionLabelClass}>Account</h2>
          <div className={cardGridClass}>
            <EditNameCard
              userId={user.id}
              initialFullName={profile?.full_name ?? ""}
              delay={0 * STAGGER_STEP}
            />
            <ChangeEmailCard currentEmail={user.email ?? ""} delay={1 * STAGGER_STEP} />
            <div className="md:col-span-2">
              <ChangePasswordCard delay={2 * STAGGER_STEP} />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className={sectionLabelClass}>Preferences</h2>
          <div className={cardGridClass}>
            <RemindersCard
              userId={user.id}
              initialReminderEnabled={profile?.reminder_enabled ?? true}
              initialReminderTime={profile?.reminder_time ?? "20:00"}
              delay={3 * STAGGER_STEP}
            />
            <PlanAnalysisCard delay={4 * STAGGER_STEP} />
          </div>
        </section>

        {/* General */}
        <section>
          <h2 className={sectionLabelClass}>General</h2>
          <div className={cardGridClass}>
            <AboutCard appVersion={packageJson.version} delay={5 * STAGGER_STEP} />
            <LogoutCard delay={6 * STAGGER_STEP} />
          </div>
        </section>

        {/* Danger zone — pulled apart from the rest of the page with its own
            divider and de-emphasized width so a destructive action never
            reads as just another settings row. */}
        <section className="pt-10 border-t border-white/[0.06]">
          <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-red-400/50 mb-4">
            Danger zone
          </h2>
          <div className="max-w-xl">
            <DeleteAccountCard email={user.email ?? undefined} delay={7 * STAGGER_STEP} />
          </div>
        </section>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient, getUser } from "@/utils/supabase/server";
import EditNameCard from "@/components/dashboard/settings/EditNameCard";
import ChangeEmailCard from "@/components/dashboard/settings/ChangeEmailCard";
import LogoutCard from "@/components/dashboard/settings/LogoutCard";
import RemindersCard from "@/components/dashboard/settings/RemindersCard";
import PlanAnalysisCard from "@/components/dashboard/settings/PlanAnalysisCard";
import AboutCard from "@/components/dashboard/settings/AboutCard";
import SettingsMenuItem from "@/components/dashboard/settings/SettingsMenuItem";
import packageJson from "@/package.json";

const sectionLabelClass =
  "text-xs font-bold tracking-[0.18em] uppercase text-cream-ivory/40 mb-4";

const cardGridClass = "grid grid-cols-1 md:grid-cols-2 gap-6";

// Cards run 2-up in cardGridClass. A section with only one card gets this
// instead of sitting lopsided in the left column with a half-empty row
// beside it — same span-2 trick the old ChangePasswordCard used for the
// same reason.
const soloCardClass = "md:col-span-2";

// Each card's entrance is offset by a small stagger so the page cascades in
// on load instead of popping in all at once.
const STAGGER_STEP = 0.06;

export default async function SettingsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: planRow }] = await Promise.all([
    supabase
      .from("users")
      .select("full_name, reminder_enabled, reminder_time, timezone")
      .eq("id", user.id)
      .single(),
    supabase.from("plans").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);

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
          instead of stacking one-per-row down a narrow center column.
          Reads top to bottom as: who you are (Profile) → how the app
          behaves for you (Preferences, Notifications) → the app in general
          → account protection (Security) → irreversible actions (Danger
          Zone), which stays last and visually separated regardless of what
          else is on the page. Security itself and account deletion live on
          their own dedicated sub-pages (see /dashboard/settings/security and
          /dashboard/settings/danger) rather than as fields here — this page
          only links to them via SettingsMenuItem. */}
      <div className="mt-10 lg:mt-12 flex flex-col gap-14">
        {/* Profile */}
        <section>
          <h2 className={sectionLabelClass}>Profile</h2>
          <div className={cardGridClass}>
            <EditNameCard
              userId={user.id}
              initialFullName={profile?.full_name ?? ""}
              delay={0 * STAGGER_STEP}
            />
            <ChangeEmailCard currentEmail={user.email ?? ""} delay={1 * STAGGER_STEP} />
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className={sectionLabelClass}>Preferences</h2>
          <div className={cardGridClass}>
            <div className={soloCardClass}>
              <PlanAnalysisCard delay={2 * STAGGER_STEP} hasPlan={!!planRow} />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className={sectionLabelClass}>Notifications</h2>
          <div className={cardGridClass}>
            <div className={soloCardClass}>
              <RemindersCard
                userId={user.id}
                initialReminderEnabled={profile?.reminder_enabled ?? true}
                initialReminderTime={profile?.reminder_time ?? "20:00"}
                initialTimezone={profile?.timezone ?? "UTC"}
                delay={3 * STAGGER_STEP}
              />
            </div>
          </div>
        </section>

        {/* General */}
        <section>
          <h2 className={sectionLabelClass}>General</h2>
          <div className={cardGridClass}>
            <AboutCard appVersion={packageJson.version} delay={4 * STAGGER_STEP} />
            <LogoutCard delay={5 * STAGGER_STEP} />
          </div>
        </section>

        {/* Security — menu item only, no fields on this page. */}
        <section>
          <h2 className={sectionLabelClass}>Security</h2>
          <div className="max-w-xl">
            <SettingsMenuItem
              href="/dashboard/settings/security"
              icon="key-round"
              label="Security"
              description="Password and account protection."
              delay={6 * STAGGER_STEP}
            />
          </div>
        </section>

        {/* Danger zone — pulled apart from the rest of the page with its own
            divider and de-emphasized width so a destructive action never
            reads as just another settings row. Always last, regardless of
            what else is on the page. */}
        <section className="pt-10 border-t border-white/[0.06]">
          <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-red-400/50 mb-4">
            Danger zone
          </h2>
          <div className="max-w-xl">
            <SettingsMenuItem
              href="/dashboard/settings/danger"
              icon="alert-triangle"
              label="Danger Zone"
              description="Delete your account and all associated data."
              variant="danger"
              delay={7 * STAGGER_STEP}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

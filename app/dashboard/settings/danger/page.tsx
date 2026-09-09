import { redirect } from "next/navigation";
import { getUser } from "@/utils/supabase/server";
import SettingsBackHeader from "@/components/dashboard/settings/SettingsBackHeader";
import DeleteAccountCard from "@/components/dashboard/settings/DeleteAccountCard";

export default async function DangerZoneSettingsPage() {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <SettingsBackHeader title="Danger Zone" backHref="/dashboard/settings" variant="danger" />
      <div className="max-w-xl">
        <DeleteAccountCard email={user.email ?? undefined} />
      </div>
    </div>
  );
}

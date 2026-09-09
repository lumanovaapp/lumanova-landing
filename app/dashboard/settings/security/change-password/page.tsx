import { redirect } from "next/navigation";
import { getUser } from "@/utils/supabase/server";
import SettingsBackHeader from "@/components/dashboard/settings/SettingsBackHeader";
import ChangePasswordForm from "@/components/dashboard/settings/security/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const {
    data: { user },
  } = await getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  return (
    <div>
      <SettingsBackHeader title="Change Password" backHref="/dashboard/settings/security" />
      <ChangePasswordForm userId={user.id} userEmail={user.email} />
    </div>
  );
}

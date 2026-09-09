import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendPasswordChangedEmail } from "@/lib/send-password-changed-email";

export const runtime = "nodejs";

// Called by ChangePasswordForm right after supabase.auth.updateUser()
// succeeds. Separate from that call because RESEND_API_KEY is server-only —
// it can never be used from the browser client that makes the password
// update itself.
export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  try {
    await sendPasswordChangedEmail({
      to: user.email,
      firstName: profile?.full_name?.split(" ")[0] || "there",
    });
  } catch (err) {
    console.error("PASSWORD CHANGED EMAIL ERROR:", err);
    return NextResponse.json(
      { error: "Could not send the notification email." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

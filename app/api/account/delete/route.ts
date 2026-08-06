import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Storage objects aren't covered by the DB's `on delete cascade` chain, so
  // they have to be removed explicitly before/alongside deleting the user.
  const { data: files } = await admin.storage.from("selfies").list(user.id);
  if (files && files.length > 0) {
    await admin.storage
      .from("selfies")
      .remove(files.map((file) => `${user.id}/${file.name}`));
  }

  // Deleting the auth user cascades to public.users and, from there, to
  // photos/plans/daily_checkins/streaks/chat_messages via their `on delete
  // cascade` foreign keys — no separate row-by-row cleanup needed.
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error("ACCOUNT DELETE ERROR:", deleteError);
    return NextResponse.json(
      { error: "Could not delete your account. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

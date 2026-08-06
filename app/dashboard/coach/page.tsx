import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CoachChat from "@/components/CoachChat";

export default async function CoachPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: messageRows } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return <CoachChat initialMessages={messageRows ?? []} />;
}

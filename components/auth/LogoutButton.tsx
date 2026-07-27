"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="mt-12 h-12 px-6 rounded-xl border border-white/15 text-cream-ivory/70 text-sm font-medium hover:bg-white/5 hover:text-cream-ivory transition-colors disabled:opacity-60"
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}

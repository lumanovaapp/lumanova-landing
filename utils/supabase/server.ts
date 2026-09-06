import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore because
            // middleware refreshes the session on every request.
          }
        },
      },
    }
  );
}

// `supabase.auth.getUser()` makes a real network round-trip to Supabase's
// Auth server (unlike `getSession()`, which just reads the local JWT) — it's
// not free. The dashboard layout and every dashboard page each call it
// independently, and since they're rendered as part of the same request,
// that was 2+ redundant Auth-server round trips on every single navigation.
// `cache()` dedupes calls to this within one render pass so the layout and
// the page share a single call.
export const getUser = cache(async () => {
  const supabase = createClient();
  return supabase.auth.getUser();
});

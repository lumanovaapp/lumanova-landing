import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

// Service-role client for privileged, server-only operations (e.g. deleting
// an auth user) that RLS and the anon key can never be allowed to do.
// SUPABASE_SERVICE_ROLE_KEY must never be exposed to the browser — only
// import this from route handlers / server-only code, never from a
// "use client" file.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

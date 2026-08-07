import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "@/lib/supabase/env";

/**
 * Service-role Supabase client. Bypasses RLS entirely -- server-only,
 * never import from a Client Component. Intended for admin/seed
 * scripts and privileged server-side operations, not regular request
 * handling (use lib/supabase/server.ts for that).
 */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

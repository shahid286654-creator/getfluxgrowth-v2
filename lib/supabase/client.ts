import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Supabase client for Client Components. Safe to call repeatedly --
 * create a fresh instance per call site rather than module-level
 * singleton so it always picks up the latest cookies.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}

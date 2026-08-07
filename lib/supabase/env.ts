/**
 * Reads required Supabase env vars and fails fast with a clear message
 * instead of letting @supabase/ssr throw an opaque "supabaseUrl is
 * required" error. NEXT_PUBLIC_* values are inlined at build time, so
 * they must be set wherever `next build` runs (not just at runtime).
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "These must be set as build-time environment variables (not just runtime) " +
        "since Next.js inlines NEXT_PUBLIC_* values during `next build`."
    );
  }

  return { url, anonKey };
}

export function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }

  return key;
}

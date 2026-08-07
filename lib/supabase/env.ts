/**
 * A trailing slash on NEXT_PUBLIC_SUPABASE_URL (or stray whitespace/
 * newline from a copy-paste into a dashboard env var field) produces a
 * double slash when the auth client appends `/auth/v1/token` etc,
 * e.g. `https://xxx.supabase.co//auth/v1/token`. Supabase's gateway
 * rejects that path outright ("Invalid path specified in request
 * URL") instead of 404ing cleanly, which surfaces as a login failure
 * that looks unrelated to the URL itself. Normalize before use so a
 * cosmetically-correct env var value can't trigger it.
 */
function normalizeSupabaseUrl(rawUrl: string): string {
  return rawUrl.trim().replace(/\/+$/, "");
}

/**
 * Reads required Supabase env vars and fails fast with a clear message
 * instead of letting @supabase/ssr throw an opaque "supabaseUrl is
 * required" error. NEXT_PUBLIC_* values are inlined at build time, so
 * they must be set wherever `next build` runs (not just at runtime).
 */
export function getSupabaseEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!rawUrl || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "These must be set as build-time environment variables (not just runtime) " +
        "since Next.js inlines NEXT_PUBLIC_* values during `next build`."
    );
  }

  return { url: normalizeSupabaseUrl(rawUrl), anonKey };
}

export function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }

  return key;
}

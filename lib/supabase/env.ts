/**
 * @supabase/supabase-js appends `/auth/v1`, `/rest/v1`, etc itself, so
 * NEXT_PUBLIC_SUPABASE_URL must be the bare project origin. Two easy
 * mistakes both corrupt the request path instead of just 404ing:
 *
 * - A trailing slash produces a double slash, e.g.
 *   `https://xxx.supabase.co//auth/v1/token`.
 * - Pasting a sub-service URL from Supabase's API settings page (e.g.
 *   `https://xxx.supabase.co/auth/v1`, shown right next to the plain
 *   project URL) makes the SDK append its own `/auth/v1` on top of
 *   that, producing `https://xxx.supabase.co/auth/v1/auth/v1/token`.
 *
 * Either way Supabase's gateway rejects the path outright ("Invalid
 * path specified in request URL") rather than returning a normal
 * 404, which surfaces as an opaque login failure. Collapsing to
 * `new URL(...).origin` discards any path/query/hash so a
 * cosmetically-plausible env var value can't trigger either case.
 */
function normalizeSupabaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  try {
    return new URL(trimmed).origin;
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL: "${trimmed}" is not a valid URL. ` +
        "It must be your bare Supabase project URL, e.g. https://xxxxx.supabase.co " +
        "-- with no /auth/v1, /rest/v1, or trailing path."
    );
  }
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

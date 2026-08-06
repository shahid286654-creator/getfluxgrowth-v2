import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/leads",
  "/website-audit",
  "/seo-audit",
  "/ai-opportunities",
  "/outreach",
  "/pipeline",
  "/analytics",
  "/settings",
];

const AUTH_ONLY_PATHS = ["/login", "/forgot-password"];

/**
 * Refreshes the Supabase session cookie on every request and enforces
 * route protection for the (dashboard) route group. Invoked from the
 * root middleware.ts.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() (not getSession()) revalidates the token with
  // the Supabase auth server on every call -- required so an expired
  // session is actually caught here rather than trusting a stale cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthOnly = AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path));

  if (!user && isProtected) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthOnly) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

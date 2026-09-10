import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Server Components can read the session cookie but can't write one back, so
 * without this, a refreshed access token never makes it back to the browser
 * and the session quietly goes stale — getUser() then comes back empty even
 * though the reader is still signed in. This runs on every request, refreshes
 * the token when it's close to expiring, and re-sets the cookie so both the
 * server and the client stay looking at the same session.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!url || !anonKey) return response; // demo mode: nothing to refresh

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  // every route except static assets and image files — those never need a
  // session, and running the refresh on them is pure overhead
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)"],
};

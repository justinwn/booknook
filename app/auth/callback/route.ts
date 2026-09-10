import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Exchanges the OAuth / email-confirmation code for a session cookie, then
// hands the user to wherever the flow was headed (theme selection for new
// accounts, the library for returning ones).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding/theme";

  if (code) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}

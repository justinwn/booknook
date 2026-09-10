import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type AuthResult = { ok: true } | { ok: false; message: string };

const DEMO_NOTICE =
  "Supabase isn't connected yet, so this is running in demo mode.";

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: true }; // demo mode: let the flow continue
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, message: error.message } : { ok: true };
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: true };
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/theme` },
  });
  return error ? { ok: false, message: error.message } : { ok: true };
}

/** Kicks off the Supabase Google OAuth redirect. Returns only on failure. */
export async function signInWithGoogle(next = "/onboarding/theme"): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, message: DEMO_NOTICE };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  return error ? { ok: false, message: error.message } : { ok: true };
}

/**
 * Ends the session. In demo mode there is no session to end, so this is a
 * no-op and the caller still returns the reader to the login screen.
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: true };
  const { error } = await supabase.auth.signOut();
  return error ? { ok: false, message: error.message } : { ok: true };
}

export { isSupabaseConfigured };

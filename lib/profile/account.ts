import { getSupabaseClient } from "@/lib/supabase/client";

export interface Account {
  name: string | null;
  email: string | null;
  /** the picture Google (or another provider) sent with the identity */
  avatarUrl: string | null;
  /** "google", "email", … — the identity's owner decides if the name is editable */
  provider: string | null;
}

/**
 * Who is signed in, as far as the profile page needs to know. Google puts the
 * picture in the user's metadata under one of two keys depending on the flow,
 * so both are read. Demo mode has no session and answers null.
 */
export async function loadAccount(): Promise<Account | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const pick = (key: string) => (typeof meta[key] === "string" ? (meta[key] as string) : null);

  const app = (user.app_metadata ?? {}) as Record<string, unknown>;
  return {
    name: pick("full_name") ?? pick("name"),
    email: user.email ?? null,
    avatarUrl: pick("avatar_url") ?? pick("picture"),
    provider: typeof app.provider === "string" ? app.provider : null,
  };
}

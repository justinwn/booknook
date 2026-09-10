import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * The app is fully browsable without a Supabase project attached — auth and
 * persistence degrade to a local demo mode instead of crashing. Set
 * NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * to switch on the real thing.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export function getSupabaseClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(url!, anonKey!);
}

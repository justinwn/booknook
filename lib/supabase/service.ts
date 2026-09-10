import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Bypasses row-level security entirely — this key must never reach the
 * browser. `server-only` makes importing it from a Client Component a build
 * error rather than a leak waiting to happen.
 *
 * Used exclusively by the public share page: it reads one specific, curated,
 * public-safe slice of a single account (books, featured, theme) without
 * needing a public RLS policy that would otherwise expose every account's
 * row — including private ones like reminders — to anyone unauthenticated.
 */
export function getSupabaseServiceClient() {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

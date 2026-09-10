import { getSupabaseClient } from "@/lib/supabase/client";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "reader";
}

/** four base-36 characters — enough that a collision on the retry is
 * astronomically unlikely without needing a real retry loop */
function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * The short name in this reader's public share link. Generated once, from
 * their display name (or email, before they've set one), and kept from then
 * on — the link in ShareLibrary has to stay the same link once it's been
 * handed to anyone.
 */
export async function ensureSlug(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle();
  if (existing?.slug) return existing.slug;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const base = slugify(
    (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      user.email?.split("@")[0] ||
      "reader"
  );

  for (const candidate of [base, `${base}-${randomSuffix()}`]) {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, slug: candidate }, { onConflict: "id" })
      .select("slug")
      .maybeSingle();
    if (!error) return data?.slug ?? candidate;
    // 23505: the clean slug is already someone else's — try the suffixed one
    if (error.code !== "23505") return null;
  }
  return null;
}

import { getSupabaseClient } from "@/lib/supabase/client";
import { THEMES, DEFAULT_THEME_ID } from "@/lib/theme/themes";
import type { ThemeId } from "@/lib/types";

const STORAGE_KEY = "librari:theme";

function isThemeId(value: string | null): value is ThemeId {
  return Boolean(value) && THEMES.some((t) => t.id === value);
}

/**
 * Theme lives on the user's profile row when there's a session, and falls
 * back to localStorage otherwise (demo mode, or before sign-in). Callers
 * don't need to know which one answered.
 */
export async function loadThemePreference(): Promise<ThemeId> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { data } = await supabase
        .from("profiles")
        .select("theme_id")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (isThemeId(data?.theme_id ?? null)) return data!.theme_id as ThemeId;
    }
  }

  const local = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
  return isThemeId(local) ? local : DEFAULT_THEME_ID;
}

/**
 * Whether this reader has ever chosen a mood. The difference matters at the
 * door: someone signing back in should land in their library, and only an
 * account that has never picked a room should be sent to the picker. An
 * unanswered question is not the same as the default answer, which is why
 * `loadThemePreference` cannot be used for this.
 */
export async function hasThemePreference(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { data } = await supabase
        .from("profiles")
        .select("theme_id")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (isThemeId(data?.theme_id ?? null)) return true;
    }
  }

  const local = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
  return isThemeId(local);
}

export async function saveThemePreference(themeId: ThemeId): Promise<void> {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, themeId);
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  await supabase
    .from("profiles")
    .upsert({ id: auth.user.id, theme_id: themeId }, { onConflict: "id" });
}

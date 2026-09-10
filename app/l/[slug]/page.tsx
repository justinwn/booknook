import { notFound } from "next/navigation";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { THEMES, DEFAULT_THEME_ID } from "@/lib/theme/themes";
import type { Book, ThemeId } from "@/lib/types";
import { PublicLibrary } from "@/components/public/PublicLibrary";

/**
 * Next.js caches a Server Component's data fetches indefinitely by default —
 * including what Supabase's client does under the hood — unless told
 * otherwise. A share link has to reflect whatever is on the shelves right
 * now, not whatever it happened to be the first time anyone opened this
 * page, so both caches are switched off here.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LibraryRow {
  books?: Book[];
  featured?: (string | null)[];
  displayName?: string;
}

function toThemeId(value: unknown): ThemeId {
  return typeof value === "string" && THEMES.some((t) => t.id === value)
    ? (value as ThemeId)
    : DEFAULT_THEME_ID;
}

async function loadPublicLibrary(slug: string) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, theme_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!profile) return null;

  const { data: library } = await supabase
    .from("libraries")
    .select("data")
    .eq("id", profile.id)
    .maybeSingle();
  const doc = (library?.data ?? {}) as LibraryRow;

  const books = Array.isArray(doc.books) ? doc.books : [];
  const featuredIds = Array.isArray(doc.featured) ? doc.featured : [];
  const featured = featuredIds
    .map((id) => (id ? books.find((b) => b.id === id) ?? null : null))
    .filter((b): b is Book => b !== null);

  return {
    themeId: toThemeId(profile.theme_id),
    displayName: typeof doc.displayName === "string" ? doc.displayName : "",
    books,
    featured,
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const lib = await loadPublicLibrary(params.slug);
  return { title: lib ? `${lib.displayName || "A reader"}'s library — BookNook` : "Library not found" };
}

export default async function PublicLibraryPage({ params }: { params: { slug: string } }) {
  const lib = await loadPublicLibrary(params.slug);
  if (!lib) notFound();

  return (
    <PublicLibrary
      themeId={lib.themeId}
      displayName={lib.displayName}
      books={lib.books}
      featured={lib.featured}
    />
  );
}

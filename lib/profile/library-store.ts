import type { Book } from "@/lib/types";

const KEY = "librari:books";
const SEEDED_KEY = "librari:seeded";

/**
 * The collection, persisted per browser. There's no backend yet, so this is
 * the seam a Supabase `books` table replaces later — call sites only ever
 * see load/save/clear.
 */
export function loadBooks(): Book[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Book[]) : null;
  } catch {
    return null;
  }
}

export function saveBooks(books: Book[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(books));
    window.localStorage.setItem(SEEDED_KEY, "1");
  } catch {
    // storage full or blocked — the session still works, it just won't persist
  }
}

/**
 * A brand-new account starts with nothing on its shelves. Called from the
 * sign-up path so creating an account never inherits whatever the previous
 * person on this browser had.
 */
export function startEmptyLibrary(): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([]));
    window.localStorage.setItem(SEEDED_KEY, "1");
  } catch {
    // ignore
  }
}

export function hasStoredLibrary(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SEEDED_KEY) === "1";
  } catch {
    return false;
  }
}

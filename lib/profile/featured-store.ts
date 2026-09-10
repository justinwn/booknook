const KEY = "librari:featured";

/** Ids of the books pinned to the profile, in slot order. */
export function loadFeatured(): (string | null)[] {
  if (typeof window === "undefined") return [null, null, null, null];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [null, null, null, null];
    return [0, 1, 2, 3].map((i) => (typeof parsed[i] === "string" ? parsed[i] : null));
  } catch {
    return [null, null, null, null];
  }
}

export function saveFeatured(ids: (string | null)[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage blocked — the choice just won't persist
  }
}

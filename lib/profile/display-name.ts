const KEY = "librari:display-name";

/**
 * The name shown on the profile when the account isn't carrying one. A Google
 * identity supplies its own and owns it; anyone else picks their own here.
 * localStorage for now, like the rest of the profile — the seam a `profiles`
 * column replaces later.
 */
export function loadDisplayName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveDisplayName(name: string): void {
  try {
    const trimmed = name.trim().slice(0, 60);
    if (trimmed) window.localStorage.setItem(KEY, trimmed);
    else window.localStorage.removeItem(KEY);
  } catch {
    // storage blocked — the name applies for this session only
  }
}

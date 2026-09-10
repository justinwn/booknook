import type { ShelfHotspot, ThemeDefinition } from "@/lib/theme/themes";

export type Ownership = "owned" | "unowned";

export interface LibraryShelf {
  id: string;
  /** the shelf's name in this room, as it reads on hover and in the header */
  label: string;
  ownership: Ownership;
  hotspot: ShelfHotspot;
}

/**
 * Every room has two bookshelves and they hold separate collections: the
 * larger one is what you own, the smaller one is what you don't (yet).
 * Ownership is decided by the shelf a book lives on rather than a field on a
 * form — which is why the editor no longer asks.
 *
 * Derived from area rather than declared, so retuning a hotspot can't leave
 * the two out of step with each other.
 */
export function getShelves(theme: ThemeDefinition): LibraryShelf[] {
  const area = (h: ShelfHotspot) => h.width * h.height;
  return [...theme.shelfHotspots]
    .sort((a, b) => area(b) - area(a))
    .map((hotspot, index) => ({
      id: hotspot.id,
      label: hotspot.label ?? "Shelves",
      ownership: (index === 0 ? "owned" : "unowned") as Ownership,
      hotspot,
    }));
}

export function shelfSubtitle(ownership: Ownership): string {
  return ownership === "owned" ? "Books on your shelves" : "Books you don't own yet";
}

import type { Book } from "@/lib/types";

export type SortMode = "recently-finished" | "rating" | "author";

export const SORT_MODES: Array<{ id: SortMode; label: string }> = [
  { id: "recently-finished", label: "Recently finished" },
  { id: "rating", label: "Rating" },
  { id: "author", label: "Author" },
];

/** Surname first — how a library orders a shelf, not how a name is written. */
function surname(author: string): string {
  const parts = author.trim().split(/\s+/);
  return (parts[parts.length - 1] ?? author).toLowerCase();
}

/**
 * Orders books *within* a shelf. Dewey decides which shelf a book lives on;
 * this decides where it sits along that shelf — so sorting never scatters a
 * collection across the bookcase.
 */
export function sortBooks(books: Book[], mode: SortMode): Book[] {
  const sorted = [...books];
  switch (mode) {
    case "recently-finished":
      // unfinished books trail the finished ones rather than being dropped
      return sorted.sort((a, b) => {
        if (!a.finishedAt && !b.finishedAt) return a.title.localeCompare(b.title);
        if (!a.finishedAt) return 1;
        if (!b.finishedAt) return -1;
        return b.finishedAt.localeCompare(a.finishedAt);
      });
    case "rating":
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || a.title.localeCompare(b.title));
    case "author":
      return sorted.sort((a, b) => surname(a.author).localeCompare(surname(b.author)) || a.title.localeCompare(b.title));
  }
}

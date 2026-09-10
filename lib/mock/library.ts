import type { Book, DecorPlacement, Slot } from "@/lib/types";

/**
 * Bibliographic placeholder data. ISBNs are syntactically valid ISBN-13s
 * generated for this fixture — they are NOT the real assigned ISBNs for
 * these editions, and get replaced the moment real lookup lands.
 *
 * Original note: placeholder data — real titles/authors (metadata, not
 * reproduced cover art). Books are assigned to slots by index at load, so the
 * same collection lays out correctly in any room whose slot map differs.
 */
const CATALOG: Array<Omit<Book, "id" | "order" | "slotId" | "addedAt">> = [
  { title: "The Odyssey", author: "Homer", isbn: "9780316060011", dewey: 883.01, coverUrl: "", dimensions: { heightMm: 198, widthMm: 129, thicknessMm: 22 }, owned: true, status: "Done", rating: 5, finishedAt: "2025-06-18", tags: ["classic", "poetry"] },
  { title: "Braiding Sweetgrass", author: "Robin Wall Kimmerer", isbn: "9781571310026", dewey: 581.63, coverUrl: "", dimensions: { heightMm: 210, widthMm: 140, thicknessMm: 28 }, owned: true, status: "Ongoing", rating: 5, tags: ["nature", "essays"] },
  { title: "Norwegian Wood", author: "Haruki Murakami", isbn: "9780375700033", dewey: 895.63, coverUrl: "", dimensions: { heightMm: 197, widthMm: 128, thicknessMm: 18 }, owned: true, status: "Done", rating: 4, finishedAt: "2025-11-02", tags: ["fiction"] },
  { title: "Silent Spring", author: "Rachel Carson", isbn: "9780618240043", dewey: 363.73, coverUrl: "", dimensions: { heightMm: 203, widthMm: 133, thicknessMm: 16 }, owned: true, status: "New", tags: ["nonfiction"] },
  { title: "Pride and Prejudice", author: "Jane Austen", isbn: "9780141430058", dewey: 823.7, coverUrl: "", dimensions: { heightMm: 196, widthMm: 128, thicknessMm: 24 }, owned: true, status: "Done", rating: 4, finishedAt: "2025-02-14", tags: ["classic"] },
  { title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "9780547920061", dewey: 823.91, coverUrl: "", dimensions: { heightMm: 200, widthMm: 135, thicknessMm: 26 }, owned: true, status: "Ongoing", rating: 5, tags: ["fantasy"] },
  { title: "The Overstory", author: "Richard Powers", isbn: "9780393350074", dewey: 813.54, coverUrl: "", dimensions: { heightMm: 210, widthMm: 138, thicknessMm: 34 }, owned: true, status: "Dropped", tags: ["fiction"] },
  { title: "Klara and the Sun", author: "Kazuo Ishiguro", isbn: "9780593310083", dewey: 823.91, coverUrl: "", dimensions: { heightMm: 205, widthMm: 133, thicknessMm: 19 }, owned: true, status: "Done", rating: 4, finishedAt: "2026-01-09", tags: ["fiction"] },
  { title: "Sapiens", author: "Yuval Noah Harari", isbn: "9780062310095", dewey: 909.0, coverUrl: "", dimensions: { heightMm: 210, widthMm: 140, thicknessMm: 30 }, owned: true, status: "Ongoing", rating: 4, tags: ["history"] },
  { title: "The Little Prince", author: "Antoine de Saint-Exupéry", isbn: "9780156010108", dewey: 843.91, coverUrl: "", dimensions: { heightMm: 190, widthMm: 125, thicknessMm: 12 }, owned: true, status: "Done", rating: 5, finishedAt: "2025-08-21", tags: ["classic"] },
  { title: "A Room of One's Own", author: "Virginia Woolf", isbn: "9780156780117", dewey: 824.91, coverUrl: "", dimensions: { heightMm: 198, widthMm: 129, thicknessMm: 14 }, owned: true, status: "Done", rating: 5, finishedAt: "2025-09-30", tags: ["essays"] },
  { title: "The Dispossessed", author: "Ursula K. Le Guin", isbn: "9780060510121", dewey: 813.54, coverUrl: "", dimensions: { heightMm: 200, widthMm: 130, thicknessMm: 25 }, owned: true, status: "New", tags: ["sci-fi"] },
  { title: "Bluets", author: "Maggie Nelson", isbn: "9781937190132", dewey: 811.6, coverUrl: "", dimensions: { heightMm: 178, widthMm: 114, thicknessMm: 11 }, owned: true, status: "Done", rating: 4, finishedAt: "2025-04-05", tags: ["poetry"] },
  { title: "Kitchen", author: "Banana Yoshimoto", isbn: "9780671780142", dewey: 895.63, coverUrl: "", dimensions: { heightMm: 195, widthMm: 127, thicknessMm: 13 }, owned: true, status: "Done", rating: 4, finishedAt: "2025-12-12", tags: ["fiction"] },
  { title: "The Design of Everyday Things", author: "Don Norman", isbn: "9780465050154", dewey: 745.2, coverUrl: "", dimensions: { heightMm: 203, widthMm: 133, thicknessMm: 23 }, owned: true, status: "Done", rating: 5, finishedAt: "2026-01-22", tags: ["design"] },
  { title: "Thinking in Systems", author: "Donella Meadows", isbn: "9781603580168", dewey: 3.0, coverUrl: "", dimensions: { heightMm: 229, widthMm: 152, thicknessMm: 20 }, owned: true, status: "Ongoing", rating: 4, tags: ["systems"] },
  { title: "The Man Who Mistook His Wife for a Hat", author: "Oliver Sacks", isbn: "9781444700176", dewey: 616.8, coverUrl: "", dimensions: { heightMm: 198, widthMm: 129, thicknessMm: 17 }, owned: true, status: "Done", rating: 4, finishedAt: "2025-10-15", tags: ["science"] },
  { title: "The Book of Tea", author: "Okakura Kakuzō", isbn: "9780486200187", dewey: 394.15, coverUrl: "", dimensions: { heightMm: 180, widthMm: 115, thicknessMm: 10 }, owned: true, status: "Done", rating: 5, finishedAt: "2025-05-28", tags: ["nonfiction"] },
];

/** Lays the catalog onto whichever room's book slots are available. */
export function placeInitialBooks(slots: Slot[]): Book[] {
  const bookSlots = slots.filter((s) => s.kind === "book");
  return CATALOG.slice(0, bookSlots.length).map((book, i) => ({
    ...book,
    id: `book-${i}`,
    order: i,
    slotId: bookSlots[i].id,
    addedAt: new Date(2026, 0, i + 1).toISOString(),
  }));
}

/**
 * Books waiting to be shelved. Stands in for the real capture flow so the
 * placement + entrance animation can be exercised end to end.
 */
export const INBOX_BOOKS: Array<Omit<Book, "id" | "order" | "slotId" | "addedAt">> = [
  { title: "Wintering", author: "Katherine May", isbn: "9781786899736", dewey: 155.9, coverUrl: "", dimensions: { heightMm: 198, widthMm: 129, thicknessMm: 20 }, owned: true, status: "New", tags: ["nonfiction"] },
  { title: "Piranesi", author: "Susanna Clarke", isbn: "9781635575637", dewey: 823.92, coverUrl: "", dimensions: { heightMm: 200, widthMm: 130, thicknessMm: 21 }, owned: true, status: "New", tags: ["fiction"] },
  { title: "Convenience Store Woman", author: "Sayaka Murata", isbn: "9780802128256", dewey: 895.63, coverUrl: "", dimensions: { heightMm: 190, widthMm: 122, thicknessMm: 14 }, owned: true, status: "New", tags: ["fiction"] },
  { title: "An Immense World", author: "Ed Yong", isbn: "9780593133231", dewey: 573.87, coverUrl: "", dimensions: { heightMm: 210, widthMm: 140, thicknessMm: 29 }, owned: true, status: "New", tags: ["science"] },
];

export function initialDecor(slots: Slot[]): DecorPlacement[] {
  const decorSlots = slots.filter((s) => s.kind === "decor");
  const types = ["lamp", "cactus"] as const;
  return decorSlots.slice(0, types.length).map((slot, i) => ({
    id: `decor-${i}`,
    decorType: types[i],
    slotId: slot.id,
    scope: "universal" as const,
  }));
}

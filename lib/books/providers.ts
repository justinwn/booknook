/**
 * ISBN → book metadata.
 *
 * Two providers, tried in order: Open Library first because it returns a
 * Dewey Decimal class (which is what shelves the book here) and unrestricted
 * cover images; Google Books as a fallback because its coverage of recent
 * and non-English editions is better.
 *
 * The normalizers are pure so they can be tested against recorded payloads
 * without touching the network.
 */

export interface BookLookupResult {
  isbn: string;
  title: string;
  author: string;
  coverUrl: string | null;
  /** full Dewey number when the provider knows it */
  dewey: number | null;
  publishedYear: number | null;
  pageCount: number | null;
  source: "openlibrary" | "googlebooks";
}

export function normalizeIsbn(raw: string): string {
  return raw.replace(/[^0-9Xx]/g, "").toUpperCase();
}

export function isValidIsbn(raw: string): boolean {
  const isbn = normalizeIsbn(raw);
  if (isbn.length === 13) {
    if (!/^\d{13}$/.test(isbn)) return false;
    const sum = isbn
      .split("")
      .slice(0, 12)
      .reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
    return (10 - (sum % 10)) % 10 === Number(isbn[12]);
  }
  if (isbn.length === 10) {
    if (!/^\d{9}[\dX]$/.test(isbn)) return false;
    const sum = isbn
      .split("")
      .reduce((acc, c, i) => acc + (c === "X" ? 10 : Number(c)) * (10 - i), 0);
    return sum % 11 === 0;
  }
  return false;
}

/** "883/.01" and "823.912" both need to come out as a number we can shelve by. */
export function parseDewey(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/\//g, "").trim();
  const match = cleaned.match(/\d{1,3}(\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) && value >= 0 && value < 1000 ? value : null;
}

function yearFrom(raw: string | undefined): number | null {
  const match = raw?.match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

export function normalizeOpenLibrary(payload: unknown, isbn: string): BookLookupResult | null {
  const record = (payload as Record<string, any> | null)?.[`ISBN:${isbn}`];
  if (!record || !record.title) return null;

  return {
    isbn,
    title: record.title,
    author:
      Array.isArray(record.authors) && record.authors.length
        ? record.authors.map((a: any) => a?.name).filter(Boolean).join(", ")
        : "Unknown author",
    // the -L cover is the printable one; the record's own large URL wins if present
    coverUrl: record.cover?.large ?? record.cover?.medium ?? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
    dewey: parseDewey(record.classifications?.dewey_decimal_class?.[0]),
    publishedYear: yearFrom(record.publish_date),
    pageCount: typeof record.number_of_pages === "number" ? record.number_of_pages : null,
    source: "openlibrary",
  };
}

export function normalizeGoogleBooks(payload: unknown, isbn: string): BookLookupResult | null {
  const info = (payload as Record<string, any> | null)?.items?.[0]?.volumeInfo;
  if (!info || !info.title) return null;

  // Google serves cover thumbnails over http and at a small zoom by default
  const rawCover: string | undefined = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
  const coverUrl = rawCover ? rawCover.replace(/^http:/, "https:").replace("zoom=1", "zoom=2") : null;

  return {
    isbn,
    title: info.title + (info.subtitle ? `: ${info.subtitle}` : ""),
    author: Array.isArray(info.authors) && info.authors.length ? info.authors.join(", ") : "Unknown author",
    coverUrl,
    dewey: null, // Google Books doesn't expose Dewey
    publishedYear: yearFrom(info.publishedDate),
    pageCount: typeof info.pageCount === "number" ? info.pageCount : null,
    source: "googlebooks",
  };
}

/**
 * "Nothing found" and "couldn't reach the providers" are different answers and
 * the caller must be able to tell them apart — reporting an outage as a
 * missing book sends people hunting for a typo that isn't there.
 */
export type LookupOutcome =
  | { status: "found"; book: BookLookupResult }
  | { status: "not-found" }
  | { status: "unreachable" };

export async function lookupIsbn(isbn: string, fetchImpl: typeof fetch = fetch): Promise<LookupOutcome> {
  let reachedAnyProvider = false;

  try {
    const res = await fetchImpl(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      { headers: { Accept: "application/json" } }
    );
    if (res.ok) {
      reachedAnyProvider = true;
      const parsed = normalizeOpenLibrary(await res.json(), isbn);
      if (parsed) return { status: "found", book: parsed };
    }
  } catch {
    // fall through to the second provider rather than failing the request
  }

  try {
    const res = await fetchImpl(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      reachedAnyProvider = true;
      const parsed = normalizeGoogleBooks(await res.json(), isbn);
      if (parsed) return { status: "found", book: parsed };
    }
  } catch {
    // handled below
  }

  return reachedAnyProvider ? { status: "not-found" } : { status: "unreachable" };
}

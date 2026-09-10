"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { Book } from "@/lib/types";
import { SORT_MODES, sortBooks, type SortMode } from "@/lib/library/sorting";
import { spineColorFor } from "@/lib/spine-color";

interface FeaturedBookPickerProps {
  books: Book[];
  /** already-featured ids, so a book can't be pinned to two slots */
  taken: (string | null)[];
  onPick: (book: Book) => void;
  onClose: () => void;
}

/**
 * Choosing which book to feature. Sorted by rating out of the box — the point
 * of featuring is showing what you rated highest — with search for finding a
 * specific one once the collection is large.
 */
export function FeaturedBookPicker({ books, taken, onPick, onClose }: FeaturedBookPickerProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("rating");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = needle
      ? books.filter(
          (b) => b.title.toLowerCase().includes(needle) || b.author.toLowerCase().includes(needle)
        )
      : books;
    return sortBooks(matched, sort);
  }, [books, query, sort]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a book to feature"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-token-lg border border-gallery-ink/15 bg-white shadow-[0_30px_70px_-24px_rgba(0,0,0,0.5)]">
        <header className="flex items-start justify-between gap-4 border-b border-gallery-ink/10 p-5">
          <div>
            <h2 className="font-display text-lg text-gallery-ink">Feature a book</h2>
            <p className="mt-0.5 font-body text-xs text-gallery-ink/60">
              {books.length} on your shelves
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-gallery-ink/50 transition-colors hover:bg-gallery-ink/5 hover:text-gallery-ink"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3 border-b border-gallery-ink/10 p-4">
          <div className="relative min-w-[12rem] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gallery-ink/40"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or author"
              aria-label="Search your books"
              autoFocus
              className="w-full rounded-xl border border-gallery-ink/15 bg-white py-2.5 pl-9 pr-3 font-body text-[15px] text-gallery-ink shadow-[0_1px_2px_rgba(16,16,20,0.05)] placeholder:text-gallery-ink/40 focus:border-gallery-ink/45 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-gallery-ink/15 p-1">
            {SORT_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSort(mode.id)}
                aria-pressed={sort === mode.id}
                className={`rounded-lg px-2.5 py-1.5 font-body text-[11px] transition-colors ${
                  sort === mode.id
                    ? "bg-[#2b2a2e] text-white"
                    : "text-gallery-ink/60 hover:text-gallery-ink"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-4 py-10 text-center font-body text-sm text-gallery-ink/50">
              {books.length === 0
                ? "Add a book to your shelves first."
                : "Nothing matches that search."}
            </li>
          ) : (
            results.map((book) => {
              const already = taken.includes(book.id);
              const { bg } = spineColorFor(book);
              return (
                <li key={book.id}>
                  <button
                    type="button"
                    onClick={() => onPick(book)}
                    disabled={already}
                    className="flex w-full items-center gap-3 rounded-token px-3 py-2.5 text-left transition-colors hover:bg-gallery-ink/5 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <span className="h-10 w-7 shrink-0 rounded-[2px]" style={{ background: bg }} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-body text-sm font-medium text-gallery-ink">
                        {book.title}
                      </span>
                      <span className="block truncate font-body text-xs text-gallery-ink/55">
                        {book.author}
                      </span>
                    </span>
                    <span className="shrink-0 font-body text-xs tabular-nums text-gallery-ink/50">
                      {already ? "Featured" : book.rating ? `${book.rating}/5` : "—"}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

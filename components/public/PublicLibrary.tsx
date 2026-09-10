"use client";

import { useState } from "react";
import type { Book, ThemeId } from "@/lib/types";
import { getTheme } from "@/lib/theme/themes";
import { getShelves } from "@/lib/library/shelves";
import { sortBooks } from "@/lib/library/sorting";
import { Wallpaper } from "@/components/library/Wallpaper";
import { Book3D } from "@/components/book/Book3D";
import { BookDetailCard } from "@/components/book/BookDetailCard";
import { MadeBy } from "@/components/brand/MadeBy";
import { Wordmark } from "@/components/brand/Wordmark";

/**
 * The read-only room a share link opens. Same theme and shelves as the
 * owner's own library, laid out as a simple walkable list rather than the
 * pannable scene — a visitor is here to browse the books, not to place them,
 * so there is no add/edit/clear affordance anywhere on this page.
 */
export function PublicLibrary({
  themeId,
  displayName,
  books,
  featured,
}: {
  themeId: ThemeId;
  displayName: string;
  books: Book[];
  featured: Book[];
}) {
  const theme = getTheme(themeId);
  const shelves = getShelves(theme);
  const [activeBook, setActiveBook] = useState<Book | null>(null);

  return (
    <main data-theme={themeId} className="relative min-h-screen overflow-hidden bg-bg">
      <Wallpaper src={theme.wallpaper} poster={theme.poster} scrim={theme.isLight ? "medium" : "light"} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/70" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-16 sm:px-10">
        <div className="flex items-center gap-2 text-white/70">
          <Wordmark className="text-lg" />
        </div>

        <h1
          className="mt-8 font-display text-3xl text-white sm:text-4xl"
          style={{ fontFamily: theme.paper.fontDisplay, letterSpacing: theme.paper.displayTracking }}
        >
          {displayName || "A reader"}&apos;s library
        </h1>
        <p className="mt-2 font-body text-sm text-white/60">
          {books.length} book{books.length === 1 ? "" : "s"} · {theme.name}
        </p>

        {featured.length > 0 && (
          <section className="mt-10">
            <h2 className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Featured
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {featured.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => setActiveBook(book)}
                  aria-label={`${book.title} by ${book.author}, featured`}
                  className="flex aspect-[2/3] w-full items-center justify-center transition-transform hover:-translate-y-1"
                >
                  <Book3D book={book} height={190} />
                </button>
              ))}
            </div>
          </section>
        )}

        {shelves.map((shelf) => {
          const onShelf = sortBooks(
            books.filter((b) => b.owned === (shelf.ownership === "owned")),
            "recently-finished"
          );
          if (onShelf.length === 0) return null;
          return (
            <section key={shelf.id} className="mt-12">
              <h2 className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                {shelf.label}
              </h2>
              <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-4 sm:gap-x-6 md:grid-cols-5">
                {onShelf.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => setActiveBook(book)}
                    aria-label={`${book.title} by ${book.author}`}
                    className="flex flex-col items-center transition-transform hover:-translate-y-1"
                  >
                    <Book3D book={book} height={150} />
                  </button>
                ))}
              </div>
            </section>
          );
        })}

        {books.length === 0 && (
          <p className="mt-12 font-body text-sm text-white/60">The shelves are still empty.</p>
        )}

        <footer className="mt-20 border-t border-white/10 pt-6">
          <MadeBy className="text-[11px] text-white/45" linkClassName="text-white/70" />
        </footer>
      </div>

      {activeBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveBook(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <BookDetailCard book={activeBook} paper={theme.paper} onClose={() => setActiveBook(null)} />
          </div>
        </div>
      )}
    </main>
  );
}

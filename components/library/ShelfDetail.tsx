"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import type { Book } from "@/lib/types";
import type { PaperTreatment, Shelving } from "@/lib/theme/themes";
import { DEWEY_CLASSES, deweyClassFor } from "@/lib/library/dewey";
import { SORT_MODES, sortBooks, type SortMode } from "@/lib/library/sorting";
import { shelfSubtitle, type LibraryShelf } from "@/lib/library/shelves";
import { ShelfCompartment } from "./ShelfCompartment";
import { BookDetailCard } from "@/components/book/BookDetailCard";
import { Book3D } from "@/components/book/Book3D";

interface ShelfDetailProps {
  books: Book[];
  paper?: PaperTreatment;
  shelving: Shelving;
  /** the two bookshelves in this room, and which one is open */
  shelves: LibraryShelf[];
  activeShelfId: string;
  onShelfChange: (id: string) => void;
  /** the Dewey class to scroll to and briefly mark, from the shelf that was clicked */
  focusClass?: number | null;
  onEditBook: (book: Book) => void;
  onClose: () => void;
  onAddBook: () => void;
  /** empties the shelf currently open; the other shelf keeps its books */
  onClearShelf: () => void;
  /** a book still in flight toward its slot; its spine stays hidden until it lands */
  arrivingBookId?: string | null;
}

/**
 * The bookcase, seen close up. Compartments are Dewey classes — that's the
 * shelving system — and the sort control orders books along each shelf
 * without moving them between shelves.
 *
 * Controls live in a floating bar pinned to the bottom of the viewport rather
 * than a header above the shelves: the shelves are the thing being looked at,
 * and they get the full width and height of the screen.
 */
export function ShelfDetail({
  books,
  paper,
  shelving,
  shelves,
  activeShelfId,
  onShelfChange,
  focusClass,
  onEditBook,
  onClose,
  onAddBook,
  onClearShelf,
  arrivingBookId,
}: ShelfDetailProps) {
  const [sort, setSort] = useState<SortMode>("recently-finished");
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  /**
   * Hovering peeks at a book; clicking pins it. A pinned card stays until it
   * is dismissed, so you can read a note without holding the mouse still.
   */
  const [pinned, setPinned] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  /** where on screen the active book stands, so the held-out book appears beside it */
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const clearRef = useRef<HTMLButtonElement>(null);

  const activeIndex = Math.max(0, shelves.findIndex((s) => s.id === activeShelfId));
  const activeShelf = shelves[activeIndex];

  /** each bookshelf keeps its own records — you never see the other's books here */
  const shelfBooks = useMemo(
    () => books.filter((b) => b.owned === (activeShelf?.ownership === "owned")),
    [books, activeShelf]
  );

  const classes = useMemo(() => {
    return DEWEY_CLASSES.map((deweyClass) => ({
      deweyClass,
      books: sortBooks(
        shelfBooks.filter((b) => deweyClassFor(b.dewey).code === deweyClass.code),
        sort
      ),
    })).filter((shelf) => shelf.books.length > 0);
  }, [shelfBooks, sort]);

  /**
   * Nothing on the wishlist has been finished, so ordering by finish date is
   * an empty promise there. The option is absent, and a sort already set to
   * it falls back rather than silently doing nothing.
   */
  const owned = activeShelf?.ownership === "owned";
  const sortModes = owned ? SORT_MODES : SORT_MODES.filter((m) => m.id !== "recently-finished");
  useEffect(() => {
    if (!owned && sort === "recently-finished") setSort("rating");
  }, [owned, sort]);

  const step = (delta: number) =>
    onShelfChange(shelves[(activeIndex + delta + shelves.length) % shelves.length].id);

  const activeBook = books.find((b) => b.id === activeBookId) ?? null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // back out one layer at a time: dialog, then held-out book, then the shelves
      if (confirmClear) setConfirmClear(false);
      else if (activeBookId) closeBook();
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeBookId, confirmClear, onClose]);

  function closeBook() {
    setActiveBookId(null);
    setPinned(false);
  }

  useEffect(() => {
    // scroll only as far as needed, so the shelves settle without a jump
    focusRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusClass]);

  useEffect(() => {
    if (confirmClear) clearRef.current?.focus();
  }, [confirmClear]);

  const iconButton =
    "rounded-full border border-border bg-surface/70 p-2 text-ink-muted transition-colors hover:text-ink";

  return (
    <div className="animate-shelf-in absolute inset-0 z-40 overflow-y-auto bg-bg/75 backdrop-blur-lg">
      {/* the shelves take the whole viewport width; the toolbar floats over them */}
      <div className="min-h-full w-full px-5 pb-36 pt-10 sm:px-8 lg:px-12">
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div
              className="h-24 w-40"
              style={{
                background: shelving.frame,
                borderRadius: shelving.radius,
                boxShadow: "0 18px 40px -22px rgba(0,0,0,0.8)",
                opacity: 0.6,
              }}
              aria-hidden
            />
            <h3 className="font-display text-xl text-ink">
              {activeShelf?.ownership === "owned"
                ? "Nothing on these shelves yet"
                : "Nothing on your list yet"}
            </h3>
            <p className="max-w-sm font-body text-sm leading-relaxed text-ink-muted">
              {activeShelf?.ownership === "owned"
                ? "Books you add here get shelved by their Dewey class. A shelf appears once there is something to put on it."
                : "This shelf holds the books you don't own yet. Add one and it waits here until it's yours."}
            </p>
            <button
              type="button"
              onClick={onAddBook}
              className="mt-1 rounded-token-lg bg-accent px-6 py-3 font-body text-sm font-medium text-bg shadow-token-lg transition-all hover:brightness-110"
            >
              {activeShelf?.ownership === "owned" ? "Add your first book" : "Add a book to the list"}
            </button>
          </div>
        ) : (
          /* shelves fill the width and wrap: as the window narrows they drop to
             fewer per row rather than being squeezed. The room's own column
             preference only sets how narrow a shelf is allowed to get. */
          <div
            className="grid gap-x-6 gap-y-12"
            style={{
              // min(…, 100%) keeps the last narrow step honest: below the
              // minimum a single shelf shrinks to the viewport instead of
              // running off the right edge
              gridTemplateColumns: `repeat(auto-fill, minmax(min(${
                shelving.columns === 3 ? "20rem" : "26rem"
              }, 100%), 1fr))`,
            }}
          >
            {classes.map((shelf) => (
              <div
                key={shelf.deweyClass.code}
                ref={shelf.deweyClass.code === focusClass ? focusRef : undefined}
              >
                <ShelfCompartment
                  shelving={shelving}
                  fontFamily={paper?.fontDisplay}
                  deweyClass={shelf.deweyClass}
                  books={shelf.books}
                  activeBookId={activeBookId}
                  onActivate={(id, rect, viaClick) => {
                    if (arrivingBookId) return; // let the arriving book land first
                    if (pinned && !viaClick) return; // a pinned card owns the stage
                    setActiveBookId(id);
                    if (viaClick) setPinned(true);
                    setAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                  }}
                  highlighted={shelf.deweyClass.code === focusClass}
                  arrivingBookId={arrivingBookId}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING TOOLBAR — pinned to the bottom, above the shelves */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] flex justify-center px-4 pb-5">
        <div className="glass-strong pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-[26px] px-3 py-2 shadow-token-lg">
          <div className="flex items-center gap-2">
            {shelves.length > 1 && (
              <button type="button" onClick={() => step(-1)} aria-label="Previous shelf" className={iconButton}>
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
            )}

            <div className="px-1">
              <h2 className="font-display text-base leading-tight text-ink">{activeShelf?.label}</h2>
              <p className="font-body text-[11px] text-ink-muted">
                {activeShelf ? shelfSubtitle(activeShelf.ownership) : ""} · {shelfBooks.length}{" "}
                {shelfBooks.length === 1 ? "book" : "books"}
              </p>
            </div>

            {shelves.length > 1 && (
              <button type="button" onClick={() => step(1)} aria-label="Next shelf" className={iconButton}>
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-full border border-border bg-surface-raised/70 p-1">
            {sortModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSort(mode.id)}
                aria-pressed={sort === mode.id}
                className={`rounded-full px-3 py-1.5 font-body text-xs transition-colors ${
                  sort === mode.id ? "bg-accent text-bg" : "text-ink-muted hover:text-ink"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* adding from here puts the book on the shelf you are looking at */}
          <button
            type="button"
            onClick={onAddBook}
            className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 font-body text-xs font-medium text-bg transition-all hover:brightness-110"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add book
          </button>

          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            disabled={shelfBooks.length === 0}
            className="flex items-center gap-1.5 rounded-full border border-[#c8776e]/45 px-3.5 py-2 font-body text-xs text-[#c8776e] transition-colors hover:bg-[#c8776e]/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Clear shelf
          </button>

          <button type="button" onClick={onClose} aria-label="Back to the room" className={iconButton}>
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* The book, held out in front of the shelf, with its note beside it.
          Rendered here rather than inside the compartment because a
          horizontally scrolling shelf clips anything that overflows it. */}
      {activeBook && anchor && (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          onMouseLeave={() => {
            if (!pinned) setActiveBookId(null);
          }}
        >
          {/* a pinned card is dismissed by clicking away from it */}
          {pinned && (
            <div className="pointer-events-auto absolute inset-0" onClick={closeBook} aria-hidden />
          )}
          <div
            className="pointer-events-auto absolute flex items-start gap-3"
            style={{
              // clamped so the composition never runs off the edge
              left: Math.min(Math.max(anchor.x - 90, 16), window.innerWidth - 470),
              top: Math.min(Math.max(anchor.y - 150, 16), window.innerHeight - 380),
            }}
          >
            {/* the held-out book covers the spine it came from, so this is
                what a click actually lands on: it pins the card open */}
            <div
              role="presentation"
              onClick={() => setPinned(true)}
              className={pinned ? "cursor-default" : "cursor-pointer"}
            >
              <Book3D book={activeBook} height={240} className="animate-book-settle" />
            </div>
            <BookDetailCard
              book={activeBook}
              paper={paper}
              onEdit={() => onEditBook(activeBook)}
              onClose={closeBook}
            />
          </div>
        </div>
      )}

      {confirmClear && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-5"
          onClick={() => setConfirmClear(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-shelf-title"
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-sm rounded-token-lg p-6 shadow-token-lg"
          >
            <h3 id="clear-shelf-title" className="font-display text-xl text-ink">
              Clear {activeShelf?.label ?? "this shelf"}?
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
              This removes all {shelfBooks.length}{" "}
              {shelfBooks.length === 1 ? "book" : "books"} on this shelf, along with their notes
              and ratings. It cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="font-body text-sm text-ink-muted transition-colors hover:text-ink"
              >
                Cancel
              </button>
              <button
                ref={clearRef}
                type="button"
                onClick={() => {
                  onClearShelf();
                  setConfirmClear(false);
                  setActiveBookId(null);
                }}
                className="rounded-token-lg bg-[#8d3a32] px-5 py-2.5 font-body text-sm font-medium text-white transition-all hover:brightness-110"
              >
                Clear all books
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

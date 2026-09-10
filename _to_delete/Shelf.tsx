"use client";

import { Plus } from "lucide-react";
import type { Book, DecorPlacement, Shelf as ShelfType } from "@/lib/types";
import { BookSpine } from "@/components/book/BookSpine";
import { DecorPlaceholder } from "@/components/decor/DecorPlaceholder";

interface ShelfProps {
  shelf: ShelfType;
  books: Book[];
  decorPlacements: DecorPlacement[];
  recentlyAddedBookId?: string | null;
  onEmptySlotClick?: (slotId: string) => void;
}

// The shelf board itself is a plain tokenized surface — a physical piece of
// furniture placed in the scene — deliberately NOT a photo. Its slots are
// the only layout system; nothing here reads pixel positions off an image.
export function Shelf({ shelf, books, decorPlacements, recentlyAddedBookId, onEmptySlotClick }: ShelfProps) {
  return (
    <div className="grain-overlay relative w-full rounded-token border border-border bg-surface-raised shadow-token-lg">
      <div className="relative z-10 h-32 w-full sm:h-36">
        {shelf.slots.map((slot) => {
          const book = slot.kind === "book" ? books.find((b) => b.slotId === slot.id) : undefined;
          const decor = slot.kind === "decor" ? decorPlacements.find((d) => d.slotId === slot.id) : undefined;

          return (
            <div
              key={slot.id}
              className="absolute"
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                width: `${slot.width}%`,
                height: `${slot.height}%`,
              }}
            >
              {book && <BookSpine book={book} animateIn={book.id === recentlyAddedBookId} />}

              {decor && <DecorPlaceholder decorType={decor.decorType} />}

              {!book && !decor && slot.kind === "book" && (
                <button
                  type="button"
                  onClick={() => onEmptySlotClick?.(slot.id)}
                  aria-label="Add a book to this spot"
                  className="group flex h-full w-full items-end justify-center pb-2"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-border/0 text-ink-soft/0 transition-all duration-200 group-hover:border-border group-hover:text-ink-soft">
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* shelf lip — a physical ledge the books sit on */}
      <div className="h-3 rounded-b-token bg-surface shadow-token-inset" />
    </div>
  );
}

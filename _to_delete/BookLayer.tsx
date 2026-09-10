"use client";

import type { Book, DecorPlacement, Slot } from "@/lib/types";
import { BookSpine } from "@/components/book/BookSpine";
import { DecorPlaceholder } from "@/components/decor/DecorPlaceholder";
import { Plus } from "lucide-react";

interface BookLayerProps {
  slots: Slot[];
  books: Book[];
  decorPlacements: DecorPlacement[];
  recentlyAddedBookId?: string | null;
  onEmptySlotClick?: (slotId: string) => void;
  /**
   * Decor slots exist in every room map, but placeholder decor art reads as
   * UI litter sitting on top of a photograph. Off until the real layered
   * artwork exists; the placement data is already flowing through.
   */
  showDecor?: boolean;
  lighting?: { brightness: number; saturate: number };
  /** clicking anywhere along a shelf row zooms into that shelf */
  onShelfClick?: (rowId: string, center: { x: number; y: number }) => void;
  /** draw real shelf boards for rooms whose background has none */
  drawShelves?: boolean;
  rows?: Array<{ id: string; ledgeY: number; xStart: number; xEnd: number; bookHeight: number }>;
}

/**
 * Renders everything that lives IN the room — books, decor, empty-slot
 * affordances — positioned purely from slot data. Add a row to the slot map
 * and it appears here; this component knows nothing about the photograph.
 */
export function BookLayer({
  slots,
  books,
  decorPlacements,
  recentlyAddedBookId,
  onEmptySlotClick,
  showDecor = false,
  lighting,
  onShelfClick,
  rows = [],
  drawShelves = false,
}: BookLayerProps) {
  const bookBySlot = new Map(books.map((b) => [b.slotId, b]));
  const decorBySlot = new Map(decorPlacements.map((d) => [d.slotId, d]));

  return (
    <div
      className="absolute inset-0"
      style={
        lighting
          ? { filter: `brightness(${lighting.brightness}) saturate(${lighting.saturate})` }
          : undefined
      }
    >
      {/* Shelf boards, drawn when the background is an ambient scene rather
          than a photographed shelf. A board is furniture standing in the
          room — it never tries to line up with anything in the picture. */}
      {drawShelves &&
        rows.map((row) => (
          <div
            key={`board-${row.id}`}
            className="absolute rounded-[2px] border-x border-b border-black/25 "
            style={{
              left: `${row.xStart - 2}%`,
              top: `${row.ledgeY}%`,
              width: `${row.xEnd - row.xStart + 4}%`,
              height: "2.6%",
              background: "linear-gradient(to bottom, #6b4c2f, #402a17)",
              boxShadow: "0 10px 22px -8px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
            aria-hidden
          />
        ))}

      {/* a hit area per shelf row, behind the books, so clicking the shelf
          itself (not a book) zooms into it */}
      {onShelfClick &&
        rows.map((row) => (
          <button
            key={`hit-${row.id}`}
            type="button"
            aria-label="Open this shelf"
            onClick={() =>
              onShelfClick(row.id, {
                x: (row.xStart + row.xEnd) / 2,
                y: row.ledgeY - row.bookHeight / 2,
              })
            }
            className="absolute z-0 cursor-zoom-in rounded-sm transition-colors duration-300 hover:bg-white/10"
            style={{
              left: `${row.xStart}%`,
              top: `${row.ledgeY}%`,
              width: `${row.xEnd - row.xStart}%`,
              height: "2.4%",
            }}
          />
        ))}

      {slots.map((slot) => {
        const book = bookBySlot.get(slot.id);
        const decor = decorBySlot.get(slot.id);

        return (
          <div
            key={slot.id}
            className="absolute z-10"
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: `${slot.width}%`,
              height: `${slot.height}%`,
            }}
          >
            {book && (
              <BookSpine
                book={book}
                scale={slot.scale}
                animateIn={book.id === recentlyAddedBookId}
                onSelect={
                  onShelfClick
                    ? () =>
                        onShelfClick(slot.rowId, {
                          x: slot.x + slot.width / 2,
                          y: slot.y + slot.height / 2,
                        })
                    : undefined
                }
              />
            )}

            {decor && showDecor && <DecorPlaceholder decorType={decor.decorType} />}

            {!book && !decor && slot.kind === "book" && (
              <button
                type="button"
                onClick={() => onEmptySlotClick?.(slot.id)}
                aria-label="Add a book to this spot"
                className="group flex h-full w-full items-end justify-center pb-[6%]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-white/0 text-white/0 backdrop-blur-[1px] transition-all duration-200 group-hover:border-white/50 group-hover:bg-black/25 group-hover:text-white/80 group-focus-visible:border-white/50 group-focus-visible:text-white/80">
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import clsx from "clsx";
import type { Book } from "@/lib/types";
import type { DeweyClass } from "@/lib/library/dewey";
import type { Shelving } from "@/lib/theme/themes";
import { formatClassCode } from "@/lib/library/dewey";
import { BookOnShelf } from "@/components/book/BookOnShelf";

/**
 * A stable pseudo-random 0–1 per book. Real shelves are ragged, and every
 * book we store carries the same default height, so the variation is derived
 * from the id: the same book always stands the same height, on every render
 * and every reload.
 */
function jitter(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

interface ShelfCompartmentProps {
  deweyClass: DeweyClass;
  books: Book[];
  shelving: Shelving;
  activeBookId: string | null;
  onActivate: (id: string, rect: DOMRect, viaClick: boolean) => void;
  highlighted?: boolean;
  arrivingBookId?: string | null;
  /** the room's display face, so spine lettering matches its notes */
  fontFamily?: string;
}

/**
 * One shelf, built out of the current mood's materials. A framed case has
 * woodwork on all four sides; a floating shelf is a plank on brackets with
 * nothing behind it; a blocky one is thick, hard-cornered and sits on a
 * visible base. Same data, different furniture.
 */
export function ShelfCompartment({
  deweyClass,
  books,
  shelving,
  activeBookId,
  onActivate,
  highlighted,
  arrivingBookId,
  fontFamily,
}: ShelfCompartmentProps) {
  const tallest = Math.max(210, ...books.map((b) => b.dimensions.heightMm));
  const framed = shelving.style === "framed" || shelving.style === "blocky";

  return (
    <section
      className={clsx("relative transition-shadow duration-500", highlighted && "ring-2 ring-accent/70")}
      style={{
        borderRadius: shelving.radius,
        // a framed case is woodwork all round; a floating plank has none
        padding: framed ? shelving.boardThickness : 0,
        background: framed ? shelving.frame : "transparent",
        boxShadow: framed ? "0 14px 30px -22px rgba(0,0,0,0.6)" : "none",
      }}
      aria-label={`${formatClassCode(deweyClass.code)} ${deweyClass.label}`}
    >
      <span
        className="absolute -top-[18px] left-5 z-30 flex items-center gap-1.5 px-3 py-1.5 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.8)]"
        style={{ background: shelving.signBackground, borderRadius: shelving.radius === 0 ? 0 : 999 }}
      >
        <span className="font-body text-[10px] font-semibold tabular-nums tracking-wider text-white/55">
          {formatClassCode(deweyClass.code)}
        </span>
        <span className="font-body text-[11px] font-medium text-white">{deweyClass.label}</span>
      </span>

      <div
        className="relative flex h-44 items-end gap-[4px] overflow-x-auto overflow-y-visible px-4 pt-8 sm:h-52"
        style={{
          background: shelving.interior,
          borderRadius: Math.max(0, shelving.radius - shelving.boardThickness / 2),
          // the books take the room's light rather than sitting in front of it
          filter: shelving.bookTone,
        }}
      >
        {/* the room's own colour, washed across the back of the shelf */}
        {shelving.interiorWash && (
          <span
            className="pointer-events-none absolute inset-0"
            style={{ background: shelving.interiorWash }}
            aria-hidden
          />
        )}
        {books.map((book) => (
          <BookOnShelf
            key={book.id}
            book={book}
            active={activeBookId === book.id}
            onActivate={(rect, viaClick) => onActivate(book.id, rect, viaClick)}
            heightPct={Math.round(
              (book.dimensions.heightMm / tallest) * (78 + jitter(book.id) * 22)
            )}
            fontFamily={fontFamily}
            awaitingArrival={book.id === arrivingBookId}
          />
        ))}
      </div>

      {/* the plank itself — the only structure a floating shelf has */}
      {!framed && (
        <>
          <div
            style={{
              height: shelving.boardThickness,
              background: shelving.frame,
              borderRadius: shelving.radius,
              boxShadow: "0 12px 22px -12px rgba(0,0,0,0.7)",
            }}
          />
          <div className="flex justify-between px-8">
            {[0, 1].map((i) => (
              <span
                key={i}
                style={{
                  width: shelving.boardThickness * 0.9,
                  height: shelving.boardThickness * 1.6,
                  background: shelving.frame,
                  borderBottomLeftRadius: shelving.radius,
                  borderBottomRightRadius: shelving.radius,
                  opacity: 0.75,
                }}
                aria-hidden
              />
            ))}
          </div>
        </>
      )}

      {/* blocky shelves sit on a visible base course */}
      {shelving.style === "blocky" && (
        <div
          className="mt-[6px]"
          style={{
            height: shelving.boardThickness * 0.7,
            background: shelving.frame,
            filter: "brightness(0.8)",
          }}
          aria-hidden
        />
      )}
    </section>
  );
}

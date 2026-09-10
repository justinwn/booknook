"use client";

import { useRef } from "react";
import clsx from "clsx";
import type { Book } from "@/lib/types";
import { spineColorFor } from "@/lib/spine-color";

interface BookOnShelfProps {
  book: Book;
  /** true when this is the book currently taken off the shelf */
  active: boolean;
  onActivate: (rect: DOMRect, viaClick: boolean) => void;
  /** height as a % of the compartment, derived from the book's real height */
  heightPct: number;
  /** hidden while a flying book is still travelling toward this spot */
  awaitingArrival?: boolean;
  /** the room's display face; falls back to the app's when a theme has none */
  fontFamily?: string;
}

/**
 * A book standing in a compartment. Hover or focus eases it up and forward;
 * when it becomes the active book the spine recedes, because the book itself
 * is now being held out in front of the shelf (rendered by the overlay in
 * ShelfDetail, which can escape this compartment's scroll clipping).
 */
export function BookOnShelf({
  book,
  active,
  onActivate,
  heightPct,
  awaitingArrival,
  fontFamily,
}: BookOnShelfProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { bg, band } = spineColorFor(book);
  const widthPx = Math.round(26 + ((book.dimensions.thicknessMm - 10) / 30) * 30);

  const activate = (viaClick: boolean) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) onActivate(rect, viaClick);
  };

  return (
    <button
      ref={ref}
      type="button"
      onMouseEnter={() => activate(false)}
      onFocus={() => activate(false)}
      onClick={() => activate(true)}
      aria-label={`${book.title} by ${book.author}`}
      aria-expanded={active}
      data-book-id={book.id}
      className={clsx(
        "relative shrink-0 self-end rounded-t-[2px] transition-all duration-300 ease-settle",
        active ? "-translate-y-1 opacity-35" : "hover:-translate-y-2.5 focus-visible:-translate-y-2.5",
        awaitingArrival && "opacity-0"
      )}
      style={{ width: widthPx, height: `${heightPct}%` }}
    >
      <span
        className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-t-[2px] shadow-[0_4px_8px_-6px_rgba(0,0,0,0.5)]"
        style={{ background: bg }}
      >
        <span className="h-[5%] w-full" style={{ background: band }} />
        <span
          className="flex-1 overflow-hidden whitespace-nowrap px-[10%] py-[8%] font-display text-[0.6rem] leading-tight text-white/85"
          style={{ writingMode: "vertical-rl", textOverflow: "ellipsis", fontFamily }}
        >
          {book.title}
        </span>
        <span className="h-[5%] w-full" style={{ background: band }} />
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            // cloth and board, not lacquer: the edges roll away into shadow,
            // there is no specular band down the middle, and a fine vertical
            // weave breaks up the flat fill the way binding cloth does
            backgroundImage: [
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.022) 0 1px, transparent 1px 4px)",
              "linear-gradient(to right, rgba(0,0,0,0.28), rgba(0,0,0,0.03) 36%, rgba(0,0,0,0.08) 64%, rgba(0,0,0,0.24))",
            ].join(","),
          }}
        />
      </span>
    </button>
  );
}

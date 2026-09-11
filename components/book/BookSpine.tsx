"use client";

import { useState } from "react";
import clsx from "clsx";
import type { Book } from "@/lib/types";
import { spineColorFor } from "@/lib/spine-color";

interface BookSpineProps {
  book: Book;
  /** depth cue from the slot — books further into the room sit slightly smaller */
  scale?: number;
  /** true only for a book that just landed this session; existing books render settled */
  animateIn?: boolean;
  /** books in the room are too small to act on directly — clicking one takes you to its shelf */
  onSelect?: () => void;
}

/**
 * One book, standing on its shelf. Width comes from the stored thickness, so
 * a fat hardcover visibly takes more shelf than a slim paperback. Sits on the
 * bottom edge of its slot — the slot's bottom IS the ledge line.
 */
export function BookSpine({ book, scale = 1, animateIn = false, onSelect }: BookSpineProps) {
  const [hovered, setHovered] = useState(false);
  const { bg, band } = spineColorFor(book);

  // thickness 10–40mm fills 64–100% of the slot, and spines align left rather
  // than centring, so a row reads as books packed against each other with the
  // odd gap — not evenly spaced ornaments
  const widthPct = Math.min(100, 64 + ((book.dimensions.thicknessMm - 10) / 30) * 36);

  return (
    <div className="absolute inset-x-0 bottom-0 flex h-full items-end justify-start">
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={onSelect}
        aria-label={`${book.title} by ${book.author}${book.status ? `, ${book.status}` : ""}`}
        className={clsx(
          "relative flex flex-col justify-between overflow-hidden rounded-t-[2px]",
          "shadow-[0_6px_14px_-4px_rgba(0,0,0,0.75)] transition-transform duration-300 ease-gentle",
          "hover:-translate-y-[14%] focus-visible:-translate-y-[14%]",
          animateIn && "animate-slot-in"
        )}
        style={{
          width: `${widthPct}%`,
          height: `${100 * scale}%`,
          background: bg,
        }}
      >
        <div className="h-[6%] w-full" style={{ background: band }} />
        {/* vertical-rl stacks wrapped lines across the spine's width rather
            than down it, so the line cap is a width. line-clamp alone can't
            be trusted here — `-webkit-box` still paints the overflowing line
            in this writing mode — so the block size is what actually holds it
            to two: 2 × the 0.55rem/1.25 line box, with the clamp left on for
            the ellipsis it adds. */}
        <span className="flex flex-1 items-center justify-center overflow-hidden px-[8%] py-[6%]">
          <span
            className="line-clamp-2 max-h-full overflow-hidden font-display text-[0.55rem] leading-tight text-white/85"
            style={{ writingMode: "vertical-rl", maxWidth: "1.4rem", textOverflow: "ellipsis" }}
          >
            {book.title}
          </span>
        </span>
        <div className="h-[6%] w-full" style={{ background: band }} />

        {/* cylindrical shading + a contact shadow at the foot: a flat
            rectangle reads as a sticker next to photographed books */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.38), rgba(255,255,255,0.10) 38%, rgba(255,255,255,0.03) 62%, rgba(0,0,0,0.34))",
          }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[14%]"
          style={{ backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)" }}
          aria-hidden
        />

        {book.owned && book.status && (
          <span
            className="absolute left-1/2 top-[3%] h-1 w-1 -translate-x-1/2 rounded-full"
            style={{
              background:
                book.status === "Done"
                  ? "#7fae6c"
                  : book.status === "Ongoing"
                  ? "#d1a13a"
                  : book.status === "Dropped"
                  ? "#b8564a"
                  : "#d8d2c4",
            }}
            aria-hidden
          />
        )}
      </button>

      {hovered && (
        <div
          role="tooltip"
          className="grain-overlay pointer-events-none absolute bottom-full left-0 z-30 mb-2 w-40 rounded-token border border-border bg-surface p-3 text-left shadow-token-lg"
        >
          <p className="relative z-10 font-display text-sm leading-snug text-ink">{book.title}</p>
          <p className="relative z-10 mt-0.5 font-body text-xs text-ink-muted">{book.author}</p>
          {book.rating && (
            <p className="relative z-10 mt-1 font-body text-xs text-accent">{"★".repeat(book.rating)}</p>
          )}
        </div>
      )}
    </div>
  );
}

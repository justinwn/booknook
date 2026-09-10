"use client";

import { useEffect, useState } from "react";
import type { PaperTreatment } from "@/lib/theme/themes";
import { lineForNow, LINE_ROTATION_MS, type LiteraryLine } from "@/lib/quotes/literary-lines";

/**
 * A line from a book, in the corner of the room, changing every half hour.
 * Rendered only after mount: the line depends on the reader's own clock, and
 * the server has no idea what time it is where they are.
 */
export function RoomQuote({ paper, titles = [] }: { paper: PaperTreatment; titles?: string[] }) {
  const [line, setLine] = useState<LiteraryLine | null>(null);

  // the shelves decide which line, so it changes as the collection grows
  const key = titles.join("|");
  useEffect(() => {
    const pick = () => setLine(lineForNow(titles));
    pick();
    // lands on the turn of the next slot, then keeps to the half hour
    const wait = LINE_ROTATION_MS - (Date.now() % LINE_ROTATION_MS);
    let interval: number;
    const timeout = window.setTimeout(() => {
      pick();
      interval = window.setInterval(pick, LINE_ROTATION_MS);
    }, wait);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!line) return null;

  return (
    <figure
      className="pointer-events-none max-w-[16rem] select-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:max-w-[22rem]"
      style={{ fontFamily: paper.fontBody }}
    >
      <blockquote className="text-[13px] leading-relaxed text-white/80 sm:text-sm">
        “{line.text}”
      </blockquote>
      <figcaption className="mt-1.5 text-[11px] text-white/50">
        {line.author}, <cite className="not-italic">{line.work}</cite>
      </figcaption>
    </figure>
  );
}

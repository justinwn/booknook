"use client";

import { useEffect, useState } from "react";
import { SAMPLE_BOOKS } from "@/lib/mock/sample-books";
import type { PaperTreatment } from "@/lib/theme/themes";
import { BookAndNote } from "./BookAndNote";

interface BookCompositionProps {
  /** ms between shuffles; 0 disables shuffling (single static book) */
  interval?: number;
  paper?: PaperTreatment;
}

/**
 * The hero object: the same book-and-note composition the mood picker shows,
 * cycling through the sample books so the login screen presents the product's
 * actual content shape rather than one fixed mock.
 */
export function BookComposition({ interval = 6000, paper }: BookCompositionProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (interval <= 0 || SAMPLE_BOOKS.length < 2) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SAMPLE_BOOKS.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [interval]);

  const book = SAMPLE_BOOKS[index];

  return (
    <div className="relative" aria-live="polite">
      {/* key on the book id so each shuffle replays the settle animation */}
      <BookAndNote
        swapKey={book.id}
        title={book.title}
        author={book.author}
        coverUrl={book.coverUrl}
        rating={book.rating}
        note={book.note}
        finishedAt={book.finishedAt}
        paper={paper}
        height={360}
      />

      {/* shuffle position dots — quiet, but they explain the motion */}
      {SAMPLE_BOOKS.length > 1 && (
        <div className="absolute -bottom-16 left-1 flex gap-1.5">
          {SAMPLE_BOOKS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${b.title}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-token ease-gentle ${
                i === index ? "w-6 bg-white/80" : "w-1.5 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

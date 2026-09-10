"use client";

import type { Book } from "@/lib/types";
import type { PaperTreatment } from "@/lib/theme/themes";
import { Book3D } from "./Book3D";
import { BookNote } from "./BookNote";

interface BookAndNoteProps {
  title: string;
  author: string;
  coverUrl?: string;
  rating: number;
  note: string;
  finishedAt?: string;
  paper?: PaperTreatment;
  /** rendered height of the book in px; the note scales against it */
  height?: number;
  /** replays the settle animation when it changes */
  swapKey?: string;
  /**
   * Where the note sits against the book. The default tucks it deep into the
   * cover, which reads well at hero size; a small composition needs it pushed
   * clear so the cover is still legible.
   */
  noteClassName?: string;
  className?: string;
}

/**
 * A book with its reading note tucked against the corner — the product's
 * whole idea in one object. One component so the login hero and the mood
 * picker show the same thing rather than two arrangements that drift.
 */
export function BookAndNote({
  title,
  author,
  coverUrl,
  rating,
  note,
  finishedAt,
  paper,
  height = 300,
  swapKey,
  noteClassName,
  className,
}: BookAndNoteProps) {
  return (
    <div className={className} style={{ width: Math.round(height * 0.652) }}>
      <div key={swapKey} className="relative">
        <Book3D
          book={
            {
              title,
              author,
              coverUrl,
              dimensions: { heightMm: 198, widthMm: 129, thicknessMm: 22 },
            } as Book
          }
          height={height}
          className="animate-book-settle"
        />

        <BookNote
          title={title}
          author={author}
          rating={rating}
          note={note}
          finishedAt={finishedAt}
          paper={paper}
          // on a phone the note tucks against the book's corner instead of
          // hanging off it — there is no room to the right to hang into
          className={
            noteClassName ??
            "animate-book-settle !absolute -bottom-10 -right-3 w-[80%] min-w-0 rounded-[2px] sm:-right-[62%] sm:w-[86%] sm:min-w-[13rem]"
          }
        />
      </div>
    </div>
  );
}

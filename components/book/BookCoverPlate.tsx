import clsx from "clsx";
import type { Book } from "@/lib/types";
import { spineColorFor } from "@/lib/spine-color";

/**
 * A generated front cover, used until real cover art is fetched. Built from
 * the same binding color as the book's spine so a pulled-out book reads as
 * the same object that was standing on the shelf.
 */
export function BookCoverPlate({ book, className }: { book: Book; className?: string }) {
  const { bg, band } = spineColorFor(book);

  return (
    <div
      className={clsx("relative flex flex-col justify-between overflow-hidden rounded-[3px] p-3", className)}
      style={{ background: bg }}
    >
      <div className="absolute inset-y-0 left-0 w-2" style={{ background: band }} aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.14), transparent 55%)" }}
        aria-hidden
      />

      <p className="relative z-10 pl-2 font-display text-sm leading-tight text-white/95">{book.title}</p>
      <p className="relative z-10 pl-2 font-body text-[10px] uppercase tracking-[0.12em] text-white/70">
        {book.author}
      </p>
    </div>
  );
}

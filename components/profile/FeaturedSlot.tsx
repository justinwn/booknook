"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Replace, Trash2 } from "lucide-react";
import type { Book } from "@/lib/types";
import { Book3D } from "@/components/book/Book3D";

interface FeaturedSlotProps {
  book: Book | null;
  /** opens the picker: for an empty slot, and for Replace on a filled one */
  onChoose: () => void;
  /** clears the slot back to its empty state */
  onRemove: () => void;
}

/**
 * One place on the featured shelf. Empty, it invites a pick. Filled, the book
 * fills the slot and is itself the control: clicking it offers the only two
 * things you can do to a featured book, rather than parking a delete cross on
 * the cover art.
 */
export function FeaturedSlot({ book, onChoose, onRemove }: FeaturedSlotProps) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // the book is sized from the slot, so it fills the width it is given
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    // a slot that just emptied has nothing left to act on
    if (!book) setOpen(false);
  }, [book]);

  if (!book) {
    return (
      <div ref={boxRef} className="relative">
        <button
          type="button"
          onClick={onChoose}
          className="flex aspect-[2/3] w-full items-center justify-center rounded-token border border-dashed border-ink/30 font-body text-xs text-ink/55 transition-colors hover:border-ink/60 hover:text-ink"
        >
          Empty
        </button>
      </div>
    );
  }

  const action =
    "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-body text-sm text-gallery-ink transition-colors hover:bg-gallery-ink/5";

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${book.title}, featured. Replace or remove`}
        className="flex aspect-[2/3] w-full cursor-pointer items-center justify-center rounded-token focus:outline-none focus-visible:ring-2 focus-visible:ring-selected"
      >
        {/* height leads, so the book sits inside the slot at any column width */}
        {width > 0 && <Book3D book={book} height={Math.round(width * 1.5)} />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-[calc(100%-0.75rem)] z-30 w-44 -translate-x-1/2 overflow-hidden rounded-token-lg border border-gallery-ink/12 bg-white py-1 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onChoose();
            }}
            className={action}
          >
            <Replace className="h-4 w-4 text-gallery-ink/55" strokeWidth={1.75} aria-hidden />
            Replace book
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onRemove();
            }}
            className={`${action} text-[#9c3a30]`}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Remove book
          </button>
        </div>
      )}
    </div>
  );
}

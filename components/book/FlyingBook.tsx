"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Book } from "@/lib/types";
import { BookCoverPlate } from "./BookCoverPlate";

interface FlyingBookProps {
  book: Book;
  /** where the cover sat in the add form */
  from: DOMRect;
  /** resolves to the book's spine on the shelf once the shelves have rendered */
  resolveTarget: () => DOMRect | null;
  onLanded: () => void;
}

/**
 * The book being put away: a short arc from the add form to the exact spot on
 * the shelf where the current sort puts it. The target is measured from the
 * real spine, so the flight always ends where the book actually lives rather
 * than at a guessed position.
 */
export function FlyingBook({ book, from, resolveTarget, onLanded }: FlyingBookProps) {
  const [target, setTarget] = useState<DOMRect | null>(null);

  useEffect(() => {
    let frame = 0;
    let attempts = 0;
    // the shelves mount and animate in first; poll briefly for the spine
    const look = () => {
      const rect = resolveTarget();
      if (rect && rect.width > 0) {
        setTarget(rect);
        return;
      }
      if (attempts++ < 40) frame = requestAnimationFrame(look);
      else onLanded(); // shelf never appeared — don't strand the book mid-air
    };
    frame = requestAnimationFrame(look);
    return () => cancelAnimationFrame(frame);
  }, [resolveTarget, onLanded]);

  if (!target) return null;

  const dx = target.left + target.width / 2 - (from.left + from.width / 2);
  const dy = target.top + target.height / 2 - (from.top + from.height / 2);
  const scale = Math.max(0.08, target.height / from.height);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden>
      <div
        className="animate-book-flight absolute overflow-hidden rounded-[3px] shadow-[0_22px_44px_-18px_rgba(0,0,0,0.7)]"
        style={
          {
            left: from.left,
            top: from.top,
            width: from.width,
            height: from.height,
            "--fly-dx": `${dx}px`,
            "--fly-dy": `${dy}px`,
            "--fly-scale": scale,
            "--fly-mid-scale": Math.max(scale, 0.45),
          } as React.CSSProperties
        }
        onAnimationEnd={onLanded}
      >
        {book.coverUrl ? (
          <Image src={book.coverUrl} alt="" fill sizes="260px" className="object-cover" unoptimized />
        ) : (
          <BookCoverPlate book={book} className="h-full w-full" />
        )}
      </div>
    </div>
  );
}

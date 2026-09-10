"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import type { Book } from "@/lib/types";
import { spineColorFor } from "@/lib/spine-color";

interface Book3DProps {
  book: Book;
  /** rendered height in px; width and depth follow from the book's real dimensions */
  height?: number;
  className?: string;
}

/**
 * A book built as an actual box in CSS 3D — front face, spine and top edge,
 * so it reads as an object rather than a rectangle with a gradient painted on.
 * Assembled from the book's own data: the cover art (or its dominant colour)
 * on the front, the same colour on the spine, and a page block whose depth
 * comes from the stored thickness.
 *
 * It tilts toward the pointer. The rotation is small on purpose — enough to
 * catch the light as the cursor crosses it, not enough to become a toy.
 */
export function Book3D({ book, height = 240, className }: Book3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  /** a cover URL that won't load falls back to the printed plate, not a gap */
  const [coverFailed, setCoverFailed] = useState(false);

  const { bg, band } = spineColorFor(book);
  const width = Math.round(height * (book.dimensions.widthMm / book.dimensions.heightMm));
  const depth = Math.max(10, Math.round((book.dimensions.thicknessMm / book.dimensions.heightMm) * height));

  function track(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    // -0.5…0.5 across the element, so the book leans toward the cursor
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 16, y: px * 26 });
  }

  return (
    <div
      ref={ref}
      className={clsx("relative", className)}
      style={{ perspective: 900, width, height }}
      onMouseMove={track}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div
        className="relative h-full w-full transition-transform duration-200 ease-gentle"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${-20 + tilt.y}deg)`,
        }}
      >
        {/*
          Faces of a box, each centred then pushed out along its own axis —
          the standard CSS 3D formulation. Left face is the spine, right is
          the fore edge, top is the head of the text block.
        */}
        <div
          className="absolute inset-0 overflow-hidden rounded-r-[3px]"
          style={{ transform: `translateZ(${depth / 2}px)`, background: bg }}
        >
          {book.coverUrl && !coverFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverUrl}
              alt=""
              onError={() => setCoverFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col justify-between p-3">
              <p className="font-display text-sm leading-tight text-white/95">{book.title}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-white/70">{book.author}</p>
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.20), transparent 48%)" }}
          />
        </div>

        {/* spine */}
        <div
          className="absolute inset-y-0 flex items-center justify-center overflow-hidden"
          style={{
            width: depth,
            left: `calc(50% - ${depth / 2}px)`,
            transform: `rotateY(-90deg) translateZ(${width / 2}px)`,
            background: band,
          }}
        >
          <span
            className="whitespace-nowrap px-1 text-[9px] text-white/85"
            style={{ writingMode: "vertical-rl" }}
          >
            {book.title}
          </span>
        </div>

        {/* fore edge — the page block you actually see */}
        <div
          className="absolute inset-y-0"
          style={{
            width: depth,
            left: `calc(50% - ${depth / 2}px)`,
            transform: `rotateY(90deg) translateZ(${width / 2}px)`,
            backgroundImage: "repeating-linear-gradient(to right, #f1e9d8 0 1px, #d7cdb6 1px 2px)",
          }}
        />

        {/* head of the text block */}
        <div
          className="absolute inset-x-0"
          style={{
            height: depth,
            top: `calc(50% - ${depth / 2}px)`,
            transform: `rotateX(90deg) translateZ(${height / 2}px)`,
            backgroundImage: "repeating-linear-gradient(to right, #ece3d0 0 1px, #cec3aa 1px 2px)",
          }}
        />

      </div>

      {/* contact shadow, so it sits on something */}
      <div
        className="pointer-events-none absolute -bottom-3 left-1/2 h-4 w-[86%] -translate-x-1/2 rounded-[50%] blur-md"
        style={{ background: "rgba(0,0,0,0.55)" }}
        aria-hidden
      />
    </div>
  );
}

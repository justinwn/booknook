"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { bandFor } from "@/lib/books/dominant-color";

interface SpineColorPickerProps {
  /** current spine colour */
  value: string;
  /** colours sampled from the cover, offered as one-click choices */
  palette: string[];
  onChange: (bg: string, band: string) => void;
}

/**
 * Sets the colour of the book's spine from the jacket itself. The palette is
 * read off the cover, so every option already belongs to the book — there is
 * no free colour picker, because a spine that matches nothing on the shelf is
 * not a choice worth offering.
 */
export function SpineColorPicker({ value, palette, onChange }: SpineColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(color: string) {
    onChange(color, bandFor(color));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Spine colour"
        aria-expanded={open}
        title="Spine colour"
        className="h-10 w-10 rounded-full border-2 border-white/35 shadow-token transition-transform hover:scale-105"
        style={{ background: value }}
      />

      {open && (
        <div className="glass-strong absolute left-0 top-12 z-50 w-56 rounded-token-lg p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            From the cover
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {palette.length > 0 ? (
              palette.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => pick(color)}
                  aria-label={`Use ${color}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 transition-transform hover:scale-110"
                  style={{ background: color }}
                >
                  {color === value && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
                </button>
              ))
            ) : (
              <p className="text-[11px] leading-relaxed text-ink-soft">
                No colours to sample yet. Search a book first.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

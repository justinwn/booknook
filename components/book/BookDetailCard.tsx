"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Book } from "@/lib/types";
import type { PaperTreatment } from "@/lib/theme/themes";
import { BookNote } from "./BookNote";
import { BookShareQR } from "./BookShareQR";
import { formatCallNumber } from "@/lib/library/dewey";

type Mode = "note" | "share";

interface BookDetailCardProps {
  book: Book;
  paper?: PaperTreatment;
  /** absent on a read-only view (the public share page) — Edit doesn't show */
  onEdit?: () => void;
  onClose: () => void;
}

/**
 * What a pulled-out book shows: its reading note on the room's paper stock,
 * with the two things you'd actually want to do from there — edit the record
 * (including removing it) or hand someone the book by ISBN.
 */
export function BookDetailCard({ book, paper, onEdit, onClose }: BookDetailCardProps) {
  const [mode, setMode] = useState<Mode>("note");

  return (
    <div className="grain-overlay glass-strong relative w-[17rem] rounded-token-lg p-3">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute -right-2 -top-2 z-20 rounded-full border border-border bg-surface p-1.5 text-ink-muted shadow-token transition-colors hover:text-ink"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      {mode === "note" && (
        <div className="relative z-10 flex flex-col gap-3">
          <BookNote
            title={book.title}
            author={book.author}
            rating={book.rating ?? 0}
            note={book.note ?? "No note yet."}
            finishedAt={book.finishedAt}
            startedAt={book.startedAt}
            ongoing={book.status === "Ongoing"}
            paper={paper}
            className="w-full rounded-[2px]"
          />

          <div className="flex items-center justify-between gap-2">
            <span className="font-body text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              {formatCallNumber(book.dewey)}
            </span>
            <span className="flex gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-token-lg border border-border px-3.5 py-1.5 font-body text-xs text-ink transition-colors hover:bg-surface-raised"
                >
                  Edit
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode("share")}
                className="rounded-token-lg bg-accent px-3.5 py-1.5 font-body text-xs font-medium text-bg transition-all hover:brightness-105"
              >
                Share book
              </button>
            </span>
          </div>
        </div>
      )}

      {mode === "share" && (
        <div className="relative z-10">
          <BookShareQR book={book} onBack={() => setMode("note")} />
        </div>
      )}
    </div>
  );
}

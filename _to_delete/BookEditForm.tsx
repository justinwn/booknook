"use client";

import { useState } from "react";
import type { Book, BookStatus } from "@/lib/types";

const STATUSES: BookStatus[] = ["New", "Ongoing", "Done", "Dropped"];

interface BookEditFormProps {
  book: Book;
  onSave: (changes: Partial<Book>) => void;
  onRemove: () => void;
  onCancel: () => void;
}

export function BookEditForm({ book, onSave, onRemove, onCancel }: BookEditFormProps) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [dewey, setDewey] = useState(String(book.dewey));
  const [rating, setRating] = useState(book.rating ?? 0);
  const [owned, setOwned] = useState(book.owned);
  const [status, setStatus] = useState<BookStatus>(book.status ?? "New");
  const [note, setNote] = useState(book.note ?? "");
  const [confirmRemove, setConfirmRemove] = useState(false);

  const deweyNumber = Number(dewey);
  const deweyValid = dewey.trim() !== "" && !Number.isNaN(deweyNumber) && deweyNumber >= 0 && deweyNumber < 1000;
  const canSave = title.trim().length > 0 && author.trim().length > 0 && deweyValid;

  const field =
    "w-full border-0 border-b border-border bg-transparent px-0 py-1.5 font-body text-sm text-ink focus:border-accent focus:outline-none";
  const label = "font-body text-[10px] uppercase tracking-[0.14em] text-ink-muted";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSave) return;
        onSave({
          title: title.trim(),
          author: author.trim(),
          dewey: deweyNumber,
          rating: rating || undefined,
          owned,
          // status only means something for a book you own
          status: owned ? status : undefined,
          note: note.trim() || undefined,
        });
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <label className={label} htmlFor="edit-title">Title</label>
        <input id="edit-title" className={field} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-1">
        <label className={label} htmlFor="edit-author">Author</label>
        <input id="edit-author" className={field} value={author} onChange={(e) => setAuthor(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-1">
        <label className={label} htmlFor="edit-dewey">Dewey number</label>
        <input
          id="edit-dewey"
          className={field}
          value={dewey}
          inputMode="decimal"
          onChange={(e) => setDewey(e.target.value)}
          aria-invalid={!deweyValid}
          aria-describedby={!deweyValid ? "edit-dewey-error" : undefined}
        />
        {!deweyValid && (
          <p id="edit-dewey-error" role="alert" className="font-body text-[11px] text-[#e9a49d]">
            Use a number between 0 and 999.99.
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className={label}>Rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(rating === n ? 0 : n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              className={`text-lg leading-none transition-opacity ${n <= rating ? "text-[#e8a13a]" : "text-ink-soft opacity-40 hover:opacity-70"}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <span className={label}>Owned</span>
        <div className="flex gap-1.5">
          {[
            { value: true, text: "Owned" },
            { value: false, text: "Not owned" },
          ].map((option) => (
            <button
              key={option.text}
              type="button"
              onClick={() => setOwned(option.value)}
              aria-pressed={owned === option.value}
              className={`rounded-full border px-2.5 py-1 font-body text-[11px] transition-colors ${
                owned === option.value
                  ? "border-accent bg-accent/15 text-ink"
                  : "border-border text-ink-muted hover:text-ink"
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>

      {owned && (
      <div className="flex flex-col gap-1.5">
        <span className={label}>Status</span>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
              className={`rounded-full border px-2.5 py-1 font-body text-[11px] transition-colors ${
                status === s ? "border-accent bg-accent/15 text-ink" : "border-border text-ink-muted hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      )}

      <div className="flex flex-col gap-1">
        <label className={label} htmlFor="edit-note">Note</label>
        <textarea
          id="edit-note"
          className={`${field} min-h-[64px] resize-y leading-relaxed`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-full bg-accent px-4 py-1.5 font-body text-xs font-medium text-bg disabled:opacity-40"
          >
            Save
          </button>
          <button type="button" onClick={onCancel} className="px-2 font-body text-xs text-ink-muted hover:text-ink">
            Cancel
          </button>
        </div>

        {confirmRemove ? (
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRemove}
              className="rounded-full bg-[#8d3a32] px-3 py-1.5 font-body text-xs text-white"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setConfirmRemove(false)}
              className="font-body text-xs text-ink-muted hover:text-ink"
            >
              Keep
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            className="font-body text-xs text-[#c8776e] hover:underline"
          >
            Remove
          </button>
        )}
      </div>
    </form>
  );
}

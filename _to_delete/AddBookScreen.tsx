"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { QrCode, Loader2, BookOpen } from "lucide-react";
import type { Book, BookStatus } from "@/lib/types";
import type { PaperTreatment } from "@/lib/theme/themes";
import type { BookLookupResult } from "@/lib/books/providers";
import { BookNote } from "@/components/book/BookNote";
import { deweyClassFor } from "@/lib/library/dewey";

interface AddBookScreenProps {
  paper?: PaperTreatment;
  onCancel: () => void;
  /** hands over the finished book plus where its cover sat, so it can fly to the shelf */
  onAdd: (book: Omit<Book, "id" | "order" | "slotId">, coverRect: DOMRect | null) => void;
}

const STARS = [1, 2, 3, 4, 5];
const STATUSES: BookStatus[] = ["New", "Ongoing", "Done", "Dropped"];

export function AddBookScreen({ paper, onCancel, onAdd }: AddBookScreenProps) {
  const [isbn, setIsbn] = useState("");
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [found, setFound] = useState<BookLookupResult | null>(null);
  const [owned, setOwned] = useState(true);
  const [status, setStatus] = useState<BookStatus>("New");
  /** editable: the provider's Dewey is a starting point, not always the one you'd shelve by */
  const [dewey, setDewey] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  async function search() {
    if (!isbn.trim() || searching) return;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/books/lookup?isbn=${encodeURIComponent(isbn)}`);
      const data = await res.json();
      if (!res.ok) {
        setFound(null);
        setError(data.error ?? "Couldn't find that book.");
      } else {
        const book = data as BookLookupResult;
        setFound(book);
        // an unclassified book goes to 800s Literature, the likeliest home in a
        // personal collection — the field stays editable either way
        setDewey(String(book.dewey ?? 800));
      }
    } catch {
      setFound(null);
      setError("Couldn't reach the book service. Check your connection.");
    } finally {
      setSearching(false);
    }
  }

  const deweyNumber = Number(dewey);
  const deweyValid = dewey.trim() !== "" && !Number.isNaN(deweyNumber) && deweyNumber >= 0 && deweyNumber < 1000;
  const canSubmit = Boolean(found) && deweyValid;

  function submit() {
    if (!found || !deweyValid) return;
    const finished = owned && status === "Done";
    onAdd(
      {
        isbn: found.isbn,
        title: found.title,
        author: found.author,
        coverUrl: found.coverUrl ?? "",
        dewey: deweyNumber,
        dimensions: { heightMm: 198, widthMm: 129, thicknessMm: Math.min(40, Math.max(12, Math.round((found.pageCount ?? 300) / 12))) },
        rating: rating || undefined,
        note: note.trim() || undefined,
        tags: [],
        owned,
        // status only means something for a book you own
        status: owned ? status : undefined,
        finishedAt: finished ? new Date().toISOString().slice(0, 10) : undefined,
        addedAt: new Date().toISOString(),
      },
      coverRef.current?.getBoundingClientRect() ?? null
    );
  }

  const label = "font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted";

  return (
    <div className="animate-shelf-in absolute inset-0 z-[60] overflow-y-auto bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto grid min-h-full w-full max-w-5xl grid-cols-1 items-center gap-12 px-6 py-14 lg:grid-cols-[0.9fr_1fr] lg:gap-16 lg:px-10">
        {/* LEFT — the book as it will look on the shelf, filling in as you go */}
        <div className="relative mx-auto w-full max-w-sm lg:mx-0">
          <div
            className="pointer-events-none absolute -inset-16 -z-10"
            style={{
              background:
                "radial-gradient(60% 55% at 45% 40%, rgb(var(--color-accent-soft-rgb) / 0.20), transparent 70%)",
            }}
            aria-hidden
          />
          <div
            ref={coverRef}
            className="relative aspect-[2/3] w-[74%] overflow-hidden rounded-[3px] shadow-[0_34px_64px_-20px_rgba(0,0,0,0.7)]"
            style={{ transform: "rotate(-3deg)" }}
          >
            {found?.coverUrl ? (
              <Image
                key={found.coverUrl}
                src={found.coverUrl}
                alt={`Cover of ${found.title}`}
                fill
                sizes="260px"
                className="animate-book-settle object-cover"
                unoptimized
              />
            ) : (
              // empty state: a book that hasn't arrived yet
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface/60">
                <BookOpen className="h-8 w-8 text-ink-soft" strokeWidth={1.25} />
                <p className="px-6 text-center font-body text-[11px] leading-relaxed text-ink-soft">
                  Search an ISBN and the cover appears here
                </p>
              </div>
            )}
          </div>

          <div className="absolute -bottom-10 -right-2 w-[56%] min-w-[13rem]" style={{ transform: "rotate(2deg)" }}>
            {found || rating || note ? (
              <BookNote
                title={found?.title ?? "Untitled"}
                rating={rating}
                note={note || "Add a note and it shows up here."}
                dateRange={found?.publishedYear ? `Published ${found.publishedYear}` : "Not yet shelved"}
                paper={paper}
                className="w-full rounded-[2px]"
              />
            ) : (
              // skeleton note — shows the shape of what's coming
              <div className="grain-overlay w-full rounded-[2px] p-4 shadow-token-lg" style={{ background: paper?.background ?? "var(--brand-blush)" }}>
                <div className="relative z-10 flex flex-col gap-2.5 opacity-30">
                  <div className="h-3 w-2/3 rounded-full bg-current" />
                  <div className="flex gap-1">
                    {STARS.map((s) => (
                      <div key={s} className="h-3 w-3 rounded-sm bg-current" />
                    ))}
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-current" />
                  <div className="h-2 w-5/6 rounded-full bg-current" />
                  <div className="h-2 w-1/2 rounded-full bg-current" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — the form */}
        <div className="glass-strong w-full rounded-token-lg p-6 sm:p-8">
          <h2 className={label}>Add new book</h2>

          <div className="mt-6 flex flex-col gap-2">
            <label className={label} htmlFor="add-isbn">ISBN</label>
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <input
                  id="add-isbn"
                  value={isbn}
                  onChange={(e) => {
                    setIsbn(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
                  inputMode="numeric"
                  placeholder="978…"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "add-isbn-error" : undefined}
                  className="w-full rounded-full border border-border bg-surface-raised/70 py-3 pl-5 pr-11 font-body text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none"
                />
                <QrCode
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
              <button
                type="button"
                onClick={search}
                disabled={searching || !isbn.trim()}
                className="flex shrink-0 items-center gap-2 rounded-full bg-paper px-5 py-3 font-body text-sm font-medium text-[#2b2419] transition-all hover:brightness-105 disabled:opacity-40"
              >
                {searching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {searching ? "Searching" : "Search"}
              </button>
            </div>

            {error && (
              <p id="add-isbn-error" role="alert" className="font-body text-xs text-[#e9a49d]">
                {error}
              </p>
            )}
            {found && (
              <p className="font-body text-xs text-ink-muted">
                Found <span className="text-ink">{found.title}</span> · {found.author}
                {found.dewey === null && " · no Dewey class from the catalogue"}
              </p>
            )}
          </div>

          {found && (
            <div className="mt-6 flex flex-col gap-2">
              <label className={label} htmlFor="add-dewey">
                Dewey number
              </label>
              <input
                id="add-dewey"
                value={dewey}
                onChange={(e) => setDewey(e.target.value)}
                inputMode="decimal"
                aria-invalid={!deweyValid}
                aria-describedby={!deweyValid ? "add-dewey-error" : "add-dewey-hint"}
                className="w-full max-w-[10rem] rounded-full border border-border bg-surface-raised/70 px-5 py-2.5 font-body text-sm tabular-nums text-ink focus:border-accent focus:outline-none"
              />
              {deweyValid ? (
                <p id="add-dewey-hint" className="font-body text-[11px] text-ink-soft">
                  Shelves under {deweyClassFor(deweyNumber).code.toString().padStart(3, "0")}{" "}
                  {deweyClassFor(deweyNumber).label}
                  {found.dewey === null && " — no class came back, so this is a guess you can change"}
                </p>
              ) : (
                <p id="add-dewey-error" role="alert" className="font-body text-[11px] text-[#e9a49d]">
                  Use a number between 0 and 999.99.
                </p>
              )}
            </div>
          )}

          <div className="mt-7 flex flex-col gap-2">
            <span className={label}>Do you own it?</span>
            <div className="flex gap-2">
              {[
                { value: true, text: "Owned" },
                { value: false, text: "Not owned" },
              ].map((option) => (
                <button
                  key={option.text}
                  type="button"
                  onClick={() => setOwned(option.value)}
                  aria-pressed={owned === option.value}
                  className={`rounded-full border px-4 py-2 font-body text-xs transition-colors ${
                    owned === option.value
                      ? "border-accent bg-accent/20 text-ink"
                      : "border-border text-ink-muted hover:text-ink"
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>

          {/* status is only meaningful for a book you actually have */}
          {owned && (
            <div className="mt-6 flex flex-col gap-2">
              <span className={label}>Status</span>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    aria-pressed={status === s}
                    className={`rounded-full border px-4 py-2 font-body text-xs transition-colors ${
                      status === s
                        ? "border-accent bg-accent/20 text-ink"
                        : "border-border text-ink-muted hover:text-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <fieldset className="mt-7 flex flex-col gap-2">
            <legend className={label}>Rating</legend>
            <div className="flex gap-1.5">
              {STARS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? 0 : n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  aria-pressed={rating === n}
                  className={`text-2xl leading-none transition-all duration-150 hover:scale-110 ${
                    n <= rating ? "text-[#e8a13a]" : "text-ink-soft opacity-35 hover:opacity-60"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-7 flex flex-col gap-2">
            <label className={label} htmlFor="add-note">Note</label>
            <textarea
              id="add-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="What did you think of it?"
              className="w-full resize-y rounded-token-lg border border-border bg-surface-raised/70 p-4 font-body text-sm leading-relaxed text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none"
            />
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="font-body text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="rounded-full bg-accent px-7 py-3 font-body text-sm font-medium text-bg shadow-token-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add book
            </button>
          </div>

          {!found && (
            <p className="mt-3 text-right font-body text-[11px] text-ink-soft">
              Search an ISBN first — that&apos;s what fetches the cover and shelf class.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

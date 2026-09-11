"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode, Loader2, BookOpen, ChevronDown, X } from "lucide-react";
import type { Book, BookStatus } from "@/lib/types";
import type { PaperTreatment } from "@/lib/theme/themes";
import type { BookLookupResult } from "@/lib/books/providers";
import { BookNote } from "@/components/book/BookNote";
import { Book3D } from "@/components/book/Book3D";
import { deweyClassFor, DEWEY_CLASSES, formatClassCode } from "@/lib/library/dewey";
import { extractSpineColor, extractPalette } from "@/lib/books/dominant-color";
import { SpineColorPicker } from "@/components/book/SpineColorPicker";
import { spineColorFor } from "@/lib/spine-color";
import { ThemedFrame } from "@/components/theme/ThemedFrame";
import { BarcodeScanner } from "./BarcodeScanner";
import type { LibraryShelf } from "@/lib/library/shelves";
import type { ThemeId } from "@/lib/types";

export type BookDraft = Omit<Book, "id" | "order" | "slotId">;

interface BookEditorScreenProps {
  /** "add" collects a new book; "edit" revises one already on a shelf */
  mode: "add" | "edit";
  /** the book being revised — required in edit mode */
  book?: Book;
  /**
   * Ownership comes from the bookshelf the book is going to, not from a
   * field of its own: the two shelves in a room hold separate collections, so
   * naming the destination already answers the question.
   */
  owned: boolean;
  /**
   * Adding from the room has no shelf context, so the destination is picked
   * here. Omitted in edit mode and wherever the shelf is already implied.
   */
  destination?: {
    shelves: LibraryShelf[];
    value: string;
    onChange: (shelfId: string) => void;
  };
  /**
   * Answers "is this ISBN already on a shelf?" with the shelf's name, so the
   * editor can refuse a duplicate before it is added. The library owns the
   * collection, so it owns the answer; the editor only reports it.
   */
  duplicateShelf?: (isbn: string) => string | null;
  /**
   * Set when the destination shelf has no room left, with the sentence to
   * show. The library counts its own shelves; the editor only reports it and
   * refuses to submit.
   */
  shelfFull?: string | null;
  /** which room this is being filled in, so the card can wear its materials */
  themeId: ThemeId;
  paper?: PaperTreatment;
  onCancel: () => void;
  /** the finished book, plus where its cover sat so it can fly to the shelf */
  onSubmit: (draft: BookDraft, coverRect: DOMRect | null) => void;
  onRemove?: () => void;
}

/** hyphens and spacing are how people write an ISBN, not part of it */
export function normalizeIsbn(value: string): string {
  return value.replace(/[^0-9Xx]/g, "").toUpperCase();
}

const STARS = [1, 2, 3, 4, 5];
const STATUSES: BookStatus[] = ["New", "Ongoing", "Done", "Dropped"];
/** long enough for a real thought, short enough to stay a note */
const NOTE_LIMIT = 1000;

/**
 * ONE editor for both adding and revising a book, so the two can't drift
 * apart on which fields they offer. Mode only changes the verbs (Add book vs
 * Save), whether Remove is present, and whether the fields start empty.
 *
 * Every field is editable in both modes — an ISBN search fills them in, but a
 * book with no barcode, or a bad catalogue record, can still be typed by hand.
 */
export function BookEditorScreen({
  mode,
  book,
  owned,
  destination,
  duplicateShelf,
  shelfFull,
  themeId,
  paper,
  onCancel,
  onSubmit,
  onRemove,
}: BookEditorScreenProps) {
  const [isbn, setIsbn] = useState(book?.isbn ?? "");
  const [title, setTitle] = useState(book?.title ?? "");
  const [author, setAuthor] = useState(book?.author ?? "");
  const [dewey, setDewey] = useState(book?.dewey ?? 800);
  const [startedAt, setStartedAt] = useState(book?.startedAt ?? "");
  const [finishedAt, setFinishedAt] = useState(book?.finishedAt ?? "");
  const [status, setStatus] = useState<BookStatus>(book?.status ?? "New");
  const [rating, setRating] = useState(book?.rating ?? 0);
  const [note, setNote] = useState((book?.note ?? "").slice(0, NOTE_LIMIT));
  const [coverUrl, setCoverUrl] = useState(book?.coverUrl ?? "");
  const [pageCount, setPageCount] = useState<number | null>(null);
  /** dominant cover colour, read once when the cover arrives and stored on the book */
  const [palette, setPalette] = useState<string[]>([]);
  const [spine, setSpine] = useState<{ bg: string; band: string } | null>(
    book?.spineBg && book?.spineBand ? { bg: book.spineBg, band: book.spineBand } : null
  );
  const [publishedYear, setPublishedYear] = useState<number | null>(null);

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [scanning, setScanning] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  // Book3D takes a height in px rather than a CSS size, so shrinking it for
  // small screens needs a breakpoint check rather than a Tailwind class
  const [compactPreview, setCompactPreview] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setCompactPreview(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCompactPreview(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /**
   * The same book twice is almost always a mis-scan rather than an intent, so
   * a matching ISBN blocks both the lookup and the save, and says where the
   * copy already is.
   */
  const duplicateIn = isbn.trim() ? duplicateShelf?.(isbn) ?? null : null;
  const isbnError = duplicateIn
    ? `You already have this book added in ${duplicateIn}.`
    : error;

  const canSubmit = title.trim().length > 0 && !duplicateIn && !shelfFull;
  /**
   * Reading progress belongs to books you have. A title on the wishlist has
   * no status, no reading dates and no verdict to record — you can't rate a
   * book you haven't got yet — so those groups are absent rather than
   * present and meaningless.
   */
  const progressApplies = owned;
  const datesApply = progressApplies && status !== "Dropped";
  /** a book still being read has no finish date to give, so the field goes away */
  const finishApplies = datesApply && status !== "Ongoing";
  const datesOutOfOrder = Boolean(
    finishApplies && startedAt && finishedAt && finishedAt < startedAt
  );

  const today = () => new Date().toISOString().slice(0, 10);

  /**
   * Reading dates follow the status rather than making the reader keep them
   * in sync by hand: starting a book stamps a start date, finishing one
   * stamps an end date, and dropping a book clears both — a book you
   * abandoned has no reading period to record.
   */
  function changeStatus(next: BookStatus) {
    setStatus(next);
    if (next === "Dropped") {
      setStartedAt("");
      setFinishedAt("");
      return;
    }
    if (next === "Ongoing") {
      if (!startedAt) setStartedAt(today());
      // still reading: the reading period is open-ended
      setFinishedAt("");
    }
    if (next === "Done") {
      if (!startedAt) setStartedAt(today());
      if (!finishedAt) setFinishedAt(today());
    }
    if (next === "New") setFinishedAt("");
  }

  async function search() {
    if (!isbn.trim() || searching || duplicateIn) return;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/books/lookup?isbn=${encodeURIComponent(isbn)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't find that book.");
        return;
      }
      const result = data as BookLookupResult;
      setTitle(result.title);
      setAuthor(result.author);
      setCoverUrl(result.coverUrl ?? "");
      // the spine takes its colour from the jacket
      if (result.coverUrl) {
        setSpine(await extractSpineColor(result.coverUrl));
        setPalette(await extractPalette(result.coverUrl));
      } else {
        setSpine(null);
        setPalette([]);
      }
      setPageCount(result.pageCount);
      setPublishedYear(result.publishedYear);
      // an unclassified book goes to 800s Literature, the likeliest home in a
      // personal collection — the field stays editable either way
      setDewey(result.dewey ?? 800);
    } catch {
      setError("Couldn't reach the book service. Check your connection.");
    } finally {
      setSearching(false);
    }
  }

  function submit() {
    if (!canSubmit || datesOutOfOrder) return;
    const thickness = pageCount
      ? Math.min(40, Math.max(12, Math.round(pageCount / 12)))
      : book?.dimensions.thicknessMm ?? 20;

    onSubmit(
      {
        ...(book ?? {}),
        isbn: isbn.trim() || undefined,
        title: title.trim(),
        author: author.trim(),
        coverUrl,
        spineBg: spine?.bg,
        spineBand: spine?.band,
        dewey,
        dimensions: book?.dimensions ?? { heightMm: 198, widthMm: 129, thicknessMm: thickness },
        rating: rating || undefined,
        note: note.trim() || undefined,
        tags: book?.tags ?? [],
        owned,
        // status only means something for a book you own
        status: owned ? status : undefined,
        startedAt: datesApply && startedAt ? startedAt : undefined,
        finishedAt: finishApplies && finishedAt ? finishedAt : undefined,
        addedAt: book?.addedAt ?? new Date().toISOString(),
      },
      coverRef.current?.getBoundingClientRect() ?? null
    );
  }

  const label = "text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted";
  // the form is written in the room's own hand, same as its notes
  const themeType: React.CSSProperties = { fontFamily: paper?.fontBody };
  const textField =
    "w-full rounded-token-lg border border-border bg-surface-raised/70 px-5 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none";
  // the browser's own calendar glyph is a different icon in every engine and
  // fights the theme; the field opens its picker on click instead.
  // Width is the grid track's, never the control's own: Safari gives
  // `input[type=date]` a much wider intrinsic size than Chromium and won't
  // shrink below it, so a fixed width there overflows into the next field.
  const dateField = `${textField} min-w-0 [&::-webkit-calendar-picker-indicator]:hidden`;
  const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
    const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
    el.showPicker?.();
  };
  const pill = (active: boolean) =>
    `rounded-full border px-4 py-2 font-body text-xs transition-colors ${
      active ? "border-accent bg-accent/20 text-ink" : "border-border text-ink-muted hover:text-ink"
    }`;

  return (
    <div className="animate-shelf-in absolute inset-0 z-[60] overflow-y-auto overflow-x-hidden bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto grid min-h-full w-full max-w-5xl grid-cols-1 items-center gap-12 px-6 pb-10 pt-12 lg:grid-cols-[0.9fr_1fr] lg:gap-16 lg:px-10">
        {/* LEFT — the book as it will look on the shelf, filling in as you go.
            Comes second on small screens: the form is what you're here to
            fill in, the preview is a payoff you scroll to. */}
        <div className="relative order-2 mx-auto w-full max-w-[260px] sm:max-w-sm lg:order-1 lg:mx-0">
          <div
            className="pointer-events-none absolute -inset-16 -z-10"
            style={{
              background:
                "radial-gradient(60% 55% at 45% 40%, rgb(var(--color-accent-soft-rgb) / 0.20), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="flex items-start gap-4">
            <SpineColorPicker
              value={spine?.bg ?? spineColorFor({ title: title || "Untitled" }).bg}
              palette={palette}
              onChange={(bg, band) => setSpine({ bg, band })}
            />

            <div ref={coverRef} className="flex-1">
            {title ? (
              <Book3D
                key={coverUrl || title}
                book={
                  {
                    title,
                    author,
                    coverUrl,
                    spineBg: spine?.bg,
                    spineBand: spine?.band,
                    dimensions: {
                      heightMm: 198,
                      widthMm: 129,
                      thicknessMm: pageCount ? Math.min(40, Math.max(12, Math.round(pageCount / 12))) : 22,
                    },
                  } as Book
                }
                height={compactPreview ? 264 : 330}
                className="animate-book-settle"
              />
            ) : (
              <div className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-3 rounded-token border border-dashed border-border bg-surface/60">
                <BookOpen className="h-8 w-8 text-ink-soft" strokeWidth={1.25} />
                <p className="px-6 text-center text-[11px] leading-relaxed text-ink-soft">
                  Search an ISBN and the book appears here
                </p>
              </div>
              )}
            </div>
          </div>

          {/* below the book in normal flow on small screens — no overlap, no
              hidden height to account for. From sm up it overlaps the book's
              corner at an angle, the original card-on-a-shelf look. */}
          <div className="relative mt-5 w-full rotate-0 sm:absolute sm:-bottom-10 sm:-right-2 sm:mt-0 sm:w-[56%] sm:min-w-[13rem] sm:max-w-[calc(100%-1rem)] sm:rotate-[2deg]">
            {title || rating || note ? (
              <BookNote
                title={title || "Untitled"}
                author={author || "Unknown author"}
                rating={rating}
                note={note || "Add a note and it shows up here."}
                finishedAt={finishApplies ? finishedAt || undefined : undefined}
                startedAt={startedAt || undefined}
                ongoing={status === "Ongoing"}
                paper={paper}
                className="w-full rounded-[2px]"
              />
            ) : (
              // the same note stock, before anything has been written on it
              <BookNote
                title=""
                author=""
                rating={0}
                note=""
                paper={paper}
                className="w-full rounded-[2px] opacity-70"
              />
            )}
          </div>
        </div>

        {/* RIGHT — the form. Identical field set in both modes. First on
            small screens; sits to the right of the preview from lg up. */}
        <ThemedFrame themeId={themeId} className="order-1 w-full shadow-token-lg lg:order-2">
        <div className="w-full rounded-token-lg px-6 pb-5 pt-5 sm:px-7 sm:pb-5 sm:pt-6" style={themeType}>
          <div className="flex items-start justify-between gap-4">
            <h2
              className="text-[13px] font-semibold uppercase tracking-[0.16em] text-ink"
              style={{ fontFamily: paper?.fontDisplay, letterSpacing: paper?.displayTracking }}
            >
              {mode === "add" ? "Add new book" : "Edit book"}
            </h2>
            {/* the way out, in the corner it is looked for: Cancel sits at the
                very bottom of a card taller than a phone viewport */}
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close without saving"
              title="Close"
              className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          {destination && destination.shelves.length > 1 && (
            <div className="mt-6 flex flex-col gap-2">
              <span className={label}>Shelf</span>
              <div className="flex flex-wrap gap-2">
                {destination.shelves.map((shelf) => (
                  <button
                    key={shelf.id}
                    type="button"
                    onClick={() => destination.onChange(shelf.id)}
                    aria-pressed={destination.value === shelf.id}
                    className={pill(destination.value === shelf.id)}
                  >
                    {/* the wishlist shelf says so in its own name, which is
                        shorter than explaining it underneath */}
                    {shelf.ownership === "owned" ? shelf.label : `${shelf.label} (unowned)`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {shelfFull && (
            <p role="alert" className="mt-4 font-body text-xs text-[#e9a49d]">
              {shelfFull}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <label className={label} htmlFor="book-isbn">ISBN</label>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[8rem] flex-1">
                <input
                  id="book-isbn"
                  value={isbn}
                  onChange={(e) => {
                    setIsbn(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
                  inputMode="numeric"
                  placeholder="978…"
                  aria-invalid={isbnError ? true : undefined}
                  aria-describedby={isbnError ? "book-isbn-error" : undefined}
                  className={`${textField} pr-4 sm:pr-11`}
                />
                {/* the barcode on the back of the book, read by the camera
                    rather than typed off it. Hidden on small screens for now —
                    camera-permission handling there still needs work. */}
                <button
                  type="button"
                  onClick={() => setScanning(true)}
                  aria-label="Scan the barcode with your camera"
                  title="Scan the barcode"
                  className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-token p-1.5 text-ink-soft transition-colors hover:bg-surface hover:text-ink sm:block"
                >
                  <QrCode className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              <button
                type="button"
                onClick={search}
                disabled={searching || !isbn.trim() || Boolean(duplicateIn)}
                className="flex shrink-0 items-center gap-2 rounded-token-lg bg-accent px-5 py-2.5 font-body text-sm font-medium text-bg transition-all hover:brightness-110 disabled:opacity-40"
              >
                {searching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {searching ? "Searching" : "Search"}
              </button>
            </div>
            {isbnError && (
              <p id="book-isbn-error" role="alert" className="font-body text-xs text-[#e9a49d]">
                {isbnError}
              </p>
            )}
          </div>

          {title && (
            <p className="mt-3 font-body text-xs text-ink-muted">
              <span className="text-ink">{title}</span> · shelves under{" "}
              <label className="sr-only" htmlFor="book-dewey-class">
                Shelf category
              </label>
              {/* the lookup's own number (813.54) is what prints on the book's
                  spine; picking a class here only sets which shelf it's on —
                  a book Open Library has no classification for lands at the
                  800 default with no way to move it otherwise */}
              <span className="relative inline-flex items-center align-middle">
                <select
                  id="book-dewey-class"
                  value={deweyClassFor(dewey).code}
                  onChange={(e) => setDewey(Number(e.target.value))}
                  className="cursor-pointer appearance-none border-0 border-b border-dotted border-accent/60 bg-transparent py-0 pl-0 pr-4 font-body text-xs font-medium text-accent underline-offset-2 focus:outline-none"
                >
                  {DEWEY_CLASSES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-surface text-ink">
                      {formatClassCode(c.code)} {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 h-3 w-3 text-accent" strokeWidth={2} />
              </span>
            </p>
          )}

          {progressApplies && (
            <div className="mt-6 flex flex-col gap-2">
              <span className={label}>Status</span>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button key={s} type="button" onClick={() => changeStatus(s)} aria-pressed={status === s} className={pill(status === s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {datesApply && (
            <div className="mt-6 grid max-w-sm grid-cols-2 gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <label className={label} htmlFor="book-started">Started</label>
                <input
                  id="book-started"
                  type="date"
                  value={startedAt}
                  max={today()}
                  onClick={openPicker}
                  onChange={(e) => setStartedAt(e.target.value)}
                  className={dateField}
                />
              </div>
              {finishApplies ? (
                <div className="flex min-w-0 flex-col gap-2">
                  <label className={label} htmlFor="book-finished">Finished</label>
                  <input
                    id="book-finished"
                    type="date"
                    value={finishedAt}
                    max={today()}
                    onClick={openPicker}
                    onChange={(e) => setFinishedAt(e.target.value)}
                    aria-invalid={datesOutOfOrder}
                    aria-describedby={datesOutOfOrder ? "book-dates-error" : undefined}
                    className={dateField}
                  />
                </div>
              ) : (
                // a book still being read has an open end: the field's place is
                // held by what the note will actually say
                <div className="flex min-w-0 flex-col gap-2">
                  <span className={label}>Finished</span>
                  <span className="py-2.5 font-body text-sm text-ink-muted">- Present</span>
                </div>
              )}
              {datesOutOfOrder && (
                <p id="book-dates-error" role="alert" className="col-span-2 font-body text-[11px] text-[#e9a49d]">
                  The finish date is before the start date.
                </p>
              )}
            </div>
          )}

          {progressApplies && (
          <fieldset className="mt-6 flex flex-col gap-2">
            <legend className={label}>Rating</legend>
            <div className="flex gap-1.5">
              {STARS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? 0 : n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  aria-pressed={rating === n}
                  className={`${
                    themeId === "minecraft" ? "text-4xl" : "text-2xl"
                  } leading-none transition-all duration-150 hover:scale-110 ${
                    n <= rating ? "text-[#e8a13a]" : "text-ink-soft opacity-35 hover:opacity-60"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <label className={label} htmlFor="book-note">Note</label>
              <span
                className={`text-[11px] tabular-nums ${
                  note.length >= NOTE_LIMIT ? "text-[#e9a49d]" : "text-ink-soft"
                }`}
              >
                {note.length}/{NOTE_LIMIT}
              </span>
            </div>
            <textarea
              id="book-note"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, NOTE_LIMIT))}
              maxLength={NOTE_LIMIT}
              rows={5}
              placeholder="What did you think of it?"
              className="max-h-56 w-full resize-y overflow-y-auto rounded-token-lg border border-border bg-surface-raised/70 p-4 text-sm leading-relaxed text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none [overflow-wrap:anywhere]"
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            {mode === "edit" && onRemove ? (
              confirmRemove ? (
                <span className="flex items-center gap-2">
                  <button type="button" onClick={onRemove} className="rounded-token-lg bg-[#8d3a32] px-4 py-2 font-body text-xs text-white">
                    Remove for good
                  </button>
                  <button type="button" onClick={() => setConfirmRemove(false)} className="font-body text-xs text-ink-muted hover:text-ink">
                    Keep
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmRemove(true)} className="font-body text-sm text-[#c8776e] hover:underline">
                  Remove
                </button>
              )
            ) : (
              <span />
            )}

            <span className="flex items-center gap-4">
              <button type="button" onClick={onCancel} className="font-body text-sm text-ink-muted transition-colors hover:text-ink">
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit || datesOutOfOrder}
                className="rounded-token-lg bg-accent px-7 py-3 font-body text-sm font-medium text-bg shadow-token-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {mode === "add" ? "Add book" : "Save"}
              </button>
            </span>
          </div>

        </div>
        </ThemedFrame>
      </div>

      {scanning && (
        <BarcodeScanner
          onClose={() => setScanning(false)}
          onDetected={(code) => {
            setScanning(false);
            setIsbn(code);
            setError(null);
          }}
        />
      )}
    </div>
  );
}

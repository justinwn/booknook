"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLibraryTheme } from "@/lib/theme/theme-context";
import { ROOM_SLOT_MAPS, getRoomSlots } from "@/lib/library/slot-maps";
import { loadBooks, saveBooks } from "@/lib/profile/library-store";
import { pullLibrary, pushLibrary } from "@/lib/sync/library-sync";
import { hasThemePreference } from "@/lib/profile/theme-preference";
import type { Book } from "@/lib/types";
import { Wallpaper } from "@/components/library/Wallpaper";
import { ShelfHotspots } from "@/components/library/ShelfHotspots";
import { RoomScene } from "@/components/library/RoomScene";
import { MobileControls } from "@/components/library/MobileControls";
import { ControlRail, type ControlId } from "@/components/library/ControlRail";
import { BookEditorScreen, normalizeIsbn, type BookDraft } from "@/components/library/BookEditorScreen";
import { FlyingBook } from "@/components/book/FlyingBook";
import { SoundPanel } from "@/components/library/SoundPanel";
import { AmbientEngine } from "@/components/library/AmbientEngine";
import {
  loadAmbient,
  saveAmbient,
  type AmbientSettings,
  type AmbientTrackId,
  type AmbientTrackSetting,
} from "@/lib/audio/ambient";
import { RemindersPanel } from "@/components/library/RemindersPanel";
import { RoomClock } from "@/components/library/RoomClock";
import { RoomQuote } from "@/components/library/RoomQuote";
import { WellnessSprite } from "@/components/library/WellnessSprite";
import { ShelfDetail } from "@/components/library/ShelfDetail";
import { deweyClassFor } from "@/lib/library/dewey";
import { getShelves } from "@/lib/library/shelves";
import { MadeBy } from "@/components/brand/MadeBy";
import type { NudgeKind } from "@/lib/profile/wellness-store";

export default function LibraryPage() {
  const router = useRouter();
  const { themeId, theme } = useLibraryTheme();

  const slots = useMemo(() => getRoomSlots(themeId), [themeId]);
  const shelves = useMemo(() => getShelves(theme), [theme]);
  const room = ROOM_SLOT_MAPS[themeId];

  /** The shelves hold exactly what the reader has added — nothing is seeded. */
  const [books, setBooks] = useState<Book[]>([]);
  const [loaded, setLoaded] = useState(false);

  /**
   * The picker is part of setting an account up, not part of arriving. Anyone
   * who has chosen a room stays here; anyone who never has is sent to choose
   * one, which covers a first Google sign-in that came through the sign-in
   * button rather than sign-up. `replace`, so Back does not bounce them
   * between the two.
   */
  useEffect(() => {
    let active = true;
    hasThemePreference().then((chosen) => {
      if (active && !chosen) router.replace("/onboarding/theme");
    });
    return () => {
      active = false;
    };
  }, [router]);

  /**
   * The browser copy paints first so the shelves are never empty while a
   * request is in flight, then the account's copy replaces it. The remote is
   * authoritative when it exists: it is the one that followed you here from
   * another device.
   */
  useEffect(() => {
    setBooks(loadBooks() ?? []);
    setLoaded(true);
    let active = true;
    pullLibrary().then((doc) => {
      if (active && doc?.books) setBooks(doc.books);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveBooks(books);
    pushLibrary({ books });
  }, [books, loaded]);

  /**
   * The collection belongs to the reader; slot assignment belongs to the
   * room. Rooms have different shelf geometry, so when the mood changes the
   * books are re-seated in `order` sequence onto the new room's slots rather
   * than keeping ids that don't exist there.
   */
  useEffect(() => {
    const bookSlots = slots.filter((s) => s.kind === "book");
    setBooks((prev) =>
      [...prev]
        .sort((a, b) => a.order - b.order)
        .map((book, i) => (bookSlots[i] ? { ...book, slotId: bookSlots[i].id } : book))
        .filter((book, i) => Boolean(bookSlots[i]))
    );
  }, [slots]);

  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<ControlId | null>(null);

  /** a new account has nothing to look at yet; the glow ends with the first book */
  const firstRun = loaded && books.length === 0;

  /** a nudge fired from the settings panel's Test button, timers untouched */
  const [previewNudge, setPreviewNudge] = useState<NudgeKind | null>(null);

  /**
   * The ambient mix. Held here rather than in the panel so the room keeps its
   * sound with the panel closed, and written back on every change.
   */
  const [ambient, setAmbient] = useState<AmbientSettings | null>(null);
  useEffect(() => setAmbient(loadAmbient(themeId)), [themeId]);

  function changeAmbient(id: AmbientTrackId, next: AmbientTrackSetting) {
    setAmbient((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [id]: next };
      saveAmbient(themeId, updated);
      return updated;
    });
  }

  /**
   * Room → shelf transition. `zoom` holds the origin point (in room
   * percentage coordinates) so the room scales *toward the shelf that was
   * clicked* rather than the centre of the screen — that's what makes it
   * read as moving closer to a specific shelf instead of a generic zoom.
   */
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [focusClass, setFocusClass] = useState<number | null>(null);
  /** which of the room's two bookshelves is open */
  const [activeShelfId, setActiveShelfId] = useState<string>("");
  /**
   * Where a new book is headed. Adding from inside a shelf inherits that
   * shelf; adding from the room has no context, so the editor asks.
   */
  const [addShelfId, setAddShelfId] = useState<string>("");
  /** a freshly added book, mid-flight to its place on the shelf */
  const [flight, setFlight] = useState<{ book: Book; from: DOMRect } | null>(null);
  /** the book currently open in the editor; null means the editor is closed */
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  /**
   * The same ISBN twice is a mis-scan, not a second copy, so the editor asks
   * here before it lets one through. Returns the shelf the existing copy is
   * on, which is the only useful thing to say about it.
   */
  function duplicateShelf(isbn: string, ignoreBookId?: string): string | null {
    const wanted = normalizeIsbn(isbn);
    if (!wanted) return null;
    const match = books.find(
      (b) => b.id !== ignoreBookId && b.isbn && normalizeIsbn(b.isbn) === wanted
    );
    if (!match) return null;
    // a book belongs to a shelf by ownership, not by id, so the name comes
    // from whichever of the room's two shelves holds that side
    return shelves.find((s) => (s.ownership === "owned") === match.owned)?.label ?? "your library";
  }

  function openShelf(shelfId: string, center: { x: number; y: number }) {
    setActiveShelfId(shelfId);
    const shelf = shelves.find((s) => s.id === shelfId);
    const first = books.find((b) => b.owned === (shelf?.ownership === "owned"));
    setFocusClass(first ? deweyClassFor(first.dewey).code : null);
    setZoom(center);
    // let the room travel for a beat before the shelves take over
    window.setTimeout(() => setShelfOpen(true), 520);
  }

  function closeShelf() {
    setShelfOpen(false);
    window.setTimeout(() => setZoom(null), 60);
  }

  function handleControl(id: ControlId) {
    if (id === "theme") {
      router.push("/onboarding/theme");
      return;
    }
    if (id === "profile") {
      router.push("/profile");
      return;
    }
    if (id === "add") setAddShelfId(activeShelfId || shelves[0]?.id || "");
    setOpenPanel((current) => (current === id ? null : id));
  }

  function handleSaveEdit(draft: BookDraft) {
    if (!editingBook) return;
    setBooks((prev) => prev.map((b) => (b.id === editingBook.id ? { ...b, ...draft } : b)));
    setEditingBook(null);
  }

  function handleRemoveBook(id: string) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setEditingBook(null);
  }

  /**
   * Empties the shelf that is open. The two shelves in a room hold separate
   * collections, so clearing the owned shelf leaves the wishlist alone.
   */
  function handleClearShelf() {
    const owned = (shelves.find((s) => s.id === activeShelfId) ?? shelves[0])?.ownership === "owned";
    setBooks((prev) => prev.filter((b) => b.owned !== owned));
  }

  function handleAddBook(draft: BookDraft, coverRect: DOMRect | null) {
    const occupied = new Set(books.map((b) => b.slotId));
    const slot = slots.find((s) => s.kind === "book" && !occupied.has(s.id));
    const book: Book = { ...draft, id: `added-${Date.now()}`, order: books.length, slotId: slot?.id ?? "" };

    setBooks((prev) => [...prev, book]);
    setOpenPanel(null);

    // open the shelves at the class this book belongs to, so the flight has
    // somewhere real to land — and on the shelf it was actually sent to,
    // which is not necessarily the one that was open
    const target = shelves.find((s) => (s.ownership === "owned") === book.owned);
    if (target) setActiveShelfId(target.id);
    setFocusClass(deweyClassFor(book.dewey).code);
    if (!shelfOpen) {
      setZoom({ x: 50, y: 45 });
      setShelfOpen(true);
    }

    if (coverRect) setFlight({ book, from: coverRect });
  }

  return (
    <div data-theme={themeId} className="relative min-h-screen overflow-hidden bg-bg">
      <RoomScene hotspots={theme.shelfHotspots} zoomed={Boolean(zoom)}>
        <div
          className="absolute inset-0 transition-transform duration-[900ms] ease-gentle motion-reduce:transition-none"
          style={{
            transform: zoom ? "scale(2.1)" : "scale(1)",
            transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%",
          }}
        >
          <Wallpaper src={theme.wallpaper} poster={theme.poster} scrim={theme.isLight ? "light" : "none"} />

          {/*
            The room shows the scene, not the collection: books live on the
            shelves you open, and painting spines over a moving wallpaper only
            fought the artwork. Every bookshelf in the scene is a way in.
          */}
          <ShelfHotspots hotspots={theme.shelfHotspots} onOpen={openShelf} />
        </div>
      </RoomScene>

      {/* a light wash only where the wordmark sits, so the room stays undimmed */}
      {/* a wash along the bottom, where the clock and sprite now live */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/55 to-transparent" />

      {/* top-left: a line from a book, changing once a day. On a phone the
          right-hand corner belongs to the controls, so this keeps clear of it */}
      <div className="pointer-events-none fixed left-4 top-4 z-20 max-w-[60%] sm:left-10 sm:top-8 sm:max-w-none lg:left-14 lg:top-14">
        <RoomQuote paper={theme.paper} titles={books.map((b) => b.title)} />
      </div>

      {/* a wash behind it, the same trick the bottom of the room uses */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />

      {/* bottom-left: the clock, with the companion walking along the top of it */}
      <div className="pointer-events-none fixed bottom-8 left-1/2 z-20 -translate-x-1/2 text-center sm:left-10 sm:translate-x-0 sm:text-left lg:bottom-14 lg:left-14">
        <WellnessSprite
          themeId={themeId}
          paper={theme.paper}
          onOpenSettings={() => setOpenPanel("reminders")}
          previewNudge={previewNudge}
          onPreviewEnd={() => setPreviewNudge(null)}
        />
        <RoomClock paper={theme.paper} />
      </div>

      {shelfOpen && (
        <ShelfDetail
          books={books}
          paper={theme.paper}
          shelving={theme.shelving}
          shelves={shelves}
          activeShelfId={activeShelfId || shelves[0]?.id}
          onShelfChange={setActiveShelfId}
          focusClass={focusClass}
          onEditBook={(book) => setEditingBook(book)}
          onClose={closeShelf}
          onAddBook={() => {
            setAddShelfId(activeShelfId || shelves[0]?.id || "");
            setShelfOpen(false);
            setOpenPanel("add");
          }}
          onClearShelf={handleClearShelf}
          arrivingBookId={flight?.book.id ?? null}
        />
      )}

      {flight && (
        <FlyingBook
          book={flight.book}
          from={flight.from}
          resolveTarget={() =>
            document.querySelector(`[data-book-id="${flight.book.id}"]`)?.getBoundingClientRect() ?? null
          }
          onLanded={() => setFlight(null)}
        />
      )}

      {ambient && <AmbientEngine settings={ambient} />}

      {/* nothing on the shelves yet: point at the one thing worth doing */}
      <ControlRail active={openPanel} onSelect={handleControl} beckonAdd={firstRun} />
      <MobileControls active={openPanel} onSelect={handleControl} beckonAdd={firstRun} />

      <footer className="pointer-events-none fixed inset-x-0 bottom-3 z-20 text-center">
        <MadeBy
          className="pointer-events-auto text-[10px] text-white/45 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]"
          linkClassName="text-white/60"
        />
      </footer>

      {/* one editor, two modes — add and edit can't drift apart on fields */}
      {openPanel === "add" && (
        <BookEditorScreen
          mode="add"
          themeId={themeId}
          owned={(shelves.find((s) => s.id === addShelfId) ?? shelves[0])?.ownership === "owned"}
          destination={{ shelves, value: addShelfId || shelves[0]?.id || "", onChange: setAddShelfId }}
          duplicateShelf={(isbn) => duplicateShelf(isbn)}
          paper={theme.paper}
          onCancel={() => setOpenPanel(null)}
          onSubmit={handleAddBook}
        />
      )}

      {editingBook && (
        <BookEditorScreen
          mode="edit"
          themeId={themeId}
          owned={editingBook.owned}
          book={editingBook}
          duplicateShelf={(isbn) => duplicateShelf(isbn, editingBook.id)}
          paper={theme.paper}
          onCancel={() => setEditingBook(null)}
          onSubmit={handleSaveEdit}
          onRemove={() => handleRemoveBook(editingBook.id)}
        />
      )}

      {/* the rail sits 56px off the right edge and its discs are 86px wide, so
          it ends at 142px: the panel stands off at 184px, leaving a clear 42px
          channel between the two rather than crowding the discs */}
      {openPanel && openPanel !== "profile" && openPanel !== "theme" && openPanel !== "add" && (
        <div className="fixed inset-x-0 top-20 z-40 flex justify-center px-4 lg:inset-x-auto lg:right-[11.5rem] lg:top-1/2 lg:-translate-y-1/2 lg:justify-end lg:px-0">
          {openPanel === "ambient" && ambient && (
            <SoundPanel
              settings={ambient}
              onChange={changeAmbient}
              onClose={() => setOpenPanel(null)}
            />
          )}
          {openPanel === "reminders" && (
            <RemindersPanel
              onClose={() => setOpenPanel(null)}
              onTestNudge={setPreviewNudge}
            />
          )}
        </div>
      )}
    </div>
  );
}

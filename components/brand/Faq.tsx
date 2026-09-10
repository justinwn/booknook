"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { X } from "lucide-react";

/**
 * The footer's FAQ. Kept in one client component so the trigger and the
 * dialog can't drift apart, and styled on the light gallery palette rather
 * than the room's tokens: the same card has to read on a dark wallpaper and
 * on the login's sky.
 */
interface Entry {
  q: string;
  a: ReactNode;
}

const LINK = "font-medium text-gallery-ink underline underline-offset-2 hover:no-underline";

const ENTRIES: Entry[] = [
  {
    q: "Is my account safe?",
    a: (
      <>
        Sign-in runs through Google and Supabase, so BookNook never sees or stores your password.
        Your shelves are private to your account until you hand out your share link.
      </>
    ),
  },
  {
    q: "Where is my library stored?",
    a: (
      <>
        On your account, so your books, notes, featured shelf and reminders follow you to every
        device you sign in on. A copy is kept in this browser too, which is what makes the shelves
        paint instantly and keeps them readable when you are offline.
      </>
    ),
  },
  {
    q: "How does sharing work?",
    a: (
      <>
        Your profile has a link to your library. Anyone who opens it can walk your shelves and read
        your notes. Nobody but you can add, edit or remove a book, and nothing is listed publicly:
        the link is the only way in.
      </>
    ),
  },
  {
    q: "Where do the book covers and details come from?",
    a: (
      <>
        From{" "}
        <a href="https://openlibrary.org/" target="_blank" rel="noreferrer" className={LINK}>
          Open Library
        </a>
        , looked up by ISBN. If a book is missing or the record is wrong, every field is editable
        by hand, cover colour included.
      </>
    ),
  },
  {
    q: "Can I scan a barcode instead of typing the ISBN?",
    a: (
      <>
        Yes, tap the code icon in the ISBN field to open your camera. Barcode reading only works in
        Chrome and Edge right now, so on other browsers you will need to type the number.
      </>
    ),
  },
  {
    q: "Can I add my own theme?",
    a: (
      <>
        Not yet. Each room is built by hand, from the wallpaper to the paper the notes are written
        on. If there is one you want, email me and I will put it on the list.
      </>
    ),
  },
  {
    q: "What are the nudges, and are you tracking me?",
    a: (
      <>
        The nudges are timers running in your browser that send your companion over to remind you
        to drink water, stretch or take a break. Nothing is measured, sent anywhere or sold. There
        are no ads and no analytics.
      </>
    ),
  },
  {
    q: "Does it cost anything?",
    a: <>No. BookNook is a side project, free to use, with nothing to upgrade to.</>,
  },
  {
    q: "Where did the art and sound come from?",
    a: (
      <>
        Sprites from{" "}
        <a href="https://craftpix.net/" target="_blank" rel="noreferrer" className={LINK}>
          CraftPix
        </a>
        , wallpapers from{" "}
        <a href="https://wallsflow.com/" target="_blank" rel="noreferrer" className={LINK}>
          Wallsflow
        </a>
        , and ambient sound from{" "}
        <a
          href="https://www.epidemicsound.com/"
          target="_blank"
          rel="noreferrer"
          className={LINK}
        >
          Epidemic Sound
        </a>
        . None of it is mine, and all of it is licensed for use here.
      </>
    ),
  },
];

export function FaqLink({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  /** portals need a document, which the server render does not have */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // the room behind the dialog should not scroll away under it
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx("underline-offset-4 hover:underline", className)}
      >
        FAQ
      </button>

      {/* rendered on the body: the footer this link lives in is a positioned,
          pointer-events-none bar, and a dialog inside it inherits both its
          stacking context and its dead clicks */}
      {open && mounted && createPortal(
        <div
          className="pointer-events-auto fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Frequently asked questions"
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto max-h-[min(85vh,44rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl bg-[#faf9f7] p-6 text-left shadow-[0_30px_80px_-24px_rgba(0,0,0,0.6)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl leading-tight text-gallery-ink">
                Frequently asked
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-gallery-ink/45 transition-colors hover:bg-gallery-ink/5 hover:text-gallery-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <dl className="mt-5 flex flex-col gap-5">
              {ENTRIES.map((entry) => (
                <div key={entry.q}>
                  <dt className="font-body text-[14px] font-semibold text-gallery-ink">
                    {entry.q}
                  </dt>
                  <dd className="mt-1 font-body text-[13px] leading-relaxed text-gallery-ink/65">
                    {entry.a}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-7 border-t border-gallery-ink/10 pt-5 font-body text-[13px] leading-relaxed text-gallery-ink/65">
              Anything else, or a room you want built? Write to me at{" "}
              <a href="mailto:justinewincanete@gmail.com" className={LINK}>
                justinewincanete@gmail.com
              </a>
              .
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

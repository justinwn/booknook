import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LegalPage, Section } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "FAQ · BookNook",
  description: "How BookNook stores your library, where its covers and art come from, and what it costs.",
};

const LINK = "font-medium text-gallery-ink underline underline-offset-2 hover:no-underline";

interface Entry {
  q: string;
  a: ReactNode;
}

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

export default function FaqPage() {
  return (
    <LegalPage title="Frequently asked" updated="10 September 2026">
      {ENTRIES.map((entry) => (
        <Section key={entry.q} title={entry.q}>
          <p>{entry.a}</p>
        </Section>
      ))}
    </LegalPage>
  );
}

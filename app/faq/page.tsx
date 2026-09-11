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
        On a larger screen, yes — the code icon in the ISBN field opens your camera. It needs
        Chrome or Edge, which are the only browsers that can read a barcode today. It is hidden on
        phones for now, where camera permissions were more trouble than the scan saved, so type the
        number there instead.
      </>
    ),
  },
  {
    q: "I bought a book from my wishlist. Can I move it?",
    a: (
      <>
        Yes. Open the book and pick the other shelf at the top of the editor. A book you own can
        carry a reading status, the dates you read it and a rating, so those appear as soon as you
        move it across — and go again if you move it back, since none of them mean anything for a
        book you have not got yet.
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
        The nudges are timers that send your companion over to remind you to drink water, stretch
        or take a break. More than one can be waiting at once, and they stack: answer the one on
        top and the next comes forward. How often each one asks is saved to your account so it is
        the same on every device, and that is all that is kept — nothing is measured, sold or sent
        anywhere else. There are no ads and no analytics.
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

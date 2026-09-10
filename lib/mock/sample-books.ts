/**
 * Sample book + note pairs the login hero shuffles through. Covers come from
 * the Open Library cover service by ISBN, the same source the ISBN lookup
 * uses, so nothing is redrawn here. `default=false` makes a missing cover a
 * 404 rather than a blank placeholder, which lets Book3D fall back to its own
 * printed plate.
 */
export interface SampleBook {
  id: string;
  title: string;
  coverUrl: string;
  coverAlt: string;
  author: string;
  rating: number; // out of 5
  note: string;
  finishedAt: string;
  /** rotation applied to the cover, so each shuffle sits slightly differently */
  tilt: number;
}

const cover = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;

/**
 * Notes scattered behind the login book. Different titles, different ISBNs,
 * different hands writing them — the point is that the wall reads as a lot of
 * people's reading rather than one card repeated.
 */
export const SCATTERED_NOTES: SampleBook[] = [
  {
    id: "gatsby",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverUrl: cover("9780743273565"),
    coverAlt: "",
    rating: 4,
    note: "Finished it on the train and sat with the last page for a whole stop.",
    finishedAt: "2026-01-18",
    tilt: -6,
  },
  {
    id: "pride",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverUrl: cover("9780141439518"),
    coverAlt: "",
    rating: 5,
    note: "Third read. Still catching jokes I missed the first two times.",
    finishedAt: "2025-11-02",
    tilt: 4,
  },
  {
    id: "kitchen",
    title: "Kitchen",
    author: "Banana Yoshimoto",
    coverUrl: cover("9780571169108"),
    coverAlt: "",
    rating: 4,
    note: "Short, and it stayed with me longer than books four times its length.",
    finishedAt: "2025-09-14",
    tilt: -3,
  },
  {
    id: "piranesi",
    title: "Piranesi",
    author: "Susanna Clarke",
    coverUrl: cover("9781635575637"),
    coverAlt: "",
    rating: 5,
    note: "I did not want to leave the House. Read the ending twice.",
    finishedAt: "2025-07-30",
    tilt: 7,
  },
  {
    id: "bluets",
    title: "Bluets",
    author: "Maggie Nelson",
    coverUrl: cover("9781933517407"),
    coverAlt: "",
    rating: 4,
    note: "Read a few numbered sections a night. It rationed itself.",
    finishedAt: "2025-05-21",
    tilt: -8,
  },
  {
    id: "mockingbird",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    coverUrl: cover("9780061120084"),
    coverAlt: "",
    rating: 5,
    note: "Read it at school and remembered none of it. Understood it this time.",
    finishedAt: "2025-03-08",
    tilt: 5,
  },
  {
    id: "light-eaters-note",
    title: "The Light Eaters",
    author: "Zoë Schlanger",
    coverUrl: cover("9780063073852"),
    coverAlt: "",
    rating: 4,
    note: "Have not looked at a houseplant the same way since.",
    finishedAt: "2025-02-11",
    tilt: -5,
  },
  {
    id: "dune-note",
    title: "Dune",
    author: "Frank Herbert",
    coverUrl: cover("9780441172719"),
    coverAlt: "",
    rating: 5,
    note: "Took three chapters to find the rhythm. Then it had me.",
    finishedAt: "2024-12-04",
    tilt: 6,
  },
];

export const SAMPLE_BOOKS: SampleBook[] = [
  {
    id: "odyssey",
    title: "The Odyssey",
    author: "Homer",
    coverUrl: "/assets/book-placeholder.webp",
    coverAlt: "Book cover with a small ship on stylised blue waves",
    rating: 4,
    note: "Enjoyed reading this a lot, reminds me of my childhood memories. Chapter 7 was particularly exhilarating!",
    finishedAt: "2025-06-18",
    tilt: -4,
  },
  {
    id: "dune",
    title: "Dune",
    author: "Frank Herbert",
    coverUrl: cover("9780441172719"),
    coverAlt: "Cover of Dune by Frank Herbert",
    rating: 5,
    note: "Took three chapters to find the rhythm, then I couldn't put it down. The politics stayed with me longer than the sandworms.",
    finishedAt: "2025-05-02",
    tilt: -2,
  },
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    coverUrl: cover("9780735211292"),
    coverAlt: "Cover of Atomic Habits by James Clear",
    rating: 4,
    note: "The two-minute rule is the only part I actually kept. That was enough to make it worth the read.",
    finishedAt: "2025-03-14",
    tilt: -3,
  },
  {
    id: "mockingbird",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    coverUrl: cover("9780061120084"),
    coverAlt: "Cover of To Kill a Mockingbird by Harper Lee",
    rating: 5,
    note: "Read it at school and remembered none of it. Read it again this year and understood why everyone else did.",
    finishedAt: "2025-01-27",
    tilt: -1,
  },
  {
    id: "light-eaters",
    title: "The Light Eaters",
    author: "Zoë Schlanger",
    coverUrl: cover("9780063073852"),
    coverAlt: "Cover of The Light Eaters by Zoë Schlanger",
    rating: 4,
    note: "I have not looked at a houseplant the same way since. Kept stopping to read bits of it out loud.",
    finishedAt: "2024-11-09",
    tilt: -3,
  },
];

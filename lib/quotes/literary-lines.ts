export interface LiteraryLine {
  text: string;
  work: string;
  author: string;
  year: number;
}

/**
 * Famous lines, kept here rather than fetched.
 *
 * There is no dependable public API for iconic book lines. The general quote
 * services return aphorisms attributed to people rather than sentences from
 * novels, attribution on them is often wrong, and the ones that tried this
 * specifically have not stayed up. A local list is instant, works offline,
 * has no rate limit, and cannot start serving something unexpected on the
 * front of the app.
 *
 * Every line is from a work in the public domain (published before 1930), so
 * this ships the words outright rather than borrowing someone's copy of them.
 * Adding a line is a one-line edit; swapping the list for an API later means
 * changing `lineForToday` and nothing else.
 */
export const LITERARY_LINES: LiteraryLine[] = [
  { text: "Call me Ishmael.", work: "Moby-Dick", author: "Herman Melville", year: 1851 },
  {
    text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    work: "Pride and Prejudice",
    author: "Jane Austen",
    year: 1813,
  },
  {
    text: "It was the best of times, it was the worst of times.",
    work: "A Tale of Two Cities",
    author: "Charles Dickens",
    year: 1859,
  },
  { text: "Reader, I married him.", work: "Jane Eyre", author: "Charlotte Brontë", year: 1847 },
  {
    text: "I am no bird; and no net ensnares me: I am a free human being with an independent will.",
    work: "Jane Eyre",
    author: "Charlotte Brontë",
    year: 1847,
  },
  {
    text: "Happy families are all alike; every unhappy family is unhappy in its own way.",
    work: "Anna Karenina",
    author: "Leo Tolstoy",
    year: 1878,
  },
  {
    text: "So we beat on, boats against the current, borne back ceaselessly into the past.",
    work: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    year: 1925,
  },
  {
    text: "Beware; for I am fearless, and therefore powerful.",
    work: "Frankenstein",
    author: "Mary Shelley",
    year: 1818,
  },
  {
    text: "Whatever our souls are made of, his and mine are the same.",
    work: "Wuthering Heights",
    author: "Emily Brontë",
    year: 1847,
  },
  {
    text: "We are all in the gutter, but some of us are looking at the stars.",
    work: "Lady Windermere's Fan",
    author: "Oscar Wilde",
    year: 1892,
  },
  {
    text: "Why, sometimes I've believed as many as six impossible things before breakfast.",
    work: "Through the Looking-Glass",
    author: "Lewis Carroll",
    year: 1871,
  },
  {
    text: "I went to the woods because I wished to live deliberately.",
    work: "Walden",
    author: "Henry David Thoreau",
    year: 1854,
  },
  {
    text: "I am not afraid of storms, for I am learning how to sail my ship.",
    work: "Little Women",
    author: "Louisa May Alcott",
    year: 1868,
  },
  {
    text: "I'm so glad I live in a world where there are Octobers.",
    work: "Anne of Green Gables",
    author: "L. M. Montgomery",
    year: 1908,
  },
  {
    text: "You see, but you do not observe.",
    work: "A Scandal in Bohemia",
    author: "Arthur Conan Doyle",
    year: 1891,
  },
  {
    text: "The world breaks everyone, and afterward many are strong at the broken places.",
    work: "A Farewell to Arms",
    author: "Ernest Hemingway",
    year: 1929,
  },
  {
    text: "Time you enjoy wasting is not wasted time.",
    work: "Phrynette Married",
    author: "Marthe Troly-Curtin",
    year: 1912,
  },
  {
    text: "There is no charm equal to tenderness of heart.",
    work: "Emma",
    author: "Jane Austen",
    year: 1815,
  },
  {
    text: "We are asleep until we fall in love.",
    work: "War and Peace",
    author: "Leo Tolstoy",
    year: 1869,
  },
  {
    text: "Nothing ever becomes real till it is experienced.",
    work: "Letters of John Keats",
    author: "John Keats",
    year: 1819,
  },
];

function normalise(title: string): string {
  return title
    .toLowerCase()
    .replace(/^(the|a|an)\s+/, "")
    .replace(/[^a-z0-9]/g, "");
}

/** how long one line holds the corner before the next takes it */
export const LINE_ROTATION_MS = 30 * 60_000;

/**
 * The line for the current half-hour slot. Derived from the clock rather than
 * drawn at random, so a reload mid-slot shows the same line and two tabs
 * always agree.
 *
 * When the reader's own shelves hold one of these works, the line comes from
 * their collection: a line off a book you own reads as yours, and a line off
 * a book you have never opened reads as decoration.
 */
export function lineForNow(titles: string[] = [], now = new Date()): LiteraryLine {
  const owned = new Set(titles.map(normalise));
  const pool = LITERARY_LINES.filter((l) => owned.has(normalise(l.work)));
  const from = pool.length > 0 ? pool : LITERARY_LINES;
  const slot = Math.floor(now.getTime() / LINE_ROTATION_MS);
  return from[((slot % from.length) + from.length) % from.length];
}

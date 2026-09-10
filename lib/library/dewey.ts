/**
 * Dewey Decimal Classification — the ten main classes. Shelves in the
 * bookcase view are labelled by class, the way a real library signs its
 * stacks, so a collection has a structure the reader didn't have to invent.
 *
 * A book stores its full Dewey number (e.g. 823.912); the class is derived
 * from the hundreds digit, so finer-grained shelving later is a display
 * change, not a data migration.
 */
export interface DeweyClass {
  /** hundreds bucket: 0, 100, 200 … 900 */
  code: number;
  /** how the label reads on the shelf */
  label: string;
}

export const DEWEY_CLASSES: DeweyClass[] = [
  { code: 0, label: "General & Information" },
  { code: 100, label: "Philosophy & Psychology" },
  { code: 200, label: "Religion" },
  { code: 300, label: "Social Sciences" },
  { code: 400, label: "Language" },
  { code: 500, label: "Science" },
  { code: 600, label: "Technology" },
  { code: 700, label: "Arts & Recreation" },
  { code: 800, label: "Literature" },
  { code: 900, label: "History & Geography" },
];

export function deweyClassFor(dewey: number): DeweyClass {
  const code = Math.floor(dewey / 100) * 100;
  return DEWEY_CLASSES.find((c) => c.code === code) ?? DEWEY_CLASSES[0];
}

/** "000", "100" … "900" — how the number is written on a spine label */
export function formatClassCode(code: number): string {
  return code.toString().padStart(3, "0");
}

/** Full call number as it would appear on the book's own label. */
export function formatCallNumber(dewey: number): string {
  return dewey.toFixed(dewey % 1 === 0 ? 0 : 2).padStart(3, "0");
}

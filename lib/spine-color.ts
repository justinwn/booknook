/**
 * Placeholder spine coloring. Drawn from a curated bookbinding palette
 * rather than a full-spectrum hue rotation — arbitrary hues fight the warm
 * rooms badly, while cloth-bound stock has always lived in a narrow, muted
 * range. Deterministic on the title, so a book keeps its color.
 *
 * Replace with cover-derived or user-chosen coloring once real covers land;
 * nothing else depends on how the color is produced.
 */
const BINDINGS: Array<{ bg: string; band: string }> = [
  { bg: "#6d2f2a", band: "#4d1f1c" }, // oxblood
  { bg: "#2f4034", band: "#1f2c23" }, // forest
  { bg: "#2b3a4d", band: "#1b2634" }, // navy
  { bg: "#7a6242", band: "#54432c" }, // tan calf
  { bg: "#8a6520", band: "#5f4514" }, // ochre
  { bg: "#3a3733", band: "#262421" }, // charcoal
  { bg: "#55603a", band: "#3a4226" }, // olive
  { bg: "#6a3b22", band: "#4a2716" }, // russet
  { bg: "#4a3a52", band: "#332839" }, // aubergine
  { bg: "#8d7a5e", band: "#665741" }, // vellum
];

/**
 * A book's own cover colour wins when we have it; the hashed palette is the
 * fallback for books with no jacket art (or a cover the browser can't read
 * pixels from).
 */
export function spineColorFor(book: { title: string; spineBg?: string; spineBand?: string }): {
  bg: string;
  band: string;
} {
  if (book.spineBg && book.spineBand) return { bg: book.spineBg, band: book.spineBand };
  return spineColor(book.title);
}

export function spineColor(seed: string): { bg: string; band: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return BINDINGS[Math.abs(hash) % BINDINGS.length];
}

/**
 * Pulls the dominant colour out of a cover image so a book's spine matches
 * its jacket. Runs in the browser on a tiny canvas — no dependency, no
 * server round trip.
 *
 * Cross-origin covers only yield pixels when the host sends CORS headers
 * (Open Library does; some Google Books hosts don't), so every path here
 * fails soft and the caller keeps the hashed placeholder colour.
 */

export interface SpineColors {
  bg: string;
  band: string;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

/**
 * Buckets pixels by hue and picks the most-represented colourful bucket,
 * rather than averaging — averaging a cover just returns mud. Near-white and
 * near-black pixels are ignored unless the whole jacket is monochrome, in
 * which case the greyscale result is the honest answer.
 */
export function dominantFromImageData(data: Uint8ClampedArray): SpineColors | null {
  const buckets = new Map<number, { count: number; h: number; s: number; l: number }>();
  let monoCount = 0;
  let monoL = 0;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 200) continue;
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);

    if (s < 0.16 || l < 0.08 || l > 0.94) {
      monoCount++;
      monoL += l;
      continue;
    }
    const key = Math.floor(h / 15); // 24 hue buckets
    const bucket = buckets.get(key) ?? { count: 0, h: 0, s: 0, l: 0 };
    bucket.count++;
    bucket.h += h;
    bucket.s += s;
    bucket.l += l;
    buckets.set(key, bucket);
  }

  type Bucket = { count: number; h: number; s: number; l: number };
  let best: Bucket | undefined;
  buckets.forEach((bucket) => {
    if (best === undefined || bucket.count > best.count) best = bucket;
  });

  if (best === undefined || best.count < 24) {
    if (monoCount === 0) return null;
    const l = Math.min(0.42, Math.max(0.16, monoL / monoCount));
    return { bg: hsl(35, 0.06, l), band: hsl(35, 0.06, Math.max(0.08, l - 0.12)) };
  }

  const h = best.h / best.count;
  // clamp into cloth-binding territory: a neon jacket shouldn't produce a
  // neon spine that blows out the room's lighting
  const s = Math.min(0.62, Math.max(0.22, best.s / best.count));
  const l = Math.min(0.46, Math.max(0.22, best.l / best.count));
  return { bg: hsl(h, s, l), band: hsl(h, Math.min(0.7, s + 0.06), Math.max(0.1, l - 0.13)) };
}

/**
 * The cover's most-used colours, brightest bucket first — the swatches the
 * reader picks a spine colour from. Same bucketing as the dominant colour,
 * just keeping more of them.
 */
export function paletteFromImageData(data: Uint8ClampedArray, count = 6): string[] {
  const buckets = new Map<number, { count: number; h: number; s: number; l: number }>();

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (l < 0.06 || l > 0.96) continue;
    // a coarser split than the dominant-colour pass, so near-neutrals survive
    const key = Math.floor(h / 20) * 10 + (s < 0.14 ? 1 : 0);
    const bucket = buckets.get(key) ?? { count: 0, h: 0, s: 0, l: 0 };
    bucket.count++;
    bucket.h += h;
    bucket.s += s;
    bucket.l += l;
    buckets.set(key, bucket);
  }

  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, count)
    .map((b) =>
      hsl(
        b.h / b.count,
        Math.min(0.7, b.s / b.count),
        Math.min(0.55, Math.max(0.18, b.l / b.count))
      )
    );
}

function readPixels(src: string): Promise<Uint8ClampedArray | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 48;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        resolve(ctx.getImageData(0, 0, size, size).data);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function extractPalette(src: string, count = 6): Promise<string[]> {
  const data = await readPixels(src);
  return data ? paletteFromImageData(data, count) : [];
}

/** Darkens any CSS colour into a matching spine band. */
export function bandFor(color: string): string {
  const hslMatch = color.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    return `hsl(${h} ${Math.min(80, Number(s) + 6)}% ${Math.max(8, Number(l) - 13)}%)`;
  }
  const hex = color.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    const dim = (v: number) => Math.max(0, Math.round(v * 0.68));
    const r = dim((n >> 16) & 255);
    const g = dim((n >> 8) & 255);
    const b = dim(n & 255);
    return `rgb(${r} ${g} ${b})`;
  }
  return color;
}

/** Loads an image and reads its dominant colour. Resolves null on any failure. */
export function extractSpineColor(src: string): Promise<SpineColors | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 48;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        resolve(dominantFromImageData(ctx.getImageData(0, 0, size, size).data));
      } catch {
        resolve(null); // tainted canvas — the host sent no CORS headers
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

import type { ThemeId } from "@/lib/types";

/**
 * How a theme's paper/note material is rendered. This is the "material
 * treatment" axis of a theme — deliberately separate from color tokens,
 * because it's what makes a mood feel like an object rather than a palette.
 */
export interface PaperTreatment {
  /** background + ink of the note itself (independent of the app chrome) */
  background: string;
  ink: string;
  /** optional ruling/grid printed on the stock */
  pattern: "none" | "grid" | "lines" | "dots";
  patternColor?: string;
  /**
   * Typography for the note, per theme. Font families are loaded once in
   * app/layout.tsx and referenced here only by CSS custom property, so a
   * pairing change never touches a component.
   */
  fontDisplay: string;
  fontBody: string;
  /** pixel fonts need looser leading and no italic to stay legible */
  displayTracking?: string;
  /**
   * Multiplier on the clock's type size. A pixel face sets far wider per
   * character than a serif at the same px, so Minecraft's time needs taking
   * down rather than every other room needing pushing up.
   */
  clockScale?: number;
}

/** A bookshelf inside the wallpaper, expressed as a region of the scene. */
export interface ShelfHotspot {
  id: string;
  /** percentages of the scene, measured off the wallpaper's own frame */
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

/**
 * How this mood builds a bookshelf. The shelf view is furniture, so it should
 * be made of the same material as the room it belongs to — a Minecraft shelf
 * is thick spruce with hard corners, a seaside one is a painted plank on
 * brackets.
 */
export interface Shelving {
  /** framed case, plank on brackets, or chunky blocks */
  style: "framed" | "floating" | "blocky";
  /** the woodwork */
  frame: string;
  /** the surface books stand against */
  interior: string;
  /** thickness of the visible board, in px */
  boardThickness: number;
  /** corner rounding of the case */
  radius: number;
  /** how many shelves sit side by side on a wide screen */
  columns: 2 | 3;
  /** ink for the Dewey sign */
  signBackground: string;
  /**
   * A filter laid over the books on this shelf so a collection reads as part
   * of the room rather than a swatch chart in front of it. Dark rooms want
   * the saturation and brightness pulled down; a bright one barely at all.
   */
  bookTone?: string;
  /** a wash the same colour as the room, over the shelf interior */
  interiorWash?: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  /** matches the wallpaper file it was cut from */
  name: string;
  /** short + evocative — the mood in one line */
  tagline: string;
  /** longer copy shown inside the expanded/selected card */
  description: string;
  /** looping 4K-sourced wallpaper, transcoded for the web */
  wallpaper: string;
  /** first frame — paints instantly, and stands in when motion is reduced */
  poster: string;
  /** true for bright/daylight moods rather than moody/nocturnal ones */
  isLight: boolean;
  /** the shelves in this scene, clickable to zoom into the collection */
  shelfHotspots: ShelfHotspot[];
  shelving: Shelving;
  paper: PaperTreatment;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "cozy-room",
    name: "Cozy room",
    tagline: "Blue hour, one warm lamp",
    description:
      "An apartment after dark — city light through the window, a lamp left on, and nowhere to be.",
    wallpaper: "/assets/wallpapers/cozy-room.mp4",
    poster: "/assets/wallpapers/cozy-room.jpg",
    isLight: false,
    shelfHotspots: [
      { id: "cozy-alcove", x: 43, y: 32, width: 16, height: 22, label: "The alcove shelves" },
      { id: "cozy-console", x: 18, y: 52, width: 24, height: 11, label: "The reading pile" },
    ],
    shelving: {
      style: "floating",
      frame: "linear-gradient(to bottom, #a8845c, #6d5236)",
      interior: "rgba(20, 18, 30, 0.22)",
      boardThickness: 14,
      radius: 10,
      columns: 2,
      signBackground: "#221f30",
      bookTone: "saturate(0.86) brightness(0.94)",
      interiorWash: "linear-gradient(180deg, rgba(38,34,60,0.35), rgba(20,18,32,0.5))",
    },
    paper: {
      background: "#f2ece0",
      ink: "#2c2a33",
      pattern: "lines",
      patternColor: "rgba(90, 90, 130, 0.14)",
      fontDisplay: "var(--font-fraunces)",
      fontBody: "var(--font-work-sans)",
    },
  },
  {
    id: "magical-garden",
    name: "Magical garden",
    tagline: "A bookshop that only opens at night",
    description:
      "Flowers spilling onto the pavement, warm shelves glowing behind the glass, stars above the roofline.",
    wallpaper: "/assets/wallpapers/magical-garden.mp4",
    poster: "/assets/wallpapers/magical-garden.jpg",
    isLight: false,
    shelfHotspots: [
      { id: "garden-wall", x: 9, y: 45, width: 30, height: 27, label: "The outdoor stacks" },
      { id: "garden-shop", x: 56, y: 54, width: 15, height: 24, label: "The shop window" },
    ],
    shelving: {
      style: "framed",
      frame: "linear-gradient(to bottom, #4b3a2a, #2a1f18)",
      interior: "rgba(22, 15, 34, 0.85)",
      boardThickness: 12,
      radius: 6,
      columns: 2,
      signBackground: "#1c1430",
      bookTone: "saturate(0.88) brightness(0.92)",
      interiorWash: "linear-gradient(180deg, rgba(34,22,52,0.4), rgba(18,12,30,0.55))",
    },
    paper: {
      // light yellow stock, written in a storybook serif — nothing like the
      // cozy room's plain sans on grey-white
      background: "#faf0c6",
      ink: "#3a2d16",
      pattern: "none",
      fontDisplay: "var(--font-playfair)",
      fontBody: "var(--font-eb-garamond)",
    },
  },
  {
    id: "seaside-cafe",
    name: "Seaside cafe",
    tagline: "Salt air and a second coffee",
    description:
      "A terrace over the water, potted geraniums, and the kind of afternoon that doesn't need a plan.",
    wallpaper: "/assets/wallpapers/seaside-cafe.mp4",
    poster: "/assets/wallpapers/seaside-cafe.jpg",
    isLight: true,
    shelfHotspots: [
      { id: "cafe-back-wall", x: 62, y: 33, width: 28, height: 27, label: "Behind the counter" },
      { id: "cafe-arch", x: 37, y: 30, width: 19, height: 22, label: "The arch nook" },
    ],
    shelving: {
      style: "floating",
      frame: "linear-gradient(to bottom, #ffffff, #dfe7e4)",
      interior: "rgba(255, 255, 255, 0.10)",
      boardThickness: 12,
      radius: 14,
      columns: 3,
      signBackground: "#1b3436",
      bookTone: "saturate(0.9) brightness(0.98)",
      interiorWash: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(31,58,61,0.12))",
    },
    paper: {
      // sky blue stock, and a rounded body face for the sea air
      background: "#d9ebf7",
      ink: "#173a4f",
      pattern: "dots",
      patternColor: "rgba(23, 78, 110, 0.16)",
      fontDisplay: "var(--font-dm-serif)",
      fontBody: "var(--font-quicksand)",
    },
  },
  {
    id: "minecraft",
    name: "Minecraft",
    tagline: "Built one block at a time",
    description:
      "A hand-dug library in the hillside — spruce planks, lantern light, and vines through the window.",
    wallpaper: "/assets/wallpapers/minecraft.mp4",
    poster: "/assets/wallpapers/minecraft.jpg",
    isLight: false,
    shelfHotspots: [
      { id: "mc-lower", x: 10, y: 40, width: 19, height: 20, label: "The hillside shelves" },
      { id: "mc-upper", x: 13, y: 11, width: 18, height: 14, label: "The upper store" },
    ],
    shelving: {
      style: "blocky",
      frame: "linear-gradient(to bottom, #7a5a34, #4a3620)",
      interior: "rgba(24, 17, 9, 0.92)",
      boardThickness: 20,
      radius: 0,
      columns: 2,
      signBackground: "#241d14",
      bookTone: "saturate(0.84) brightness(0.92)",
      interiorWash: "linear-gradient(180deg, rgba(36,26,14,0.45), rgba(16,11,6,0.6))",
    },
    paper: {
      background: "#e8e4d8",
      ink: "#2a2320",
      pattern: "grid",
      patternColor: "rgba(70, 60, 45, 0.16)",
      fontDisplay: "var(--font-press-start)",
      fontBody: "var(--font-vt323)",
      displayTracking: "0.02em",
      clockScale: 0.62,
    },
  },
  {
    id: "dark-academia",
    name: "Dark academia",
    tagline: "Ink, dust and a late lamp",
    description:
      "A gothic reading room in the rain: one green lamp, tall windows, and more open books than the desk can hold.",
    wallpaper: "/assets/wallpapers/dark-academia.mp4",
    poster: "/assets/wallpapers/dark-academia.jpg",
    isLight: false,
    shelfHotspots: [
      { id: "academia-stacks", x: 0.5, y: 7, width: 15, height: 60, label: "The west wall" },
      { id: "academia-desk", x: 20, y: 76, width: 26, height: 20, label: "The reading desk" },
    ],
    shelving: {
      // nothing rounded anywhere in this room: sharp edges are the whole point
      style: "framed",
      frame: "linear-gradient(to bottom, #2c2c2e, #171718)",
      interior: "rgba(12, 12, 13, 0.9)",
      boardThickness: 10,
      radius: 0,
      columns: 2,
      signBackground: "#0d0d0e",
      bookTone: "grayscale(1) contrast(1.06) brightness(0.98)",
      interiorWash: "linear-gradient(180deg, rgba(22,22,24,0.4), rgba(8,8,9,0.6))",
    },
    paper: {
      background: "#f4f3f1",
      ink: "#141416",
      pattern: "lines",
      patternColor: "rgba(20, 20, 22, 0.14)",
      fontDisplay: "var(--font-playfair)",
      fontBody: "var(--font-eb-garamond)",
    },
  },
];

export const DEFAULT_THEME_ID: ThemeId = "cozy-room";

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

import type { Slot, ThemeId } from "@/lib/types";

/**
 * ROOM SLOT MAPS
 *
 * Each theme's room photograph gets a map describing where its real shelf
 * surfaces are. Coordinates are percentages of the PHOTO's own box (not the
 * viewport), so books stay glued to the right ledges at any window size —
 * `RoomScene` reproduces object-cover geometry on a real element so those
 * percentages resolve against the image, not the screen.
 *
 * This is the whole point of the separation: swap the photo, retune one map,
 * and every book/decor position follows. No component reads pixels off an image.
 */

export interface ShelfRow {
  id: string;
  /** the surface books stand on, % of room height */
  ledgeY: number;
  /** horizontal extent of usable shelf, % of room width */
  xStart: number;
  xEnd: number;
  /** how tall a book on this row is, % of room height */
  bookHeight: number;
  /** number of book slots along the row */
  slots: number;
  /** depth cue — rows further back render slightly smaller */
  scale?: number;
}

export interface DecorSlotDef {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoomSlotMap {
  /** intrinsic aspect (width / height) of the room photograph */
  aspectRatio: number;
  /**
   * How the room lights the things standing in it. Rendered spines are flat
   * artwork; without this a dim room gets books that look pasted on. Applied
   * as a filter over the whole placement layer.
   */
  lighting?: { brightness: number; saturate: number };
  rows: ShelfRow[];
  decor: DecorSlotDef[];
  /** true when the room has no shelf of its own, so the app draws the boards */
  rendersOwnShelves?: boolean;
}

/**
 * The wallpapers are ambient scenes, not photographs of a shelf wall — there
 * is no ledge in them to align to, and a video's framing moves. So these
 * rooms carry `rendersOwnShelves`: the library draws real shelf boards at
 * these rows and stands the books on those, which is the same
 * background-is-not-the-layout-system rule taken to its conclusion. The
 * numbers below position furniture, not features of an image.
 */
const WALLPAPER_ROOM: Omit<RoomSlotMap, "lighting"> = {
  aspectRatio: 16 / 9,
  rendersOwnShelves: true,
  rows: [
    { id: "row-1", ledgeY: 40, xStart: 20, xEnd: 80, bookHeight: 11, slots: 9, scale: 0.96 },
    { id: "row-2", ledgeY: 56, xStart: 20, xEnd: 80, bookHeight: 11, slots: 9, scale: 0.98 },
    { id: "row-3", ledgeY: 72, xStart: 20, xEnd: 80, bookHeight: 11, slots: 9, scale: 1 },
  ],
  decor: [],
};

function wallpaperRoom(lighting: { brightness: number; saturate: number }): RoomSlotMap {
  return { ...WALLPAPER_ROOM, lighting };
}

export const ROOM_SLOT_MAPS: Record<ThemeId, RoomSlotMap> = {
  "cozy-room": wallpaperRoom({ brightness: 0.92, saturate: 0.95 }),
  "magical-garden": wallpaperRoom({ brightness: 0.88, saturate: 1 }),
  "seaside-cafe": wallpaperRoom({ brightness: 1.02, saturate: 1 }),
  minecraft: wallpaperRoom({ brightness: 0.9, saturate: 0.95 }),
  "dark-academia": wallpaperRoom({ brightness: 0.95, saturate: 0 }),
};

/** Expands a room map into concrete, addressable slots. */
export function buildSlots(map: RoomSlotMap): Slot[] {
  const bookSlots: Slot[] = map.rows.flatMap((row) => {
    const span = (row.xEnd - row.xStart) / row.slots;
    return Array.from({ length: row.slots }, (_, i) => ({
      id: `${row.id}-s${i}`,
      rowId: row.id,
      x: row.xStart + i * span,
      y: row.ledgeY - row.bookHeight,
      width: span,
      height: row.bookHeight,
      kind: "book" as const,
      scale: row.scale ?? 1,
    }));
  });

  const decorSlots: Slot[] = map.decor.map((d) => ({
    id: d.id,
    rowId: "decor",
    x: d.x,
    y: d.y,
    width: d.width,
    height: d.height,
    kind: "decor" as const,
    scale: 1,
  }));

  return [...bookSlots, ...decorSlots];
}

export function getRoomSlots(themeId: ThemeId): Slot[] {
  return buildSlots(ROOM_SLOT_MAPS[themeId]);
}

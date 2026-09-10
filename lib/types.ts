// Core domain types. Kept minimal and MVP-scoped — extend rather than
// restructure as backend/persistence lands.

export type ThemeId =
  | "cozy-room"
  | "magical-garden"
  | "seaside-cafe"
  | "minecraft"
  | "dark-academia";

export type BookStatus = "New" | "Ongoing" | "Done" | "Dropped";

export interface Book {
  id: string;
  isbn?: string;
  title: string;
  author: string;
  coverUrl: string;
  /** physical dimensions in mm — heightMm drives spine height, widthMm/thicknessMm drive spine width */
  dimensions: { heightMm: number; widthMm: number; thicknessMm: number };
  rating?: number; // 1-5
  note?: string;
  tags: string[];
  owned: boolean;
  status?: BookStatus; // meaningful only when owned
  addedAt: string; // ISO date
  /** ISO date the reader started it; absent if never started or dropped */
  startedAt?: string;
  /** ISO date the reader finished it — drives "recently finished" ordering */
  finishedAt?: string;
  /** dominant colour pulled from the cover, so the spine matches the jacket */
  spineBg?: string;
  spineBand?: string;
  /** full Dewey Decimal number; the shelf class is derived from it */
  dewey: number;
  /** position within its shelf's ordered placement, independent of slot geometry */
  order: number;
  slotId: string;
}

/**
 * A slot is a declared region of the ROOM — expressed as a percentage of the
 * background photograph's own box, never of the viewport. The photograph is
 * art; this is the layout system. They are deliberately separate, so a room
 * image can be re-shot or replaced and only its slot map changes.
 */
export interface Slot {
  id: string;
  rowId: string;
  x: number; // % of room width — left edge
  y: number; // % of room height — top edge
  width: number; // % of room width
  height: number; // % of room height
  kind: "book" | "decor";
  /** depth cue: rows further into the room render slightly smaller */
  scale: number;
}

export type DecorType = "cactus" | "polaroid" | "figure" | "lamp";

export interface DecorPlacement {
  id: string;
  decorType: DecorType;
  slotId: string;
  scope: "universal" | ThemeId;
}

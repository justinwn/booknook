import type { ThemeId } from "@/lib/types";

export type AmbientTrackId =
  | "fireplace"
  | "rain"
  | "ocean"
  | "birdsong"
  | "crickets"
  | "library-hum";

export interface AmbientTrack {
  id: AmbientTrackId;
  label: string;
  /** what it actually sounds like, so the list reads as a room rather than filenames */
  blurb: string;
  src: string;
}

/**
 * The ambient beds. These are layers, not a playlist: rain and a fireplace
 * together is a legitimate room, so every track has its own switch and its own
 * level rather than one being "playing".
 */
export const AMBIENT_TRACKS: AmbientTrack[] = [
  { id: "fireplace", label: "Fireplace", blurb: "Wood burning, close by", src: "/assets/audio/fireplace.mp3" },
  { id: "rain", label: "Rain", blurb: "Monsoon rain on leaves", src: "/assets/audio/rain.mp3" },
  { id: "ocean", label: "Ocean", blurb: "Surf and the odd gull", src: "/assets/audio/ocean.mp3" },
  { id: "birdsong", label: "Birdsong", blurb: "Rainforest at dawn", src: "/assets/audio/birdsong.mp3" },
  { id: "crickets", label: "Crickets", blurb: "One cricket, after dark", src: "/assets/audio/crickets.mp3" },
  { id: "library-hum", label: "Library hum", blurb: "A public room, air moving", src: "/assets/audio/library-hum.mp3" },
];

export interface AmbientTrackSetting {
  on: boolean;
  /** 0 to 1, straight onto the audio element */
  volume: number;
}

export type AmbientSettings = Record<AmbientTrackId, AmbientTrackSetting>;

/**
 * The bed each room opens with, as track → opening volume. A room that
 * arrives silent reads as broken, so a new account hears the sound that
 * belongs to the theme it chose; the moment the reader touches a switch or a
 * slider, their mix is what persists.
 *
 * A bed can be more than one layer: dark academia is rain against a room tone,
 * with the tone well under the rain so it reads as the building rather than a
 * second weather.
 */
export const DEFAULT_BED: Record<ThemeId, Partial<Record<AmbientTrackId, number>>> = {
  "magical-garden": { birdsong: 0.3 },
  "cozy-room": { rain: 0.3 },
  "seaside-cafe": { ocean: 0.3 },
  minecraft: { crickets: 0.3 },
  "dark-academia": { rain: 0.3, "library-hum": 0.15 },
};

/** a bed is background, not a soundtrack: it starts low and is turned up by hand */
const DEFAULT_VOLUME = 0.3;

const SILENT: AmbientSettings = AMBIENT_TRACKS.reduce((acc, track) => {
  acc[track.id] = { on: false, volume: DEFAULT_VOLUME };
  return acc;
}, {} as AmbientSettings);

export function defaultAmbientFor(themeId: ThemeId): AmbientSettings {
  const bed = DEFAULT_BED[themeId] ?? {};
  return AMBIENT_TRACKS.reduce((acc, track) => {
    const level = bed[track.id];
    acc[track.id] = { on: level !== undefined, volume: level ?? DEFAULT_VOLUME };
    return acc;
  }, {} as AmbientSettings);
}

const KEY = "librari:ambient";

function clamp(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback;
}

type Stored = { byTheme?: Partial<Record<ThemeId, Partial<Record<AmbientTrackId, Partial<AmbientTrackSetting>>>>> };

function merge(
  saved: Partial<Record<AmbientTrackId, Partial<AmbientTrackSetting>>> | undefined,
  fallback: AmbientSettings
): AmbientSettings {
  // merged per track, so adding a bed later doesn't invalidate saved levels
  return AMBIENT_TRACKS.reduce((acc, track) => {
    const entry = saved?.[track.id];
    acc[track.id] = entry
      ? { on: Boolean(entry.on), volume: clamp(entry.volume, fallback[track.id].volume) }
      : fallback[track.id];
    return acc;
  }, {} as AmbientSettings);
}

/**
 * Each room keeps its own mix. Moving to a different theme brings up that
 * room's sound rather than carrying the last one over, and a room never
 * touched still opens on its default bed.
 */
export function loadAmbient(themeId: ThemeId): AmbientSettings {
  const fallback = defaultAmbientFor(themeId);
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Stored & Partial<Record<AmbientTrackId, unknown>>;
    // an older single-mix save has track keys at the top level; it belongs to
    // whichever room was open when it was written, so it is adopted here
    if (!parsed.byTheme) {
      const legacy = parsed as Partial<Record<AmbientTrackId, Partial<AmbientTrackSetting>>>;
      return AMBIENT_TRACKS.some((t) => legacy[t.id]) ? merge(legacy, SILENT) : fallback;
    }
    const forTheme = parsed.byTheme[themeId];
    return forTheme ? merge(forTheme, fallback) : fallback;
  } catch {
    return fallback;
  }
}

export function saveAmbient(themeId: ThemeId, settings: AmbientSettings): void {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Stored) : {};
    const byTheme = parsed.byTheme ?? {};
    window.localStorage.setItem(KEY, JSON.stringify({ byTheme: { ...byTheme, [themeId]: settings } }));
  } catch {
    // storage blocked — the mix applies for this session only
  }
}

/** Volume for the nudge chime. Low: it interrupts, so it shouldn't startle. */
export const REMINDER_VOLUME = 0.5;
export const REMINDER_SRC = "/assets/audio/reminder.mp3";

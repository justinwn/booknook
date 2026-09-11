export type NudgeKind = "water" | "stretch" | "break";

export interface NudgeSetting {
  enabled: boolean;
  /** how many hours between nudges */
  hours: number;
}

export type WellnessSettings = Record<NudgeKind, NudgeSetting>;

export const NUDGES: Array<{ kind: NudgeKind; label: string; message: string }> = [
  { kind: "water", label: "Drink water", message: "Time for a glass of water." },
  { kind: "stretch", label: "Get up and stretch", message: "Stand up and stretch a bit." },
  { kind: "break", label: "Take a break", message: "Rest your eyes for a few minutes." },
];

export const DEFAULT_WELLNESS: WellnessSettings = {
  water: { enabled: true, hours: 1 },
  stretch: { enabled: true, hours: 2 },
  break: { enabled: false, hours: 3 },
};

const SETTINGS_KEY = "librari:wellness";
const FIRED_KEY = "librari:wellness-fired";
const SNOOZE_KEY = "librari:wellness-snoozed";
const SINCE_KEY = "librari:wellness-since";

/** how long "Snooze" holds a nudge back before it asks again */
export const SNOOZE_MS = 5 * 60_000;

/**
 * How long a nudge nobody answered stands before it is given up on. Past
 * this it has been answered by time one way or the other, and a bubble from
 * this morning still sitting there at bedtime is clutter rather than a
 * reminder. Its interval restarts when it goes, so it isn't simply re-raised.
 */
export const STALE_MS = 8 * 3_600_000;

/** merges rather than replaces, so a new nudge kind (or a partial doc from
 * the account) doesn't break settings that were already saved */
export function mergeWellness(partial: Partial<WellnessSettings> | undefined | null): WellnessSettings {
  return {
    water: { ...DEFAULT_WELLNESS.water, ...partial?.water },
    stretch: { ...DEFAULT_WELLNESS.stretch, ...partial?.stretch },
    break: { ...DEFAULT_WELLNESS.break, ...partial?.break },
  };
}

export function loadWellness(): WellnessSettings {
  if (typeof window === "undefined") return DEFAULT_WELLNESS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_WELLNESS;
    return mergeWellness(JSON.parse(raw) as Partial<WellnessSettings>);
  } catch {
    return DEFAULT_WELLNESS;
  }
}

export function saveWellness(settings: WellnessSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // storage blocked — settings apply for this session only
  }
}

/**
 * When the countdown's very first interval began — written once, the first
 * time this reader ever opens the room, and reused from then on. Anchoring
 * it to localStorage rather than to the moment this component happens to
 * mount means a page reload doesn't silently restart the wait.
 */
export function loadSince(now = Date.now()): number {
  if (typeof window === "undefined") return now;
  try {
    const raw = window.localStorage.getItem(SINCE_KEY);
    if (raw) return Number(raw);
    window.localStorage.setItem(SINCE_KEY, String(now));
    return now;
  } catch {
    return now;
  }
}

export function loadFired(): Partial<Record<NudgeKind, number>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(FIRED_KEY);
    return raw ? (JSON.parse(raw) as Record<NudgeKind, number>) : {};
  } catch {
    return {};
  }
}

export function markFired(kind: NudgeKind): void {
  try {
    const fired = loadFired();
    fired[kind] = Date.now();
    window.localStorage.setItem(FIRED_KEY, JSON.stringify(fired));
  } catch {
    // ignore
  }
}

export function loadSnoozed(): Partial<Record<NudgeKind, number>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SNOOZE_KEY);
    return raw ? (JSON.parse(raw) as Record<NudgeKind, number>) : {};
  } catch {
    return {};
  }
}

/**
 * Holds a nudge back without resetting its timer: the character asks again in
 * five minutes, and the full interval still counts from the last "Done".
 */
export function snoozeNudge(kind: NudgeKind, now = Date.now()): void {
  try {
    const snoozed = loadSnoozed();
    snoozed[kind] = now + SNOOZE_MS;
    window.localStorage.setItem(SNOOZE_KEY, JSON.stringify(snoozed));
  } catch {
    // ignore
  }
}

/**
 * Every nudge that is currently due, oldest interval first. Timers start from
 * the first time the room is opened rather than from midnight — a two-hour
 * stretch reminder means two hours of sitting here.
 *
 * Plural because more than one can come due while the room is left open, and
 * dropping all but the most overdue would quietly lose the others.
 */
export function dueNudges(
  settings: WellnessSettings,
  fired: Partial<Record<NudgeKind, number>>,
  since: number,
  now: number,
  snoozed: Partial<Record<NudgeKind, number>> = {}
): NudgeKind[] {
  const due: Array<{ kind: NudgeKind; overdueBy: number }> = [];
  for (const { kind } of NUDGES) {
    const setting = settings[kind];
    if (!setting.enabled || setting.hours <= 0) continue;
    const until = snoozed[kind];
    if (until !== undefined && now < until) continue;
    const last = fired[kind] ?? since;
    const overdueBy = now - last - setting.hours * 3_600_000;
    if (overdueBy >= 0) due.push({ kind, overdueBy });
  }
  return due.sort((a, b) => b.overdueBy - a.overdueBy).map((d) => d.kind);
}

/**
 * Milliseconds until the soonest enabled nudge is due — what a countdown
 * reads off. Null when nothing is enabled, so there is nothing to count down
 * to. A snooze pushes its own nudge's countdown out to the snooze time
 * without touching how the interval itself is measured.
 */
export function msUntilNextNudge(
  settings: WellnessSettings,
  fired: Partial<Record<NudgeKind, number>>,
  since: number,
  now: number,
  snoozed: Partial<Record<NudgeKind, number>> = {}
): number | null {
  let soonest: number | null = null;
  for (const { kind } of NUDGES) {
    const setting = settings[kind];
    if (!setting.enabled || setting.hours <= 0) continue;
    const last = fired[kind] ?? since;
    const dueAt = last + setting.hours * 3_600_000;
    const snoozeUntil = snoozed[kind];
    const effectiveDueAt = snoozeUntil !== undefined ? Math.max(dueAt, snoozeUntil) : dueAt;
    const remaining = effectiveDueAt - now;
    if (soonest === null || remaining < soonest) soonest = remaining;
  }
  return soonest;
}

/** "just now", "6 min ago", "2h ago" — recency at a glance, not a timestamp */
export function formatAgo(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

/** "42:17", or "1:03:40" past an hour — a countdown reads as a clock, not a duration */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSeconds / 3_600);
  const m = Math.floor((totalSeconds % 3_600) / 60);
  const s = totalSeconds % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

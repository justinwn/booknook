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

/** how long "Snooze" holds a nudge back before it asks again */
export const SNOOZE_MS = 5 * 60_000;

export function loadWellness(): WellnessSettings {
  if (typeof window === "undefined") return DEFAULT_WELLNESS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_WELLNESS;
    const parsed = JSON.parse(raw) as Partial<WellnessSettings>;
    // merge rather than replace, so a new nudge kind doesn't break saved settings
    return {
      water: { ...DEFAULT_WELLNESS.water, ...parsed.water },
      stretch: { ...DEFAULT_WELLNESS.stretch, ...parsed.stretch },
      break: { ...DEFAULT_WELLNESS.break, ...parsed.break },
    };
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
 * The nudge that is most overdue, or null when nothing is. Timers start from
 * the first time the room is opened rather than from midnight — a two-hour
 * stretch reminder means two hours of sitting here.
 */
export function dueNudge(
  settings: WellnessSettings,
  fired: Partial<Record<NudgeKind, number>>,
  since: number,
  now: number,
  snoozed: Partial<Record<NudgeKind, number>> = {}
): NudgeKind | null {
  let best: { kind: NudgeKind; overdueBy: number } | null = null;
  for (const { kind } of NUDGES) {
    const setting = settings[kind];
    if (!setting.enabled || setting.hours <= 0) continue;
    const until = snoozed[kind];
    if (until !== undefined && now < until) continue;
    const last = fired[kind] ?? since;
    const overdueBy = now - last - setting.hours * 3_600_000;
    if (overdueBy >= 0 && (!best || overdueBy > best.overdueBy)) best = { kind, overdueBy };
  }
  return best?.kind ?? null;
}

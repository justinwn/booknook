export interface Reminder {
  id: string;
  text: string;
  done: boolean;
}

const KEY = "librari:reminders";

export function loadReminders(): Reminder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Reminder[]) : [];
  } catch {
    return [];
  }
}

export function saveReminders(reminders: Reminder[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(reminders));
  } catch {
    // storage blocked — the list still works for this session
  }
}

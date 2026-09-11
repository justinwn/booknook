"use client";

import { useEffect, useState } from "react";
import { Trash2, GripVertical, Bell } from "lucide-react";
import { ScenePanel } from "./ScenePanel";
import { loadReminders, saveReminders, type Reminder } from "@/lib/profile/reminders-store";
import { pullLibrary, pushLibrary } from "@/lib/sync/library-sync";
import {
  loadWellness,
  saveWellness,
  mergeWellness,
  NUDGES,
  type NudgeKind,
  type WellnessSettings,
} from "@/lib/profile/wellness-store";

/** a corner-of-the-room list, not a task manager — long enough for what's
 * actually on your mind, short enough to stay scannable at a glance */
const MAX_REMINDERS = 15;

/**
 * A short list of things to come back to — finish a chapter, return a
 * borrowed book. Deliberately plain: it lives in the corner of a room, so it
 * shouldn't behave like a task manager.
 */
export function RemindersPanel({
  onClose,
  onTestNudge,
}: {
  onClose: () => void;
  /** fires one nudge now, without touching its timer */
  onTestNudge: (kind: NudgeKind) => void;
}) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [draft, setDraft] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [wellness, setWellness] = useState<WellnessSettings | null>(null);
  const [loaded, setLoaded] = useState(false);
  /**
   * Hours is still what's stored (fractions and all — 30 minutes is just
   * 0.5), so the unit is purely a display choice per row: whichever one the
   * saved value reads more naturally in, until the reader picks otherwise.
   */
  const [units, setUnits] = useState<Record<NudgeKind, "min" | "hr">>({
    water: "hr",
    stretch: "hr",
    break: "hr",
  });

  function applyWellness(next: WellnessSettings) {
    setWellness(next);
    setUnits({
      water: next.water.hours < 1 ? "min" : "hr",
      stretch: next.stretch.hours < 1 ? "min" : "hr",
      break: next.break.hours < 1 ? "min" : "hr",
    });
  }

  useEffect(() => {
    setReminders(loadReminders());
    applyWellness(loadWellness());
    // the account's copy wins once it arrives, same as the shelves — the
    // nudge schedule is a choice about the reader, not the device, so it
    // follows them the same way
    pullLibrary().then((doc) => {
      if (doc?.reminders) setReminders(doc.reminders);
      if (doc?.wellness) applyWellness(mergeWellness(doc.wellness));
    });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveReminders(reminders);
    pushLibrary({ reminders });
  }, [reminders, loaded]);

  useEffect(() => {
    if (!loaded || !wellness) return;
    saveWellness(wellness);
    pushLibrary({ wellness });
  }, [wellness, loaded]);

  const done = reminders.filter((r) => r.done).length;
  const atCapacity = reminders.length >= MAX_REMINDERS;

  function add() {
    const text = draft.trim();
    if (!text || atCapacity) return;
    setReminders((prev) => [...prev, { id: `r-${Date.now()}`, text, done: false }]);
    setDraft("");
  }

  function clearCompleted() {
    setReminders((prev) => prev.filter((r) => !r.done));
  }

  /** Moves one reminder to another's position, keeping the rest in order. */
  function reorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    setReminders((prev) => {
      const from = prev.findIndex((r) => r.id === fromId);
      const to = prev.findIndex((r) => r.id === toId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  /** Keyboard equivalent of the drag handle — dragging alone isn't reachable. */
  function nudge(id: string, delta: number) {
    setReminders((prev) => {
      const index = prev.findIndex((r) => r.id === id);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <ScenePanel
      title="Reminders"
      onClose={onClose}
      widthClassName="w-[min(21rem,calc(100vw-2rem))] lg:w-[min(28rem,calc(100vw-2rem))]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-body text-xs text-ink-muted">
          {reminders.length === 0
            ? "Nothing to remember yet."
            : `${done} of ${reminders.length} done`}
        </p>
        {done > 0 && (
          <button
            type="button"
            onClick={clearCompleted}
            className="shrink-0 font-body text-[11px] text-ink-muted underline decoration-dotted underline-offset-2 transition-colors hover:text-ink"
          >
            Clear completed tasks
          </button>
        )}
      </div>

      <ul className="mt-3 flex max-h-72 flex-col divide-y divide-border/60 overflow-y-auto pr-1">
        {reminders.map((reminder, index) => (
          <li
            key={reminder.id}
            draggable
            onDragStart={() => setDragId(reminder.id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) reorder(dragId, reminder.id);
              setDragId(null);
            }}
            className={`flex items-center gap-2 py-2.5 transition-opacity ${
              dragId === reminder.id ? "opacity-40" : "opacity-100"
            }`}
          >
            {/* the handle is also the keyboard control — arrow keys move the
                row, so reordering isn't drag-only */}
            <button
              type="button"
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  nudge(reminder.id, -1);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  nudge(reminder.id, 1);
                }
              }}
              aria-label={`Reorder "${reminder.text}" — press the up or down arrow`}
              className="shrink-0 cursor-grab text-ink-soft transition-colors hover:text-ink active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <input
              type="checkbox"
              checked={reminder.done}
              onChange={() =>
                setReminders((prev) =>
                  prev.map((r) => (r.id === reminder.id ? { ...r, done: !r.done } : r))
                )
              }
              aria-label={`Mark "${reminder.text}" ${reminder.done ? "not done" : "done"}`}
              className="h-4 w-4 shrink-0 accent-[var(--color-accent)]"
            />
            <span
              className={`min-w-0 flex-1 break-words font-body text-sm [overflow-wrap:anywhere] ${
                reminder.done ? "text-ink-soft line-through" : "text-ink"
              }`}
            >
              {reminder.text}
            </span>
            <button
              type="button"
              onClick={() => setReminders((prev) => prev.filter((r) => r.id !== reminder.id))}
              aria-label={`Delete "${reminder.text}"`}
              className="shrink-0 rounded-token p-1.5 text-ink-soft transition-colors hover:text-ink"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={atCapacity ? `Up to ${MAX_REMINDERS} at a time` : "What needs doing?"}
          disabled={atCapacity}
          aria-label="New reminder"
          className="min-w-0 flex-1 rounded-token-lg border border-border bg-surface-raised/70 px-3.5 py-2 font-body text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none disabled:opacity-40"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim() || atCapacity}
          className="shrink-0 rounded-token-lg bg-accent px-3.5 py-2 font-body text-xs font-medium text-bg disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {/* the sprite's nudges — recurring, so they live apart from the one-off list */}
      {wellness && (
        <section className="mt-6 border-t border-border/60 pt-4">
          <h3 className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Nudges
          </h3>
          <p className="mt-1 font-body text-[11px] text-ink-soft">
            Your companion walks over to remind you. Ring one to see it.
          </p>

          <ul className="mt-3 flex flex-col gap-2.5">
            {NUDGES.map(({ kind, label }) => {
              const unit = units[kind];
              const bounds = unit === "min" ? { min: 1, max: 59 } : { min: 1, max: 12 };
              const displayValue =
                unit === "min" ? Math.round(wellness[kind].hours * 60) : wellness[kind].hours;

              return (
              <li key={kind} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
                <span className="flex min-w-0 items-center gap-2.5 sm:flex-1">
                  <input
                    type="checkbox"
                    checked={wellness[kind].enabled}
                    onChange={() =>
                      setWellness((prev) =>
                        prev
                          ? { ...prev, [kind]: { ...prev[kind], enabled: !prev[kind].enabled } }
                          : prev
                      )
                    }
                    aria-label={`Nudge me to ${label.toLowerCase()}`}
                    className="h-4 w-4 shrink-0 accent-[var(--color-accent)]"
                  />
                  <span
                    className={`min-w-0 flex-1 font-body text-sm ${
                      wellness[kind].enabled ? "text-ink" : "text-ink-soft"
                    }`}
                  >
                    {label}
                  </span>
                </span>
                <span className="ml-[1.625rem] flex shrink-0 items-center gap-1.5 sm:ml-0">
                  <label className="sr-only" htmlFor={`nudge-${kind}`}>
                    {unit === "min" ? "Minutes" : "Hours"} between {label.toLowerCase()} nudges
                  </label>
                  <input
                    id={`nudge-${kind}`}
                    type="number"
                    min={bounds.min}
                    max={bounds.max}
                    value={displayValue}
                    disabled={!wellness[kind].enabled}
                    onChange={(e) => {
                      const raw = Number(e.target.value) || bounds.min;
                      const clamped = Math.min(bounds.max, Math.max(bounds.min, raw));
                      const hours = unit === "min" ? clamped / 60 : clamped;
                      setWellness((prev) =>
                        prev ? { ...prev, [kind]: { ...prev[kind], hours } } : prev
                      );
                    }}
                    className="w-14 rounded-token border border-border bg-surface-raised/70 px-2 py-1 text-center font-body text-xs tabular-nums text-ink focus:border-accent focus:outline-none disabled:opacity-40"
                  />
                  <label className="sr-only" htmlFor={`nudge-${kind}-unit`}>
                    Unit for {label.toLowerCase()} nudges
                  </label>
                  <select
                    id={`nudge-${kind}-unit`}
                    value={unit}
                    disabled={!wellness[kind].enabled}
                    onChange={(e) =>
                      setUnits((prev) => ({ ...prev, [kind]: e.target.value as "min" | "hr" }))
                    }
                    className="rounded-token border border-border bg-surface-raised/70 px-1.5 py-1 font-body text-[11px] text-ink-soft focus:border-accent focus:outline-none disabled:opacity-40"
                  >
                    <option value="min">min</option>
                    <option value="hr">hr</option>
                  </select>
                  {/* fires this nudge now: the sprite acts it out and the chime
                      plays, but the real timer is left where it was */}
                  <button
                    type="button"
                    onClick={() => onTestNudge(kind)}
                    aria-label={`Test the ${label.toLowerCase()} nudge`}
                    title="Show this nudge now"
                    className="rounded-token border border-border p-1.5 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
                  >
                    <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </span>
              </li>
              );
            })}
          </ul>
        </section>
      )}
    </ScenePanel>
  );
}

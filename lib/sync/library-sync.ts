"use client";

import { getSupabaseClient } from "@/lib/supabase/client";
import type { Book } from "@/lib/types";
import type { Reminder } from "@/lib/profile/reminders-store";
import type { WellnessSettings } from "@/lib/profile/wellness-store";

/**
 * The reader's library, as it is stored on their account.
 *
 * Every field here is content they typed or chose and would be upset to lose
 * or not find waiting on the next device. The ambient mix stays local by
 * itself — "quiet on my work laptop, loud at home" is a sane thing to want —
 * but the nudge schedule is a choice about the reader, not the device, so it
 * follows them the same as their reminders do.
 */
export interface LibraryDoc {
  books: Book[];
  featured: (string | null)[];
  reminders: Reminder[];
  displayName: string;
  wellness: WellnessSettings;
}

const TABLE = "libraries";

/**
 * Pushes are queued rather than sent per keystroke, and never sent before the
 * cloud copy has been read: an empty local library must not be able to
 * overwrite a full remote one during the first second after a sign-in.
 */
let hydrated = false;
let queued: Partial<LibraryDoc> = {};
let timer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 700;

/** true once this session has read (or established) the remote copy */
export function isHydrated(): boolean {
  return hydrated;
}

async function currentUserId(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * Reads the account's library. Returns null when there is nothing to read —
 * demo mode, signed out, or a brand-new account with no row yet — and the
 * caller should keep whatever it has locally.
 */
export async function pullLibrary(): Promise<Partial<LibraryDoc> | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    hydrated = true; // demo mode: local is the only copy, so writes are safe
    return null;
  }

  const id = await currentUserId();
  if (!id) {
    hydrated = true;
    return null;
  }

  const { data, error } = await supabase.from(TABLE).select("data").eq("id", id).maybeSingle();
  hydrated = true;
  if (error || !data?.data) return null;

  const doc = data.data as Partial<LibraryDoc>;
  return {
    books: Array.isArray(doc.books) ? doc.books : undefined,
    featured: Array.isArray(doc.featured) ? doc.featured : undefined,
    reminders: Array.isArray(doc.reminders) ? doc.reminders : undefined,
    displayName: typeof doc.displayName === "string" ? doc.displayName : undefined,
    wellness: doc.wellness && typeof doc.wellness === "object" ? doc.wellness : undefined,
  };
}

/**
 * Writes a patch straight through. The row is read first so a patch touching
 * only `books` cannot drop the featured shelf that came with it.
 */
async function flush(patch: Partial<LibraryDoc>): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const id = await currentUserId();
  if (!id) return;

  const { data } = await supabase.from(TABLE).select("data").eq("id", id).maybeSingle();
  const merged = { ...((data?.data as Partial<LibraryDoc>) ?? {}), ...patch };

  const { error } = await supabase.from(TABLE).upsert({ id, data: merged });
  if (error) {
    // A failed sync is not worth interrupting the reader over: the local copy
    // is intact and the next change tries again.
    console.warn("[booknook] library sync failed:", error.message);
  }
}

/** Queues a patch. Safe to call on every keystroke. */
export function pushLibrary(patch: Partial<LibraryDoc>): void {
  queued = { ...queued, ...patch };
  if (!hydrated) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    const sending = queued;
    queued = {};
    timer = null;
    void flush(sending);
  }, DEBOUNCE_MS);
}

/** Sends anything still queued right away, e.g. before signing out. */
export async function flushLibrary(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!Object.keys(queued).length) return;
  const sending = queued;
  queued = {};
  await flush(sending);
}

/**
 * Forgets this session's sync state. Called on sign-out so the next reader on
 * this browser cannot have their first local write land on the last reader's
 * row before their own copy has been read.
 */
export function resetSync(): void {
  hydrated = false;
  queued = {};
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

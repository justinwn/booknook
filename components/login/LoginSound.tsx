"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Volume2, VolumeX } from "lucide-react";

const OPEN_SFX = "/assets/audio/book-open.mp3";
const THEME = "/assets/audio/login-theme.mp3";
const SFX_VOLUME = 0.55;
const THEME_VOLUME = 0.2;
const FADE_MS = 1400;
/**
 * The cover holds still for the first 18% of `book-leaf-open` (1500ms) before
 * it starts to swing, so the sound waits the same 270ms. Both are started by
 * the same mount, so the two stay in step without measuring anything.
 */
const LEAF_HOLD_MS = 270;
/**
 * Versioned: sound now defaults on, and the old key holds "off" for anyone
 * who switched it off while it was being built. Bumping the name retires
 * those without touching the reader's ability to switch it off again.
 */
const KEY = "librari:login-sound-v2";

function loadPreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

/**
 * Sound for the door: the book makes a noise as it opens, and the theme comes
 * up under it once it has.
 *
 * Browsers refuse audio that no one asked for, so nothing here assumes it can
 * play. Both attempts are made anyway — a reader who has been here before has
 * usually earned the permission. The open sound gets one shot, on the beat
 * the cover starts to swing, and a refusal ends it: replaying it later would
 * be a book opening after the book has opened. The music has no such moment,
 * so if it is refused the next click or keypress anywhere brings it up.
 */
export function LoginSound({ opened, className }: { opened: boolean; className?: string }) {
  /** true when the page skipped the animation (reduced motion) */
  const [openedAtMount] = useState(opened);
  const [on, setOn] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [ready, setReady] = useState(false);

  const themeRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sfxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopFade = () => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  };

  /** ramps the theme to a target level; pauses at the bottom of a fade out */
  const fadeTo = useCallback((target: number) => {
    const el = themeRef.current;
    if (!el) return;
    stopFade();
    const step = 40;
    const delta = (target - el.volume) / (FADE_MS / step);
    fadeRef.current = setInterval(() => {
      const next = el.volume + delta;
      const done = delta >= 0 ? next >= target : next <= target;
      el.volume = Math.min(1, Math.max(0, done ? target : next));
      if (!done) return;
      stopFade();
      if (target === 0) el.pause();
    }, step);
  }, []);

  const playSfx = useCallback(() => {
    const sfx = new Audio(OPEN_SFX);
    sfx.volume = SFX_VOLUME;
    // refused by the autoplay policy on a cold visit: the swing is the only
    // moment this sound belongs to, so a refusal is the end of it rather than
    // something to replay later out of context
    sfx.play().catch(() => undefined);
  }, []);

  const startTheme = useCallback(() => {
    const el = themeRef.current;
    if (!el) return Promise.resolve(false);
    if (!el.paused) return Promise.resolve(true);
    el.volume = 0;
    return el
      .play()
      .then(() => {
        fadeTo(THEME_VOLUME);
        return true;
      })
      .catch(() => false);
  }, [fadeTo]);

  // one theme element for the life of the page, and the reader's last choice
  useEffect(() => {
    const wanted = loadPreference();
    setOn(wanted);
    setReady(true);

    const theme = new Audio(THEME);
    theme.loop = true;
    theme.preload = "auto";
    theme.volume = 0;
    themeRef.current = theme;

    // The cover swings on mount, so the sound is scheduled from the same
    // moment: on the beat the leaf starts moving, and on every refresh,
    // because this effect runs once per mount. A reduced-motion visit has no
    // swing to wait for, so it plays at once.
    if (wanted) {
      const delay = openedAtMount ? 0 : LEAF_HOLD_MS;
      sfxTimerRef.current = setTimeout(() => {
        sfxTimerRef.current = null;
        playSfx();
      }, delay);
    }

    return () => {
      stopFade();
      if (sfxTimerRef.current) clearTimeout(sfxTimerRef.current);
      theme.pause();
      themeRef.current = null;
    };
    // openedAtMount and playSfx are stable for the life of the component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the theme belongs to the open book, not to the closed one
  useEffect(() => {
    if (!ready || !opened || !on || blocked) return;
    let cancelled = false;
    startTheme().then((played) => {
      if (!played && !cancelled) setBlocked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, opened, on, blocked, startTheme]);

  // refused once: the next thing the reader does anywhere is permission enough
  useEffect(() => {
    if (!blocked || !on) return;
    const release = () => setBlocked(false);
    window.addEventListener("pointerdown", release, { once: true });
    window.addEventListener("keydown", release, { once: true });
    return () => {
      window.removeEventListener("pointerdown", release);
      window.removeEventListener("keydown", release);
    };
  }, [blocked, on]);

  function toggle() {
    const next = !on;
    setOn(next);
    try {
      window.localStorage.setItem(KEY, next ? "on" : "off");
    } catch {
      // storage blocked — the choice holds for this visit
    }

    if (!next) {
      fadeTo(0);
      return;
    }
    // a click is a gesture, so this attempt is never refused
    setBlocked(false);
    if (opened) void startTheme();
  }

  // the control belongs to the open book: there is nothing to turn off while
  // the cover is still shut, and it would sit on the leather looking like a
  // sticker. The component stays mounted throughout, so the open sound still
  // fires at the moment the page arrives.
  if (!opened) return null;

  const label = on ? "Turn sound off" : "Turn sound on";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={clsx(
        // plain: it sits on the page it belongs to, so a plate around it would
        // read as a control bolted onto the book rather than printed on it
        "inline-flex items-center gap-2 bg-transparent font-body text-[13px] transition-opacity",
        on ? "text-gallery-ink/70 hover:text-gallery-ink" : "text-gallery-ink/35 hover:text-gallery-ink/60",
        className
      )}
    >
      {on ? (
        <Volume2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      ) : (
        <VolumeX className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      )}
      Sound
    </button>
  );
}

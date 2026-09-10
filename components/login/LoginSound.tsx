"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Volume2, VolumeX } from "lucide-react";

const OPEN_SFX = "/assets/audio/book-open.mp3";
const THEME = "/assets/audio/login-theme.mp3";
const SFX_VOLUME = 0.55;
const THEME_VOLUME = 0.32;
const FADE_MS = 1400;
const KEY = "librari:login-sound";

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
 * play. The first attempt is made anyway — a reader who has been here before
 * has usually earned the permission — and if it is refused, the toggle shows
 * itself as off and the next click or keypress anywhere on the page starts the
 * music. The sound effect is not replayed in that case: the moment it belonged
 * to has passed, and a book opening after the book has opened is worse than
 * silence.
 */
export function LoginSound({ opened, className }: { opened: boolean; className?: string }) {
  const [on, setOn] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [ready, setReady] = useState(false);

  const themeRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    // the book's own sound, at the moment the page arrives
    if (wanted) {
      const sfx = new Audio(OPEN_SFX);
      sfx.volume = SFX_VOLUME;
      sfx.play().catch(() => setBlocked(true));
    }

    return () => {
      stopFade();
      theme.pause();
      themeRef.current = null;
    };
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

  const label = on ? "Turn sound off" : "Turn sound on";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-body text-[13px] transition-colors",
        "backdrop-blur-sm",
        on
          ? "border-gallery-ink/10 bg-white/75 text-gallery-ink hover:bg-white"
          : "border-gallery-ink/10 bg-white/45 text-gallery-ink/45 hover:bg-white/70",
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

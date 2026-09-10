"use client";

import { useEffect, useRef } from "react";
import { AMBIENT_TRACKS, type AmbientSettings } from "@/lib/audio/ambient";

/**
 * Playback lives here rather than in the panel: the panel is closed most of
 * the time, and unmounting it must not stop the room's sound. One looping
 * element per switched-on bed, mounted for as long as that bed is on.
 */
export function AmbientEngine({ settings }: { settings: AmbientSettings }) {
  return (
    <>
      {AMBIENT_TRACKS.filter((track) => settings[track.id]?.on).map((track) => (
        <AmbientBed key={track.id} src={track.src} volume={settings[track.id].volume} />
      ))}
    </>
  );
}

const FADE_MS = 700;

function AmbientBed({ src, volume }: { src: string; volume: number }) {
  const ref = useRef<HTMLAudioElement>(null);
  const target = useRef(volume);
  const fadedIn = useRef(false);
  target.current = volume;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // fade in rather than cutting in at full level; the ramp reads the live
    // target, so moving the slider mid-fade still lands on the right level
    el.volume = 0;
    const started = performance.now();
    let frame = requestAnimationFrame(function ramp(now) {
      // clamped at both ends: rAF hands back the frame's start time, which can
      // predate `started` and would otherwise make this a negative volume
      const t = Math.min(1, Math.max(0, (now - started) / FADE_MS));
      el.volume = Math.min(1, Math.max(0, target.current * t));
      if (t < 1) frame = requestAnimationFrame(ramp);
      else fadedIn.current = true;
    });

    /**
     * Switching a bed on by hand plays straight away — the click is the
     * gesture. A room that opens with its default bed already on has had no
     * interaction yet, so the browser refuses; rather than leaving it silent,
     * the first touch anywhere on the page starts it.
     */
    let waiting: (() => void) | null = null;
    void el.play().catch(() => {
      waiting = () => {
        void el.play().catch(() => {});
        detach();
      };
      document.addEventListener("pointerdown", waiting);
      document.addEventListener("keydown", waiting);
    });

    function detach() {
      if (!waiting) return;
      document.removeEventListener("pointerdown", waiting);
      document.removeEventListener("keydown", waiting);
      waiting = null;
    }

    return () => {
      cancelAnimationFrame(frame);
      detach();
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    // the fade owns the level until it finishes, then the slider does
    if (el && fadedIn.current) el.volume = volume;
  }, [volume]);

  return <audio ref={ref} src={src} loop preload="auto" />;
}

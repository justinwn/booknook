"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

interface WallpaperProps {
  src: string;
  poster: string;
  className?: string;
  /** darkening pass so overlaid text stays legible */
  scrim?: "none" | "light" | "medium" | "heavy";
}

const SCRIMS = {
  none: "",
  light: "bg-black/20",
  medium: "bg-black/40",
  heavy: "bg-black/60",
} as const;

/**
 * The living background. The poster frame paints immediately and the loop
 * fades in over it once it can play, so the page never starts on a blank
 * rectangle. When the viewer prefers reduced motion the video is never
 * mounted at all — they get the still frame, which is the same picture.
 */
export function Wallpaper({ src, poster, className, scrim = "medium" }: WallpaperProps) {
  const [motionOk, setMotionOk] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionOk(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className={clsx("absolute inset-0 overflow-hidden", className)} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />

      {motionOk && (
        <video
          key={src}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setPlaying(true)}
          className={clsx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-gentle",
            playing ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {scrim !== "none" && <div className={clsx("absolute inset-0", SCRIMS[scrim])} />}
    </div>
  );
}

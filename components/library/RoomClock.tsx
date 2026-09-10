"use client";

import { useEffect, useState } from "react";
import type { PaperTreatment } from "@/lib/theme/themes";

/**
 * The time, in the room's own hand. Ticks on the minute rather than the
 * second — a wall clock in a reading room shouldn't be counting at you.
 * Rendered only after mount, since the server has no idea what time it is
 * where the reader is.
 */
export function RoomClock({ paper }: { paper: PaperTreatment }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    // line up the first tick with the turn of the minute, then run every minute
    const toNextMinute = (60 - new Date().getSeconds()) * 1000;
    let interval: number;
    const timeout = window.setTimeout(() => {
      tick();
      interval = window.setInterval(tick, 60_000);
    }, toNextMinute);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  if (!now) return <div className="h-[8.5rem]" aria-hidden />;

  const date = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "2-digit",
  });
  const time = now
    .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true })
    .replace(/\s/g, "");

  return (
    <div className="select-none drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
      {/* both lines sit 30% up from where they were, then scaled per theme */}
      <p
        className="text-[calc(1.3rem*var(--clock-scale))] text-white/85 sm:text-[calc(1.625rem*var(--clock-scale))]"
        style={{ fontFamily: paper.fontBody, ["--clock-scale" as string]: paper.clockScale ?? 1 }}
      >
        {date}
      </p>
      <p
        className="text-[calc(4.875rem*var(--clock-scale))] leading-none text-white sm:text-[calc(5.85rem*var(--clock-scale))]"
        style={{
          fontFamily: paper.fontDisplay,
          letterSpacing: paper.displayTracking,
          ["--clock-scale" as string]: paper.clockScale ?? 1,
        }}
      >
        <time dateTime={now.toISOString()}>{time}</time>
      </p>
    </div>
  );
}

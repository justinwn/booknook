"use client";

import { useState } from "react";
import type { ShelfHotspot } from "@/lib/theme/themes";

interface ShelfHotspotsProps {
  hotspots: ShelfHotspot[];
  onOpen: (id: string, center: { x: number; y: number }) => void;
}

/**
 * The bookshelves inside the wallpaper, made clickable. Regions are declared
 * per theme as percentages of the scene, so the artwork stays artwork — the
 * same separation the shelf slot maps use.
 *
 * They stay invisible until pointed at: the room should look like a room,
 * and only reveal it is interactive when the cursor is over something.
 */
export function ShelfHotspots({ hotspots, onOpen }: ShelfHotspotsProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="absolute inset-0">
      {hotspots.map((spot) => (
        <button
          key={spot.id}
          type="button"
          aria-label={spot.label ?? "Open these shelves"}
          onMouseEnter={() => setHovered(spot.id)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(spot.id)}
          onBlur={() => setHovered(null)}
          onClick={() =>
            onOpen(spot.id, { x: spot.x + spot.width / 2, y: spot.y + spot.height / 2 })
          }
          className="group absolute cursor-zoom-in rounded-token transition-all duration-300 ease-gentle"
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: `${spot.width}%`,
            height: `${spot.height}%`,
            boxShadow:
              hovered === spot.id
                ? "inset 0 0 0 2px rgba(255,255,255,0.55), 0 0 42px rgba(255,236,200,0.28)"
                : "inset 0 0 0 0 rgba(255,255,255,0)",
            background:
              hovered === spot.id
                ? "radial-gradient(60% 60% at 50% 50%, rgba(255,240,214,0.18), rgba(255,240,214,0.04))"
                : "transparent",
          }}
        >
          <span
            className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-black/65 px-3 py-1.5 font-body text-[11px] font-medium text-white backdrop-blur-sm transition-opacity duration-200 ${
              hovered === spot.id ? "opacity-100" : "opacity-0"
            }`}
          >
            {spot.label ?? "Open shelves"}
          </span>
        </button>
      ))}
    </div>
  );
}

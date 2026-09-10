"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import type { ShelfHotspot } from "@/lib/theme/themes";

interface RoomSceneProps {
  hotspots: ShelfHotspot[];
  /** true while the room is travelling toward a shelf; panning is off then */
  zoomed: boolean;
  children: ReactNode;
}

/** the wallpapers are 16:9; the scene is never narrower than that at full height */
const SCENE_ASPECT = 16 / 9;

/**
 * The room, wide enough to be a room.
 *
 * On a landscape screen the scene is exactly the viewport and nothing scrolls.
 * On a phone, cropping a 16:9 scene to a portrait viewport throws away most of
 * it — including, usually, the shelves. So the scene keeps its full width and
 * the viewport pans across it, opening centred on the largest bookshelf so the
 * first thing on screen is the thing you came for.
 */
export function RoomScene({ hotspots, zoomed, children }: RoomSceneProps) {
  const viewport = useRef<HTMLDivElement>(null);

  /** the biggest shelf in the scene is the one worth opening on */
  const focus = hotspots.reduce<ShelfHotspot | null>(
    (best, spot) =>
      !best || spot.width * spot.height > best.width * best.height ? spot : best,
    null
  );

  useLayoutEffect(() => {
    const el = viewport.current;
    if (!el || !focus) return;
    const centreOnShelf = () => {
      const overflow = el.scrollWidth - el.clientWidth;
      if (overflow <= 0) return;
      const centre = ((focus.x + focus.width / 2) / 100) * el.scrollWidth;
      el.scrollLeft = Math.min(Math.max(0, centre - el.clientWidth / 2), overflow);
    };
    centreOnShelf();
    // a rotation changes what fits, so the shelf is re-found rather than left
    // wherever the old scroll position happened to land
    const observer = new ResizeObserver(centreOnShelf);
    observer.observe(el);
    return () => observer.disconnect();
  }, [focus?.id, focus?.x, focus?.width]);

  return (
    <div
      ref={viewport}
      className={`absolute inset-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        // the zoom scales the scene far past its box; letting that scroll would
        // fight the transition
        zoomed ? "overflow-hidden" : "overflow-x-auto overflow-y-hidden"
      }`}
    >
      <div
        className="relative h-full"
        style={{ width: `max(100%, calc(100vh * ${SCENE_ASPECT}))` }}
      >
        {children}
      </div>
    </div>
  );
}

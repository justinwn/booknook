"use client";

import type { ReactNode } from "react";
import type { ThemeId } from "@/lib/types";

/**
 * Dresses a card in its room's materials. The decoration is drawn as SVG
 * layered around the card rather than baked into an image, so it scales with
 * the card and recolours with the theme. Everything here is
 * `pointer-events-none` — it is scenery, and must never eat a click meant for
 * the form underneath.
 */

/**
 * The cozy room's card is a window on a desk at night: a title bar with the
 * usual three glyphs, a faint dot grid on the "canvas", and neon along the
 * top edge in the room's own blues and violets. Chrome only — the form sits
 * inside it untouched.
 */
function BrowserChrome({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[10px]">
      {/* one flat fill: the window is a surface to read a form on, not a
          scene of its own */}
      <div className="absolute inset-0" style={{ background: "rgba(28,25,44,0.97)" }} aria-hidden />

      <div
        className="relative flex items-center gap-3 px-4 py-2.5"
        style={{
          background: "rgba(58,51,92,0.72)",
          borderBottom: "1px solid rgba(178,168,255,0.22)",
        }}
      >
        <span className="flex gap-1.5" aria-hidden>
          {["#ff8fbf", "#ffd88a", "#8fe3c8"].map((c) => (
            <span
              key={c}
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: c, boxShadow: `0 0 8px ${c}80` }}
            />
          ))}
        </span>
        <span className="flex-1 text-center font-body text-[10px] uppercase tracking-[0.22em] text-white/70">
          [ new entry ]
        </span>
        <span className="flex flex-col gap-[3px]" aria-hidden>
          {[10, 7, 10].map((w, i) => (
            <span key={i} className="h-[2px] rounded-full bg-white/45" style={{ width: w }} />
          ))}
        </span>
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}

function GardenButterflies() {
  // one settling at the top corner, one further down the other side
  const spots = [
    { className: "-top-8 -left-7 h-24 w-24 rotate-[-12deg]", opacity: 0.85 },
    { className: "-bottom-6 -right-6 h-16 w-16 rotate-[14deg]", opacity: 0.6 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {spots.map((spot) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={spot.className}
          src="/assets/decor/butterfly.svg"
          alt=""
          className={`absolute drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] ${spot.className}`}
          style={{ opacity: spot.opacity }}
        />
      ))}
    </div>
  );
}

function MinecraftPixels({ radiusless = true }: { radiusless?: boolean }) {
  // a stepped outline: squares stacked outward at each corner read as pixels
  const steps = [
    { x: 0, y: 0 },
    { x: 12, y: 0 },
    { x: 0, y: 12 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0 border-[6px]"
        style={{ borderColor: "#7a5a34", borderRadius: radiusless ? 0 : 4 }}
      />
      <div className="absolute inset-[6px] border-[3px]" style={{ borderColor: "#a67c46" }} />
      {[
        { top: -12, left: -12 },
        { top: -12, right: -12 },
        { bottom: -12, left: -12 },
        { bottom: -12, right: -12 },
      ].map((pos, i) => (
        <div key={i} className="absolute h-6 w-6" style={pos}>
          {steps.map((s, j) => (
            <span
              key={j}
              className="absolute h-3 w-3"
              style={{
                background: j === 0 ? "#7a5a34" : "#a67c46",
                left: s.x,
                top: s.y,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Perforated edges, the way a stamp is punched: four repeating rows of holes,
 * intersected so a corner keeps both its neighbours' notches. `intersect` is
 * the modern spelling; webkit needs `source-in` for the same thing.
 */
const STAMP_MASK: React.CSSProperties = {
  ["--notch" as string]: "7px",
  ["--pitch" as string]: "22px",
  maskImage: [
    "radial-gradient(var(--notch) at 50% 0, #0000 99%, #000)",
    "radial-gradient(var(--notch) at 50% 100%, #0000 99%, #000)",
    "radial-gradient(var(--notch) at 0 50%, #0000 99%, #000)",
    "radial-gradient(var(--notch) at 100% 50%, #0000 99%, #000)",
  ].join(","),
  maskPosition: "50% 0, 50% 100%, 0 50%, 100% 50%",
  maskSize: "var(--pitch) 100%, var(--pitch) 100%, 100% var(--pitch), 100% var(--pitch)",
  maskRepeat: "repeat-x, repeat-x, repeat-y, repeat-y",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as React.CSSProperties;

/**
 * Dark academia keeps a hairline rule around the card and nothing else: a
 * plate in a monograph, squared off, with a second rule inside it.
 */
function AcademiaRules() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 border border-white/45" />
      <div className="absolute inset-[5px] border border-white/16" />
    </div>
  );
}

const BACKGROUNDS: Partial<Record<ThemeId, string>> = {
  "cozy-room":
    "linear-gradient(155deg, rgba(72,64,116,0.92), rgba(38,34,60,0.94) 55%, rgba(26,24,42,0.96))",
  "magical-garden":
    "linear-gradient(155deg, rgba(58,42,92,0.92), rgba(30,22,52,0.95))",
  "seaside-cafe":
    "linear-gradient(155deg, rgba(255,255,255,0.94), rgba(226,240,238,0.96))",
  minecraft: "linear-gradient(180deg, rgba(52,42,30,0.96), rgba(34,27,18,0.97))",
  "dark-academia": "linear-gradient(170deg, rgba(24,24,26,0.97), rgba(11,11,12,0.98))",
};

export function ThemedFrame({
  themeId,
  className,
  children,
}: {
  themeId: ThemeId;
  className?: string;
  children: ReactNode;
}) {
  const stamped = themeId === "seaside-cafe";

  // the cozy room brings its own surface, so the shared background layer and
  // its radius would only sit behind the window frame
  if (themeId === "cozy-room") {
    return (
      <div data-theme={themeId} className={`relative ${className ?? ""}`}>
        <BrowserChrome>{children}</BrowserChrome>
      </div>
    );
  }

  return (
    // the frame carries its own theme, so anything inside resolves against
    // the room's tokens rather than whatever page it happens to sit on
    <div
      data-theme={themeId}
      className={`relative ${className ?? ""}`}
      // a box-shadow would draw a hard rectangle around a notched card, so the
      // stamp casts its own shadow from its actual silhouette instead
      style={stamped ? { boxShadow: "none" } : undefined}
    >
      {/* the card's material is its own layer: a mask on the parent would
          punch holes in the form as well as in the paper it sits on */}
      <div
        className="absolute inset-0"
        style={stamped ? { filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.38))" } : undefined}
        aria-hidden
      >
        <div
          className="h-full w-full"
          style={{
            background: BACKGROUNDS[themeId],
            borderRadius: stamped ? 0 : "var(--radius-lg)",
            ...(stamped ? STAMP_MASK : {}),
          }}
        />
      </div>

      {themeId === "magical-garden" && <GardenButterflies />}
      {themeId === "minecraft" && <MinecraftPixels />}
      {themeId === "dark-academia" && <AcademiaRules />}
      <div className="relative">{children}</div>
    </div>
  );
}

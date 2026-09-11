"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ThemeId } from "@/lib/types";
import type { PaperTreatment } from "@/lib/theme/themes";
import {
  dueNudge,
  formatCountdown,
  loadFired,
  loadSince,
  loadSnoozed,
  loadWellness,
  markFired,
  msUntilNextNudge,
  NUDGES,
  snoozeNudge,
  type NudgeKind,
} from "@/lib/profile/wellness-store";
import { REMINDER_SRC, REMINDER_VOLUME } from "@/lib/audio/ambient";

/**
 * SPRITES
 *
 * One set per theme. Each clip is a horizontal strip of equal, transparent
 * cells — `frames` says how many, and sheets differ, so it is per clip rather
 * than per set. `actions` decides what the character does for each nudge, so
 * a sheet without a "drink" pose can act it out however suits it.
 *
 * To add a theme: drop the strips into public/assets/sprites and add a set.
 */
interface Clip {
  src: string;
  frames: number;
}

interface SpriteSet {
  /** rendered size of one cell */
  width: number;
  height: number;
  /** a filter over the sprite, for a room that admits no colour */
  filter?: string;
  idle: Clip;
  walk: Clip;
  actions: Record<NudgeKind, Clip>;
  /** what this character says — written in its own voice, not a generic string */
  lines: Record<NudgeKind, string>;
}

const minecraft: SpriteSet = {
  // cells are 20x17 on the sheet, drawn at a whole 5x so the pixels stay square
  width: 100,
  height: 85,
  idle: { src: "/assets/sprites/minecraft-idle.png", frames: 1 },
  walk: { src: "/assets/sprites/minecraft-walk.png", frames: 4 },
  actions: {
    // this sheet has no potion; the raised-arm frame reads as holding a
    // drink up, and punch keeps the meaning it had before
    water: { src: "/assets/sprites/minecraft-toast.png", frames: 1 },
    stretch: { src: "/assets/sprites/minecraft-jump.png", frames: 2 },
    break: { src: "/assets/sprites/minecraft-punch.png", frames: 6 },
  },
  lines: {
    water: "Hydration potion! Drink up before your hearts run low.",
    stretch: "*jumps in place* Come on, stretch those legs with me.",
    break: "Put the pickaxe down. Take a break before you hit bedrock.",
  },
};

// the guinea pig sheet has no "drink" row, so eating stands in for it, and
// sitting still reads as taking a break
const cozyRoom: SpriteSet = {
  width: 92,
  height: 87,
  idle: { src: "/assets/sprites/cozy-room-idle.png", frames: 5 },
  walk: { src: "/assets/sprites/cozy-room-walk.png", frames: 4 },
  actions: {
    water: { src: "/assets/sprites/cozy-room-eat.png", frames: 5 },
    stretch: { src: "/assets/sprites/cozy-room-jump.png", frames: 5 },
    break: { src: "/assets/sprites/cozy-room-idle.png", frames: 5 },
  },
  lines: {
    water: "*nom nom nom* ...oh! Your water bowl looks empty too.",
    stretch: "*wheek!* Zoomies time. Up you get, have a stretch.",
    break: "*burrows into the hay* Come rest with me for a minute.",
  },
};

// the mage's rows are unlabelled; these are read off the poses — a spell
// being drawn up close for the drink, a leap, and a cast for the break
const magicalGarden: SpriteSet = {
  // 20% larger than the other cells: the mage reads small at 92
  width: 110,
  height: 104,
  idle: { src: "/assets/sprites/magical-garden-idle.png", frames: 4 },
  walk: { src: "/assets/sprites/magical-garden-walk.png", frames: 5 },
  actions: {
    water: { src: "/assets/sprites/magical-garden-potion.png", frames: 5 },
    stretch: { src: "/assets/sprites/magical-garden-jump.png", frames: 5 },
    break: { src: "/assets/sprites/magical-garden-fist.png", frames: 4 },
  },
  lines: {
    water: "Your elixir has run dry. Refill it. Water will do.",
    stretch: "Rise and stretch. No spell holds from a slouched stance.",
    break: "Even the studious must rest. Step away from the page.",
  },
};

// the shiba's sheet has no drink pose: the bark row (its clean first two
// frames, before the bite effect) reads as the dog getting your attention,
// the walk row as "let's go", and the last row, a flop to the floor, as rest
const seasideCafe: SpriteSet = {
  // the source cells are 48x25; rendered at a whole 3x so the pixels stay
  // square, and big enough to hold its own beside the clock
  width: 144,
  height: 75,
  idle: { src: "/assets/sprites/seaside-cafe-idle.png", frames: 4 },
  walk: { src: "/assets/sprites/seaside-cafe-walk.png", frames: 6 },
  actions: {
    water: { src: "/assets/sprites/seaside-cafe-bark.png", frames: 2 },
    stretch: { src: "/assets/sprites/seaside-cafe-walk.png", frames: 6 },
    break: { src: "/assets/sprites/seaside-cafe-rest.png", frames: 4 },
  },
  lines: {
    water: "*noses your glass* That's empty. Mine is too, while you're up.",
    stretch: "*tail going* Walk? Round the block counts.",
    break: "*flops onto the floor* Down here. Ten minutes. Come on.",
  },
};

// the knight's sheet has no drink pose: the raised shield is the closest to
// a "stop and take this", the leap is the stretch, and the last row — down on
// the ground with the sword planted — reads as resting rather than dying
const darkAcademia: SpriteSet = {
  // 88x81 cells, drawn at a whole 1.4x… kept at native size so the pixels stay
  // square, and scaled to sit beside the clock
  width: 132,
  height: 122,
  filter: "grayscale(1) contrast(1.08)",
  idle: { src: "/assets/sprites/dark-academia-idle.png", frames: 4 },
  walk: { src: "/assets/sprites/dark-academia-walk.png", frames: 8 },
  actions: {
    water: { src: "/assets/sprites/dark-academia-guard.png", frames: 5 },
    stretch: { src: "/assets/sprites/dark-academia-jump.png", frames: 6 },
    break: { src: "/assets/sprites/dark-academia-rest.png", frames: 6 },
  },
  lines: {
    water: "A siege is lost on thirst before it is lost on walls. Drink.",
    stretch: "*rolls a shoulder* Up. A body left still stiffens in the armour.",
    break: "*sets the sword down* Even the watch is relieved. Rest.",
  },
};

const SPRITES: Record<ThemeId, SpriteSet> = {
  minecraft,
  "cozy-room": cozyRoom,
  "magical-garden": magicalGarden,
  "seaside-cafe": seasideCafe,
  "dark-academia": darkAcademia,
};

/** kept in step with the bubble-out keyframes in globals.css */
const BUBBLE_OUT_MS = 320;

export function WellnessSprite({
  themeId,
  paper,
  onOpenSettings,
  previewNudge = null,
  onPreviewEnd,
}: {
  themeId: ThemeId;
  paper: PaperTreatment;
  onOpenSettings: () => void;
  /** a nudge fired from the settings Test button, shown without arming anything */
  previewNudge?: NudgeKind | null;
  onPreviewEnd?: () => void;
}) {
  const sprite = SPRITES[themeId] ?? minecraft;
  const [nudge, setNudge] = useState<NudgeKind | null>(null);
  /**
   * A previewed nudge takes the stage over a real one. It behaves identically
   * on screen, but Done and Snooze only clear it: a test must not reset a
   * timer or write a snooze, or testing would quietly move the real schedule.
   */
  const active = previewNudge ?? nudge;
  const [travel, setTravel] = useState(0);
  /** true while the bubble plays its exit; the nudge clears when it finishes */
  const [exiting, setExiting] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  /** persisted, so a reload doesn't quietly restart the wait — see loadSince */
  const since = useRef<number | null>(null);
  if (since.current === null) since.current = loadSince();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  /**
   * The stroll spans the whole clock below rather than a fixed distance, so
   * the character never turns around in the middle of nowhere.
   */
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setTravel(Math.max(0, el.offsetWidth - sprite.width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sprite.width]);

  useEffect(() => {
    const tick = () => {
      const settings = loadWellness();
      const fired = loadFired();
      const snoozed = loadSnoozed();
      const now = Date.now();
      setNudge((current) => current ?? dueNudge(settings, fired, since.current!, now, snoozed));
      setRemainingMs(msUntilNextNudge(settings, fired, since.current!, now, snoozed));
    };
    tick();
    // once a second, so the countdown reads as one and a snooze comes back
    // exactly on time rather than up to a minute late
    const id = window.setInterval(tick, 1_000);
    return () => window.clearInterval(id);
  }, []);

  /**
   * The nudge announces itself. One element, reused, so a nudge arriving
   * while the last chime is still ringing restarts it rather than stacking.
   */
  const chime = useRef<HTMLAudioElement | null>(null);
  function ensureChime(): HTMLAudioElement {
    if (!chime.current) {
      chime.current = new Audio(REMINDER_SRC);
      chime.current.volume = REMINDER_VOLUME;
    }
    return chime.current;
  }

  /**
   * Only ever rung by the bell in the reminder settings — a real nudge
   * arriving on its own shows the bubble silently. A chime that fires from a
   * timer lands without warning, at whatever the room's volume happens to be,
   * and reads as the page making noise at random.
   */
  useEffect(() => {
    if (!previewNudge) return;
    const el = ensureChime();
    el.currentTime = 0;
    void el.play().catch(() => {});
  }, [previewNudge]);

  // a new nudge always starts from a clean state, never mid-exit
  useEffect(() => {
    if (active) setExiting(false);
  }, [active]);

  // the character speaks in its own voice; NUDGES holds the plain-text
  // fallback for a sprite set that hasn't been given lines
  const message = useMemo(
    () =>
      active
        ? sprite.lines[active] ?? NUDGES.find((n) => n.kind === active)?.message ?? ""
        : "",
    [active, sprite]
  );

  /**
   * Both answers dismiss the same way: play the bubble out, then commit. The
   * commit is deferred rather than run first so the message is still on screen
   * while it leaves, and a test only ever clears itself.
   */
  function dismiss(commit: () => void) {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => {
      setExiting(false);
      commit();
    }, BUBBLE_OUT_MS);
  }

  /** done with it: the full interval restarts from now */
  function done() {
    dismiss(() => {
      if (previewNudge) {
        onPreviewEnd?.();
        return;
      }
      if (nudge) markFired(nudge);
      setNudge(null);
    });
  }

  /** not now: it comes back in five minutes, timer untouched */
  function snooze() {
    dismiss(() => {
      if (previewNudge) {
        onPreviewEnd?.();
        return;
      }
      if (nudge) snoozeNudge(nudge);
      setNudge(null);
    });
  }

  const clip = active ? sprite.actions[active] : sprite.walk;

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none relative w-full select-none"
      style={{ height: sprite.height, ["--stroll-x" as string]: `${travel}px` }}
    >
      {!active && remainingMs !== null && (
        <p
          className="pointer-events-none absolute left-0 select-none whitespace-nowrap text-[11px] uppercase tracking-[0.14em] text-white/60"
          style={{ bottom: sprite.height + 6, fontFamily: paper.fontBody }}
        >
          Next nudge · {formatCountdown(remainingMs)}
        </p>
      )}

      {active && (
        <div
          role="status"
          style={{
            // flush left with the clock underneath rather than chasing the
            // character along its stroll, and anchored by its bottom edge so
            // it clears the sprite however tall the message makes it. Sprite
            // cells differ in how much headroom they leave (Steve fills his
            // to the top), so the offset is the full cell height plus a gap
            // rather than a fraction of it — anything less covers the head.
            left: 0,
            bottom: sprite.height + 10,
            background: paper.background,
            color: paper.ink,
            fontFamily: paper.fontBody,
            ["--bubble-out-ms" as string]: `${BUBBLE_OUT_MS}ms`,
          }}
          className={`pointer-events-auto absolute z-10 w-[19rem] rounded-token-lg px-5 py-4 text-left shadow-token-lg ${
            exiting ? "animate-bubble-out" : ""
          }`}
        >
          <span className="block text-[13px] leading-relaxed">{message}</span>
          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={done}
              className="rounded-token-sm border border-current px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-transform hover:-translate-y-px"
            >
              Done
            </button>
            <button
              type="button"
              onClick={snooze}
              className="rounded-token-sm border border-current px-3 py-1.5 text-[10px] uppercase tracking-wide opacity-60 transition hover:opacity-100"
            >
              Snooze 5m
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={active ? done : onOpenSettings}
        aria-label={active ? message : "Reminder settings"}
        title={active ? message : "Reminder settings"}
        className="pointer-events-auto absolute bottom-0 left-0"
        style={{
          width: sprite.width,
          height: sprite.height,
          backgroundImage: `url(${clip.src})`,
          // the strip drawn at its true size, so one cell is exactly one frame
          backgroundSize: `${clip.frames * sprite.width}px ${sprite.height}px`,
          ["--sprite-strip" as string]: `${clip.frames * sprite.width}px`,
          imageRendering: "pixelated",
          filter: sprite.filter,
          // both animations always run; pausing the stroll (rather than
          // removing it) keeps the character where it stopped
          animation: `sprite-step ${active ? "1.1s" : "0.9s"} steps(${clip.frames}) infinite, sprite-stroll 26s ease-in-out infinite`,
          animationPlayState: active ? "running, paused" : "running, running",
        }}
      />
    </div>
  );
}

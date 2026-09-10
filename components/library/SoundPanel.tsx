"use client";

import { Volume1, Volume2, VolumeX } from "lucide-react";
import { ScenePanel } from "./ScenePanel";
import {
  AMBIENT_TRACKS,
  type AmbientSettings,
  type AmbientTrackId,
  type AmbientTrackSetting,
} from "@/lib/audio/ambient";

interface SoundPanelProps {
  settings: AmbientSettings;
  onChange: (id: AmbientTrackId, next: AmbientTrackSetting) => void;
  onClose: () => void;
}

/**
 * A mixer, not a player. Each bed switches on independently and keeps its own
 * level, so the room can be rain over a fireplace at whatever balance suits.
 */
export function SoundPanel({ settings, onChange, onClose }: SoundPanelProps) {
  const playing = AMBIENT_TRACKS.filter((track) => settings[track.id]?.on).length;

  return (
    <ScenePanel title="Ambient sound" onClose={onClose}>
      <p className="font-body text-xs leading-relaxed text-ink-muted">
        {playing === 0
          ? "The room's own noise, quietly underneath. Switch on as many as you like."
          : `${playing} playing. They layer, so mix them to taste.`}
      </p>

      <ul className="mt-3 flex flex-col divide-y divide-border/60">
        {AMBIENT_TRACKS.map((track) => {
          const setting = settings[track.id] ?? { on: false, volume: 0.5 };
          const Icon = !setting.on ? VolumeX : setting.volume < 0.5 ? Volume1 : Volume2;

          return (
            <li key={track.id} className="py-3">
              <div className="flex items-center gap-2.5">
                <input
                  id={`ambient-${track.id}`}
                  type="checkbox"
                  checked={setting.on}
                  onChange={() => onChange(track.id, { ...setting, on: !setting.on })}
                  className="h-4 w-4 shrink-0 accent-[var(--color-accent)]"
                />
                <label htmlFor={`ambient-${track.id}`} className="min-w-0 flex-1 cursor-pointer">
                  <span
                    className={`block font-body text-sm ${setting.on ? "text-ink" : "text-ink-muted"}`}
                  >
                    {track.label}
                  </span>
                  <span className="block font-body text-[11px] text-ink-soft">{track.blurb}</span>
                </label>
                <Icon
                  className={`h-4 w-4 shrink-0 ${setting.on ? "text-accent" : "text-ink-soft"}`}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>

              {/* the level only means something once the bed is on */}
              <div className="mt-2 flex items-center gap-2.5 pl-[26px]">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={setting.volume}
                  disabled={!setting.on}
                  onChange={(e) => onChange(track.id, { ...setting, volume: Number(e.target.value) })}
                  aria-label={`${track.label} volume`}
                  className="h-1 min-w-0 flex-1 cursor-pointer accent-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-35"
                />
                <span
                  className={`w-9 shrink-0 text-right font-body text-[11px] tabular-nums ${
                    setting.on ? "text-ink-muted" : "text-ink-soft opacity-50"
                  }`}
                >
                  {Math.round(setting.volume * 100)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </ScenePanel>
  );
}

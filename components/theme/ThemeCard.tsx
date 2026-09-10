"use client";

import clsx from "clsx";
import type { ThemeDefinition } from "@/lib/theme/themes";

interface ThemeCardProps {
  theme: ThemeDefinition;
  selected: boolean;
  onSelect: () => void;
}

/**
 * A mood row: a quiet pill when unselected, expanding into a bordered card
 * with its description when chosen. Reads like picking a room, not toggling
 * a setting.
 */
export function ThemeCard({ theme, selected, onSelect }: ThemeCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={clsx(
        "w-full border text-left transition-all duration-token ease-gentle",
        selected
          ? "rounded-[18px] border-2 border-selected bg-white px-5 py-4 shadow-[0_10px_30px_-18px_rgba(60,30,20,0.5)]"
          : "rounded-full border-gallery-ink/15 bg-white px-5 py-3.5 hover:border-gallery-ink/35 hover:shadow-[0_8px_20px_-16px_rgba(60,30,20,0.6)]"
      )}
    >
      <span className="block font-body text-sm font-semibold text-gallery-ink">{theme.name}</span>

      {/* description only when selected — keeps the list calm and scannable */}
      <span
        className={clsx(
          "grid transition-all duration-token ease-gentle",
          selected ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <span className="overflow-hidden">
          <span className="block font-body text-[13px] leading-relaxed text-gallery-ink/75">
            {theme.description}
          </span>
        </span>
      </span>
    </button>
  );
}

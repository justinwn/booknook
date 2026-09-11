"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES, DEFAULT_THEME_ID, getTheme } from "@/lib/theme/themes";
import { useLibraryTheme } from "@/lib/theme/theme-context";
import { loadThemePreference } from "@/lib/profile/theme-preference";
import { Wallpaper } from "@/components/library/Wallpaper";
import { ThemePreview } from "@/components/theme/ThemePreview";
import { Button } from "@/components/ui/Button";
import type { ThemeId } from "@/lib/types";

/**
 * Choosing a mood happens *inside* the mood: the selected wallpaper plays as
 * the page background, so the choice is previewed at full size rather than in
 * a thumbnail. Everything above it is glass and text on a scrim, tuned per
 * theme — a bright daylight scene needs a heavier scrim than a night one.
 */
export default function ThemeSelectionPage() {
  const router = useRouter();
  const { setThemeId } = useLibraryTheme();
  const [selected, setSelected] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [saving, setSaving] = useState(false);
  const theme = getTheme(selected);

  useEffect(() => {
    let active = true;
    loadThemePreference().then((themeId) => {
      if (active) setSelected(themeId);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleDone() {
    setSaving(true);
    await setThemeId(selected);
    router.push("/library");
  }

  return (
    <main data-theme={selected} className="relative min-h-screen overflow-hidden bg-bg">
      <Wallpaper
        src={theme.wallpaper}
        poster={theme.poster}
        scrim={theme.isLight ? "medium" : "light"}
      />
      {/* a gradient from the right, so the list side stays readable while the
          left half of the scene shows through almost untouched */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/35 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

      {/* the preview hangs its note out to the right, so the two halves need
          real air between them or the note lands on the list. 200px at `lg`,
          and the columns size to content rather than splitting the width. */}
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 content-center items-center justify-center gap-12 px-6 py-16 lg:grid-cols-[auto_auto] lg:gap-[100px] lg:px-10">
        {/* the note hangs ~130px past the preview's own box, so the column
            reserves that much on its right: the gap below is then real
            clearance between the note and the list, not between two boxes */}
        <div className="flex justify-center lg:justify-end lg:pr-[130px]">
          <ThemePreview theme={theme} />
        </div>

        <div className="w-full max-w-md justify-self-center lg:justify-self-start">
          <h1 className="font-display text-[1.4rem] leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Pick a theme
          </h1>

          <div role="radiogroup" aria-label="Library mood" className="mt-7 flex flex-col gap-2.5">
            {THEMES.map((t) => {
              const isSelected = t.id === selected;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelected(t.id)}
                  // one shape in both states — selection changes the emphasis,
                  // not the geometry, so the list doesn't jump as you move
                  // down it. Both rings are inset: an outset ring traces a
                  // wider arc than the card, which read as a bigger radius on
                  // the selected one. White rather than the theme accent, so
                  // the marker is the same in every room.
                  // a fixed 12px, not the room's radius token: this list is
                  // chrome for choosing a room, so it shouldn't restyle itself
                  // as you move through the options
                  style={{ borderRadius: 12 }}
                  className={`px-5 py-4 text-left transition-all duration-token ease-gentle ${
                    isSelected
                      ? "glass-dark-strong ring-2 ring-inset ring-white"
                      : "glass-dark ring-1 ring-inset ring-white/10 hover:ring-white/30"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-body text-sm font-semibold text-white">{t.name}</span>
                    <span className="font-body text-[11px] text-white/55">{t.tagline}</span>
                  </span>

                  <span
                    className={`grid transition-all duration-token ease-gentle ${
                      isSelected ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <span className="overflow-hidden">
                      <span className="block font-body text-[13px] leading-relaxed text-white/75">
                        {t.description}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleDone}
              loading={saving}
              className="px-8"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

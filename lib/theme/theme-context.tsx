"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ThemeId } from "@/lib/types";
import { getTheme, DEFAULT_THEME_ID, type ThemeDefinition } from "./themes";
import { loadThemePreference, saveThemePreference } from "@/lib/profile/theme-preference";

interface ThemeContextValue {
  themeId: ThemeId;
  theme: ThemeDefinition;
  /** persists to the user's profile (or localStorage in demo mode) */
  setThemeId: (id: ThemeId) => Promise<void>;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadThemePreference()
      .then((id) => {
        if (active) setThemeIdState(id);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeId,
      theme: getTheme(themeId),
      ready,
      setThemeId: async (id: ThemeId) => {
        setThemeIdState(id);
        await saveThemePreference(id);
      },
    }),
    [themeId, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useLibraryTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useLibraryTheme must be used within ThemeProvider");
  return ctx;
}

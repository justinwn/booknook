"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ThemeId } from "@/lib/types";
import { getTheme, DEFAULT_THEME_ID, type ThemeDefinition } from "./themes";
import {
  loadThemePreference,
  readLocalThemePreference,
  saveThemePreference,
} from "@/lib/profile/theme-preference";

/**
 * Runs before the browser paints, and degrades to a no-op on the server. The
 * stored theme has to be applied in the same frame as hydration or the room
 * paints as the default first.
 */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

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

  /**
   * The browser's copy first, before paint. State starts at the default so
   * the server and the first client render agree, and this corrects it in the
   * same frame — which is what stops a returning reader seeing the cozy room
   * for an instant before their own. With a local answer in hand the provider
   * is already `ready`; the remote read below only confirms or corrects it.
   */
  useBeforePaint(() => {
    const local = readLocalThemePreference();
    if (!local) return;
    setThemeIdState(local);
    setReady(true);
  }, []);

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

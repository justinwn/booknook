"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Plus, Waves, ListChecks, Palette, User, X } from "lucide-react";
import type { ControlId } from "./ControlRail";

const MENU: { id: ControlId; label: string; icon: typeof Waves }[] = [
  { id: "reminders", label: "Reminders", icon: ListChecks },
  { id: "ambient", label: "Ambient", icon: Waves },
  { id: "profile", label: "Profile", icon: User },
  { id: "theme", label: "Library", icon: Palette },
];

/**
 * The room's controls on a phone. A column of six discs eats a third of a
 * small screen, so only the one thing you came to do stays out — add a book —
 * and the rest lives behind a menu. Top right, out of the way of the clock and
 * the companion at the bottom.
 */
export function MobileControls({
  active,
  onSelect,
  beckonAdd,
}: {
  active: ControlId | null;
  onSelect: (id: ControlId) => void;
  /** true while the shelves are empty: Add book glows until one is there */
  beckonAdd?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const disc =
    "flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-ink shadow-token-lg transition-transform active:scale-95";

  return (
    <div ref={ref} className="fixed right-4 top-4 z-40 lg:hidden">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onSelect("add");
          }}
          aria-label="Add book"
          className={`${disc} bg-accent text-bg ${beckonAdd ? "animate-beckon" : ""}`}
        >
          <Plus className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Menu"}
          aria-expanded={open}
          aria-haspopup="menu"
          className={disc}
        >
          {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
        </button>
      </div>

      {open && (
        <div
          role="menu"
          className="glass-dark-strong absolute right-0 top-12 mt-3 w-52 overflow-hidden rounded-token-lg p-1.5 shadow-token-lg"
        >
          {MENU.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSelect(id);
              }}
              className={`flex w-full items-center gap-3 rounded-token px-3 py-3 text-left font-body text-sm transition-colors ${
                active === id ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

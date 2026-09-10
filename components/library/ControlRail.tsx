"use client";

import { Plus, Waves, ListChecks, Palette, User } from "lucide-react";
import clsx from "clsx";
import { SceneControl } from "./SceneControl";

// sharing lives on the profile now — it is part of who you are, not a control
// you reach for while you are in the room
export type ControlId = "add" | "ambient" | "reminders" | "theme" | "profile";

interface ControlRailProps {
  active: ControlId | null;
  onSelect: (id: ControlId) => void;
  /** true while the shelves are empty: Add book glows until one is there */
  beckonAdd?: boolean;
}

/**
 * The room's controls: a column of solid discs down the right-hand side —
 * objects in the environment, deliberately not a docked sidebar. On narrow
 * screens the column becomes a scrollable rail along the bottom so the room
 * stays whole rather than being squeezed.
 *
 * The lower-left corner is left clear for the playlist, which lands later.
 */
export function ControlRail({ active, onSelect, beckonAdd }: ControlRailProps) {
  return (
    <div
      className={clsx(
        "pointer-events-none fixed z-30 gap-2.5",
        // phones get the top-right add button and menu instead: six discs
        // along the bottom crowd out the room itself
        "hidden lg:flex",
        // the same 56px the clock and the quote stand off their corners
        "lg:bottom-auto lg:left-auto lg:right-14 lg:top-1/2 lg:w-auto lg:-translate-y-1/2",
        "lg:flex-col lg:items-end lg:overflow-visible lg:px-0 lg:pb-0"
      )}
    >
      <div className="pointer-events-auto contents">
        <SceneControl
          icon={<Plus className="h-5 w-5" strokeWidth={1.5} />}
          label="Add book"
          active={active === "add"}
          beckon={beckonAdd}
          onClick={() => onSelect("add")}
        />
        <SceneControl
          icon={<ListChecks className="h-5 w-5" strokeWidth={1.5} />}
          label="Reminders"
          active={active === "reminders"}
          onClick={() => onSelect("reminders")}
        />
        <SceneControl
          icon={<Waves className="h-5 w-5" strokeWidth={1.5} />}
          label="Ambient"
          active={active === "ambient"}
          onClick={() => onSelect("ambient")}
        />
        <SceneControl
          icon={<User className="h-5 w-5" strokeWidth={1.5} />}
          label="Profile"
          active={active === "profile"}
          onClick={() => onSelect("profile")}
        />
        <SceneControl
          icon={<Palette className="h-5 w-5" strokeWidth={1.5} />}
          label="Library"
          active={active === "theme"}
          onClick={() => onSelect("theme")}
        />
      </div>
    </div>
  );
}

"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SceneControlProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  active?: boolean;
  /** a soft pulse: this is the thing to do next */
  beckon?: boolean;
}

/**
 * A control that reads as an object hanging in the room: a solid dark disc
 * with its own icon and label, not a toolbar button. Label lives inside the
 * disc so the control stays a single object rather than a button plus caption.
 */
export function SceneControl({ icon, label, active, beckon, className, ...props }: SceneControlProps) {
  return (
    <button
      className={clsx(
        "flex h-[74px] w-[74px] shrink-0 flex-col items-center justify-center gap-1 rounded-full",
        // solid, not glass — these are objects in the room, and translucency
        // made them read differently against every wallpaper
        "bg-surface text-ink shadow-[0_14px_30px_-12px_rgba(0,0,0,0.75)]",
        "border border-border transition-all duration-token ease-gentle",
        "hover:-translate-y-0.5 hover:bg-surface-raised active:translate-y-0 active:scale-95",
        "lg:h-[86px] lg:w-[86px]",
        active && "ring-2 ring-accent",
        beckon && "animate-beckon",
        className
      )}
      {...props}
    >
      <span className="text-ink">{icon}</span>
      <span className="px-1 text-center font-body text-[10px] font-medium leading-tight text-ink-muted lg:text-[11px]">
        {label}
      </span>
    </button>
  );
}

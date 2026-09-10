"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ScenePanelProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Shared surface for anything that opens over the room. A paper panel that
 * slides in beside the controls rather than a modal that blanks the library —
 * the room should stay visible behind whatever you're doing in it.
 */
export function ScenePanel({ title, onClose, children }: ScenePanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={title}
      aria-modal="false"
      tabIndex={-1}
      className="grain-overlay glass-strong w-[min(21rem,calc(100vw-2rem))] rounded-token-lg p-5 outline-none"
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        <h2 className="font-display text-lg leading-tight text-ink">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 -mt-1 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
      <div className="relative z-10 mt-4">{children}</div>
    </div>
  );
}

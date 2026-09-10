import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string; // required — these are icon-only, so accessible naming isn't optional
}

// Circular floating control, meant to read as an object placed in the
// environment (a brass fixture, a hung ornament) rather than app chrome.
export function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={clsx(
        "grain-overlay flex h-12 w-12 items-center justify-center rounded-full",
        "border border-border bg-surface text-ink shadow-token",
        "transition-transform duration-token ease-gentle hover:-translate-y-0.5 hover:shadow-token-lg",
        "active:translate-y-0 active:scale-95",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{icon}</span>
    </button>
  );
}

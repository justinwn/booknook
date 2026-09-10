"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

function GoogleMark() {
  return (
    <span className="flex h-5 w-5 items-center justify-center">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 01-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
        <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0012 24z" />
        <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 010-4.6V6.7H1.4a12 12 0 000 10.8l4-3.1z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 001.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
      </svg>
    </span>
  );
}

interface GoogleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function GoogleButton({ loading, className, children, ...props }: GoogleButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center gap-3 rounded-xl border border-gallery-ink/15 bg-white px-5 py-3",
        "font-body text-[15px] font-semibold text-gallery-ink shadow-[0_1px_2px_rgba(16,16,20,0.05)]",
        "transition-colors duration-token ease-gentle hover:bg-gallery-ink/[0.03]",
        "active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      <GoogleMark />
      {loading ? "Opening Google…" : children ?? "Login with Google"}
    </button>
  );
}

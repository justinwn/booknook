import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "pill-dark" | "pill-light" | "pill-outline" | "solid" | "outline";
  icon?: ReactNode;
  loading?: boolean;
}

/**
 * Every button outside a themed room comes from here, so the login card, the
 * mood picker and the profile share one shape rather than three near-misses.
 *
 * - primary / ghost: inside a room, wearing that room's tokens
 * - pill-light: the affirmative action on scene chrome (submit, Done)
 * - pill-dark / pill-outline: the same pill in solid and quiet form, for
 *   light gallery pages
 * - solid / outline: the non-themed form pair — one dark action, one bordered
 *   alternative under it, both full width
 *
 * Tactile press-down on click rather than a flat color swap.
 */
export function Button({
  variant = "primary",
  icon,
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2",
        "font-body text-sm font-medium tracking-wide transition-all duration-token ease-gentle",
        "active:scale-[0.97] active:duration-75",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "rounded-token bg-accent px-6 py-3 text-bg shadow-token hover:brightness-105",
        variant === "ghost" && "rounded-token border border-border bg-transparent px-6 py-3 text-ink hover:bg-surface",
        variant === "pill-dark" &&
          "rounded-full bg-[#14120f] px-8 py-3.5 text-white shadow-token-lg hover:bg-[#241f19]",
        variant === "pill-light" &&
          "rounded-full bg-blush px-8 py-3.5 text-blush-ink shadow-token-lg hover:brightness-[1.03]",
        // width is the caller's business: the variants set the look, and a
        // `w-full` baked in here would fight every non-form use of them
        variant === "solid" &&
          "rounded-xl bg-[#2b2a2e] px-5 py-3.5 text-[15px] font-semibold text-white hover:bg-[#3a3940]",
        variant === "outline" &&
          "rounded-xl border border-gallery-ink/15 bg-white px-5 py-3.5 text-[15px] font-semibold text-gallery-ink shadow-[0_1px_2px_rgba(16,16,20,0.05)] hover:bg-gallery-ink/[0.03]",
        variant === "pill-outline" &&
          "rounded-full border border-gallery-ink/15 px-6 py-2.5 text-gallery-ink/75 hover:border-gallery-ink/35 hover:text-gallery-ink",
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {icon}
      {loading ? "Just a moment…" : children}
    </button>
  );
}

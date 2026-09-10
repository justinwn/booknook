import { forwardRef, useId, type InputHTMLAttributes } from "react";
import clsx from "clsx";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** renders light-on-dark (over scene photography) instead of dark-on-light */
  tone?: "on-dark" | "on-light";
  /** centred fields sit in a centred card; the default reads as a form row */
  align?: "left" | "center";
  /**
   * "underline" is the line-on-a-library-card treatment used over scene
   * photography. "boxed" is the plain bordered field the non-themed forms
   * use: label above, white box, one clear focus ring.
   */
  variant?: "underline" | "boxed";
}

/**
 * Underline-only field — reads like a line on a library card, not a boxed
 * SaaS input. Label is always visible (no placeholder-as-label), and the
 * error state is wired to aria-invalid + aria-describedby.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { label, error, tone = "on-dark", align = "left", variant = "underline", id, className, ...props },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const errorId = `${fieldId}-error`;
    const onDark = tone === "on-dark";
    const boxed = variant === "boxed";

    return (
      <div className={clsx("flex flex-col gap-1.5", align === "center" && "items-center text-center")}>
        <label
          htmlFor={fieldId}
          className={clsx(
            "font-body",
            boxed
              ? "text-[13px] font-medium"
              : "text-[11px] uppercase tracking-[0.16em]",
            onDark ? "text-white/60" : boxed ? "text-gallery-ink/80" : "text-gallery-ink/60"
          )}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={clsx(
            "w-full font-body transition-colors duration-token focus:outline-none",
            align === "center" && "text-center",
            boxed
              ? "rounded-xl border bg-white px-4 py-3 text-[15px] shadow-[0_1px_2px_rgba(16,16,20,0.05)]"
              : "border-0 border-b bg-transparent px-0 py-2 text-base",
            onDark
              ? "text-white placeholder:text-white/35"
              : "text-gallery-ink placeholder:text-gallery-ink/35",
            error
              ? boxed
                ? "border-[#c9584d] focus:border-[#c9584d]"
                : "border-[#e58b83] focus:border-[#e58b83]"
              : onDark
              ? "border-white/25 focus:border-blush"
              : boxed
              ? "border-gallery-ink/15 focus:border-gallery-ink/45"
              : "border-gallery-ink/20 focus:border-selected",
            className
          )}
          {...props}
        />
        {error && (
          // the pale pink is tuned for scene photography; on a white card it
          // washes out, so the light tone gets a solid red instead
          <p
            id={errorId}
            role="alert"
            className={clsx("font-body text-xs", onDark ? "text-[#e9a49d]" : "text-[#b23227]")}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
TextField.displayName = "TextField";

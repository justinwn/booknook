import clsx from "clsx";

/**
 * "BookNook" — one word, set in the display face. Kept in a component so the
 * name is written in exactly one place.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={clsx("font-display font-normal tracking-tight", className)}>
      BookNook
    </span>
  );
}

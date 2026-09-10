import clsx from "clsx";
import { FaqLink } from "./Faq";

/**
 * The maker's credit, and the FAQ beside it. One component so the wording,
 * the heart, the link and the footer's second item stay identical wherever it
 * appears.
 */
export function MadeBy({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  return (
    <p className={clsx("font-body", className)}>
      Made with ♥ by{" "}
      <a
        href="https://justinewin.com/"
        target="_blank"
        rel="noreferrer"
        className={clsx("underline-offset-4 hover:underline", linkClassName)}
      >
        Justine Win
      </a>
      <span aria-hidden className="mx-2 opacity-50">
        ·
      </span>
      <FaqLink className={linkClassName} />
    </p>
  );
}

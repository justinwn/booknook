import clsx from "clsx";
import Link from "next/link";
import { FaqLink } from "./Faq";

/**
 * The maker's credit and the small print beside it. One component so the
 * wording, the heart and the links stay identical wherever the footer
 * appears.
 */
export function MadeBy({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  const dot = (
    <span aria-hidden className="mx-2 opacity-50">
      ·
    </span>
  );
  const link = clsx("underline-offset-4 hover:underline", linkClassName);

  return (
    <p className={clsx("font-body", className)}>
      Made with ♥ by{" "}
      <a href="https://justinewin.com/" target="_blank" rel="noreferrer" className={link}>
        Justine Win
      </a>
      {dot}
      <FaqLink className={linkClassName} />
      {dot}
      <Link href="/privacy" className={link}>
        Privacy
      </Link>
      {dot}
      <Link href="/terms" className={link}>
        Terms
      </Link>
    </p>
  );
}

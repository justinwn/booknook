import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";

/**
 * The shell both legal pages sit in. They are the two plainest pages in the
 * app on purpose: no room, no wallpaper, no theme tokens. Someone reading
 * these wants to read them, and a moving background would be in the way.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  /** the date this text last changed, written out */
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gallery px-6 py-12 sm:px-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-body text-sm text-gallery-ink/60 transition-colors hover:text-gallery-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back to <Wordmark className="text-sm" />
        </Link>

        <h1 className="mt-10 font-display text-4xl leading-tight text-gallery-ink">{title}</h1>
        <p className="mt-2 font-body text-[13px] text-gallery-ink/50">Last updated {updated}</p>

        <div className="legal mt-10">{children}</div>

        <p className="mt-14 border-t border-gallery-ink/10 pt-6 font-body text-[13px] text-gallery-ink/55">
          Questions about any of this? Write to{" "}
          <a
            href="mailto:justinewincanete@gmail.com"
            className="font-medium text-gallery-ink underline underline-offset-2 hover:no-underline"
          >
            justinewincanete@gmail.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}

/** A titled block. Kept here so both pages set their headings identically. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="font-body text-[15px] font-semibold text-gallery-ink">{title}</h2>
      <div className="mt-2 flex flex-col gap-3 font-body text-[14px] leading-relaxed text-gallery-ink/70">
        {children}
      </div>
    </section>
  );
}

/** The bulleted lists both pages use, so the markers match. */
export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-gallery-ink/30">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

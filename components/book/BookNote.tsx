import clsx from "clsx";
import type { PaperTreatment } from "@/lib/theme/themes";

interface BookNoteProps {
  title: string;
  author: string;
  rating: number;
  outOf?: number;
  note: string;
  /** when the book was finished; omitted for anything unfinished or dropped */
  finishedAt?: string;
  /** when reading began; only shown while the book is still being read */
  startedAt?: string;
  /** a book still on the go: its dateline runs to "present" instead of a finish date */
  ongoing?: boolean;
  paper?: PaperTreatment;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_PAPER: PaperTreatment = {
  background: "var(--brand-blush)",
  ink: "var(--brand-blush-ink)",
  pattern: "none",
  fontDisplay: "var(--font-fraunces)",
  fontBody: "var(--font-work-sans)",
};

/**
 * The printed ruling sits well under the text — it's the texture of the
 * stock, not a foreground element, so it must never compete with the writing
 * on it. Opacity is kept low enough that the note reads as easily as blank
 * paper would.
 */
function patternStyle(paper: PaperTreatment): React.CSSProperties {
  const color = paper.patternColor ?? "rgba(0,0,0,0.06)";
  switch (paper.pattern) {
    case "grid":
      return {
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: "16px 16px",
        opacity: 0.4,
      };
    case "lines":
      return {
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px)`,
        backgroundSize: "100% 24px",
        opacity: 0.4,
      };
    case "dots":
      return {
        backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
        backgroundSize: "14px 14px",
        opacity: 0.45,
      };
    default:
      return {};
  }
}

function Stars({ rating, outOf }: { rating: number; outOf: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: outOf }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={i < rating ? "h-4 w-4" : "h-4 w-4 opacity-20"}
          fill={i < rating ? "#e8a13a" : "currentColor"}
        >
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

/**
 * The reading note — one component, used on the shelf, in the editor preview
 * and in the theme picker. Its paper stock and typography come entirely from
 * the `paper` prop, so a new mood changes the material without touching this
 * file.
 */
export function BookNote({
  title,
  author,
  rating,
  outOf = 5,
  note,
  finishedAt,
  startedAt,
  ongoing,
  paper = DEFAULT_PAPER,
  className,
  style,
}: BookNoteProps) {
  /**
   * A book on the go has no finish date to print, so its dateline is the
   * reading period so far: the day it was started, running to present.
   */
  const dateline = ongoing
    ? startedAt
      ? `${formatDate(startedAt)} - present`
      : "Reading now"
    : finishedAt
      ? `Finished ${formatDate(finishedAt)}`
      : null;

  return (
    <article
      className={clsx(
        "grain-overlay flex min-h-[11rem] w-[15.5rem] flex-col gap-2.5 p-4 shadow-token-lg",
        className
      )}
      style={{ background: paper.background, color: paper.ink, fontFamily: paper.fontBody, ...style }}
    >
      <div className="pointer-events-none absolute inset-0" style={patternStyle(paper)} aria-hidden />

      <header className="relative z-10">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className="min-w-0 break-words text-base font-semibold leading-tight [overflow-wrap:anywhere]"
            style={{ fontFamily: paper.fontDisplay, letterSpacing: paper.displayTracking }}
          >
            {title}
          </h3>
          <span className="shrink-0 text-sm tabular-nums opacity-75">
            {rating}/{outOf}
          </span>
        </div>
        <p className="mt-0.5 break-words text-xs opacity-70 [overflow-wrap:anywhere]">{author}</p>
      </header>

      <div className="relative z-10">
        <Stars rating={rating} outOf={outOf} />
        <span className="sr-only">
          Rated {rating} out of {outOf}
        </span>
      </div>

      {/* a pasted wall of text has to wrap and then scroll, or it runs out of
          the card entirely — `anywhere` also breaks unspaced strings */}
      <p className="relative z-10 max-h-40 flex-1 overflow-y-auto break-words text-xs leading-relaxed opacity-85 [overflow-wrap:anywhere]">
        {note}
      </p>

      {dateline && <p className="relative z-10 mt-1 text-[11px] opacity-60">{dateline}</p>}
    </article>
  );
}

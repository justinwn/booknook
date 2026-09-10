/**
 * A postage stamp with a book on it, pressed into the right-hand page. Same
 * perforation trick the seaside card uses: four repeating rows of holes,
 * intersected so the corners keep both neighbours' notches.
 */
const STAMP_MASK: React.CSSProperties = {
  ["--notch" as string]: "5px",
  ["--pitch" as string]: "15px",
  maskImage: [
    "radial-gradient(var(--notch) at 50% 0, #0000 99%, #000)",
    "radial-gradient(var(--notch) at 50% 100%, #0000 99%, #000)",
    "radial-gradient(var(--notch) at 0 50%, #0000 99%, #000)",
    "radial-gradient(var(--notch) at 100% 50%, #0000 99%, #000)",
  ].join(","),
  maskPosition: "50% 0, 50% 100%, 0 50%, 100% 50%",
  maskSize: "var(--pitch) 100%, var(--pitch) 100%, 100% var(--pitch), 100% var(--pitch)",
  maskRepeat: "repeat-x, repeat-x, repeat-y, repeat-y",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as React.CSSProperties;

export function BookStamp({ className }: { className?: string }) {
  return (
    <div className={className} style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.18))" }}>
      <div
        className="flex h-[6.5rem] w-[5.25rem] flex-col items-center justify-center gap-2 bg-blush"
        style={STAMP_MASK}
        aria-hidden
      >
        <svg viewBox="0 0 40 32" className="h-9 w-11 text-blush-ink" fill="none">
          <path
            d="M20 8.5C17 5.5 12.5 4.5 8 5v20c4.5-.5 9 .5 12 3.5 3-3 7.5-4 12-3.5V5c-4.5-.5-9 .5-12 3.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M20 8.5v20" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="font-body text-[8px] font-semibold uppercase tracking-[0.16em] text-blush-ink/70">
          BookNook
        </span>
      </div>
    </div>
  );
}

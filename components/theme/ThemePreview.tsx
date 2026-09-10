import type { ThemeDefinition } from "@/lib/theme/themes";
import { SAMPLE_BOOKS } from "@/lib/mock/sample-books";
import { BookAndNote } from "@/components/book/BookAndNote";

/**
 * What a book looks like in this mood: a sample cover with its reading note
 * tucked against it. The wallpaper is already behind the whole page, so the
 * preview shows the thing that actually changes between themes — the note's
 * paper stock and its typography.
 */
export function ThemePreview({ theme }: { theme: ThemeDefinition }) {
  const sample = SAMPLE_BOOKS[0];

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-20 -z-10"
        style={{
          background:
            "radial-gradient(58% 52% at 46% 42%, rgb(var(--color-accent-soft-rgb) / 0.22), transparent 72%)",
        }}
        aria-hidden
      />

      <BookAndNote
        swapKey={theme.id}
        title={sample.title}
        author={sample.author}
        coverUrl={sample.coverUrl}
        rating={sample.rating}
        note={sample.note}
        finishedAt={sample.finishedAt}
        paper={theme.paper}
        height={300}
      />
    </div>
  );
}

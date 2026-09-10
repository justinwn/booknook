"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Book } from "@/lib/types";

/**
 * QR for the book's ISBN. It encodes an Open Library ISBN URL — a real
 * destination that resolves the same book for whoever scans it — rather than
 * an app route that doesn't exist yet.
 */
export function BookShareQR({ book, onBack }: { book: Book; onBack: () => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const url = book.isbn ? `https://openlibrary.org/isbn/${book.isbn}` : null;

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { margin: 1, width: 320, color: { dark: "#1c1a17", light: "#ffffff" } })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [url]);

  if (!url) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-body text-xs text-ink-muted">
          This book has no ISBN yet, so there&apos;s nothing to link to. Add one from Edit.
        </p>
        <button type="button" onClick={onBack} className="self-start font-body text-xs text-accent hover:underline">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt={`QR code linking to ${book.title} by ISBN`} className="h-36 w-36 rounded-token-sm" />
      ) : (
        <div className="h-36 w-36 animate-pulse rounded-token-sm bg-surface-raised" />
      )}

      <p className="text-center font-body text-[11px] leading-relaxed text-ink-muted">
        ISBN {book.isbn}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              setCopied(false);
            }
          }}
          className="rounded-full border border-border px-3 py-1.5 font-body text-xs text-ink transition-colors hover:bg-surface-raised"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full px-3 py-1.5 font-body text-xs text-ink-muted transition-colors hover:text-ink"
        >
          Back
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * The public link to this library, on the profile where the rest of "who you
 * are" lives. Written for the gallery page rather than the room, so it uses
 * the light palette instead of the room's glass chrome.
 */
export function ShareLibrary({ slug }: { slug: string | null }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const url = slug ? `${origin}/l/${slug}` : null;

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <h2 className="font-body text-[13px] font-medium text-gallery-ink/80">Share your library</h2>
      <p className="mt-2 font-body text-sm text-gallery-ink/60">
        Anyone with this link can walk through your shelves. They can&apos;t change anything.
      </p>

      {/* the same box the login fields use, with the copy control inside it */}
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-gallery-ink/15 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,16,20,0.05)]">
        <span className="min-w-0 flex-1 truncate font-body text-[15px] text-gallery-ink">
          {url ?? "Getting your link ready…"}
        </span>
        <button
          type="button"
          onClick={copy}
          disabled={!url}
          aria-label="Copy library link"
          className="shrink-0 rounded-full p-1.5 text-gallery-ink/50 transition-colors hover:bg-gallery-ink/5 hover:text-gallery-ink disabled:opacity-40"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[#2f7d5e]" strokeWidth={2} />
          ) : (
            <Copy className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <p aria-live="polite" className="mt-2 h-4 font-body text-[11px] text-gallery-ink/55">
        {copied ? "Link copied" : ""}
      </p>
    </div>
  );
}

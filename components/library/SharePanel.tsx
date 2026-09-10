"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { ScenePanel } from "./ScenePanel";

interface SharePanelProps {
  /** the public handle this library is published under */
  slug: string;
  onClose: () => void;
}

export function SharePanel({ slug, onClose }: SharePanelProps) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  // NOTE: /l/[slug] is the intended public library route; it isn't built yet,
  // so the link is correct but not yet resolvable.
  const url = `${origin}/l/${slug}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <ScenePanel title="Share your library" onClose={onClose}>
      <p className="font-body text-xs leading-relaxed text-ink-muted">
        Anyone with this link can walk through your shelves. They can&apos;t change anything.
      </p>

      <div className="mt-3 flex items-center gap-2 rounded-token border border-border bg-surface-raised px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate font-body text-xs text-ink">{url}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy library link"
          className="shrink-0 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
        >
          {copied ? <Check className="h-4 w-4 text-accent" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={1.75} />}
        </button>
      </div>

      <p aria-live="polite" className="mt-2 h-4 font-body text-[11px] text-accent">
        {copied ? "Link copied" : ""}
      </p>
    </ScenePanel>
  );
}

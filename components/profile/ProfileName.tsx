"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { loadDisplayName, saveDisplayName } from "@/lib/profile/display-name";
import { pullLibrary, pushLibrary } from "@/lib/sync/library-sync";

/**
 * The name at the top of the profile. A Google identity brings its own, and
 * changing it here would only disagree with the account it came from, so that
 * case is read-only. Everyone else types their own.
 */
export function ProfileName({
  accountName,
  locked,
}: {
  /** the name the identity provider supplied, if any */
  accountName: string | null;
  /** true when that provider owns the name */
  locked: boolean;
}) {
  const [name, setName] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(loadDisplayName());
    // a name typed on one device is the same person on the next
    pullLibrary().then((doc) => {
      if (typeof doc?.displayName === "string" && doc.displayName) setName(doc.displayName);
    });
  }, []);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const shown = (locked ? accountName : name || accountName) || "Your profile";

  function commit() {
    const next = draft.trim();
    setName(next);
    saveDisplayName(next);
    pushLibrary({ displayName: next });
    setEditing(false);
  }

  if (locked || !editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="truncate font-display text-3xl text-gallery-ink">{shown}</h1>
        {!locked && (
          <button
            type="button"
            onClick={() => {
              setDraft(name || accountName || "");
              setEditing(true);
            }}
            aria-label="Change your name"
            title="Change your name"
            className="shrink-0 rounded-full p-1.5 text-gallery-ink/40 transition-colors hover:bg-gallery-ink/5 hover:text-gallery-ink"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={draft}
        maxLength={60}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        aria-label="Your name"
        className="w-full max-w-[16rem] rounded-xl border border-gallery-ink/15 bg-white px-3 py-1.5 font-display text-2xl text-gallery-ink shadow-[0_1px_2px_rgba(16,16,20,0.05)] focus:border-gallery-ink/45 focus:outline-none"
      />
      <button
        type="button"
        onClick={commit}
        aria-label="Save name"
        className="shrink-0 rounded-full p-1.5 text-gallery-ink/60 transition-colors hover:bg-gallery-ink/5 hover:text-gallery-ink"
      >
        <Check className="h-4 w-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        aria-label="Cancel"
        className="shrink-0 rounded-full p-1.5 text-gallery-ink/40 transition-colors hover:bg-gallery-ink/5 hover:text-gallery-ink"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, ListMusic, Waves, Palette, User, Share2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";

interface LibraryControlsProps {
  onAddBook: () => void;
  onChangeTheme: () => void;
}

// The floating control rail. Reads as small fixtures placed in the room —
// each one a circular object with its own shadow — rather than a UI
// toolbar docked to the viewport.
//
// ASSUMPTION: music/profile/share aren't specified beyond "should exist" at
// this stage, so they're wired to a lightweight inline note rather than
// invented flows or dead buttons. Add book and Change theme are the two
// controls this task actually specified behavior for, so those are real.
export function LibraryControls({ onAddBook, onChangeTheme }: LibraryControlsProps) {
  const [note, setNote] = useState<string | null>(null);

  function showNote(text: string) {
    setNote(text);
    window.setTimeout(() => setNote((current) => (current === text ? null : current)), 2200);
  }

  return (
    <div className="fixed right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-3 sm:right-6">
      {note && (
        <div className="grain-overlay absolute right-full mr-3 top-1/2 w-40 -translate-y-1/2 rounded-token border border-border bg-surface px-3 py-2 text-center shadow-token">
          <p className="relative z-10 font-body text-xs text-ink-muted">{note}</p>
        </div>
      )}

      <IconButton icon={<Plus className="h-5 w-5" strokeWidth={1.5} />} label="Add book" onClick={onAddBook} />
      <IconButton
        icon={<ListMusic className="h-5 w-5" strokeWidth={1.5} />}
        label="Music playlist"
        onClick={() => showNote("Playlists — coming soon")}
      />
      <IconButton
        icon={<Waves className="h-5 w-5" strokeWidth={1.5} />}
        label="Ambient sound"
        onClick={() => showNote("Ambient sound — coming soon")}
      />
      <IconButton icon={<Palette className="h-5 w-5" strokeWidth={1.5} />} label="Change library mood" onClick={onChangeTheme} />
      <IconButton
        icon={<User className="h-5 w-5" strokeWidth={1.5} />}
        label="Profile"
        onClick={() => showNote("Profile — coming soon")}
      />
      <IconButton
        icon={<Share2 className="h-5 w-5" strokeWidth={1.5} />}
        label="Share library"
        onClick={() => showNote("Sharing — coming soon")}
      />
    </div>
  );
}

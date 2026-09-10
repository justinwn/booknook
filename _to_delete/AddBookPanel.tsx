"use client";

import { ScanLine, Hash, PenLine, type LucideIcon } from "lucide-react";
import { ScenePanel } from "./ScenePanel";

export type AddBookMethod = "scan" | "isbn" | "manual";

interface AddBookPanelProps {
  onClose: () => void;
  onChoose: (method: AddBookMethod) => void;
}

const METHODS: Array<{ id: AddBookMethod; icon: LucideIcon; title: string; detail: string }> = [
  { id: "scan", icon: ScanLine, title: "Scan a barcode", detail: "Point your camera at the back cover" },
  { id: "isbn", icon: Hash, title: "Enter an ISBN", detail: "We'll pull the cover and details" },
  { id: "manual", icon: PenLine, title: "Add it by hand", detail: "For anything without a barcode" },
];

/**
 * The entry point into the book-add flow. Each route is a real, addressable
 * choice — the flows themselves land behind these, so adding one means
 * handling its method in the parent, not restructuring this panel.
 */
export function AddBookPanel({ onClose, onChoose }: AddBookPanelProps) {
  return (
    <ScenePanel title="Add a book" onClose={onClose}>
      <ul className="flex flex-col gap-2">
        {METHODS.map(({ id, icon: Icon, title, detail }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onChoose(id)}
              className="flex w-full items-center gap-3 rounded-token border border-border/70 bg-surface-raised/60 px-3.5 py-3 text-left transition-all duration-token ease-gentle hover:border-accent/60 hover:bg-surface-raised"
            >
              <Icon className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} />
              <span>
                <span className="block font-body text-sm font-medium text-ink">{title}</span>
                <span className="block font-body text-xs text-ink-muted">{detail}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </ScenePanel>
  );
}

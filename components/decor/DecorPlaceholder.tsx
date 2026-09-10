"use client";

import { Flower2, Lamp, Camera, User } from "lucide-react";
import type { DecorType } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<DecorType, LucideIcon> = {
  cactus: Flower2,
  lamp: Lamp,
  polaroid: Camera,
  figure: User,
};

// TEMPORARY placeholder: a flat icon standing in for a fully-illustrated,
// multi-layer animated decor object. When real artwork lands (per the
// asset-requirements spec — separate cat-body/cat-mouth/tail-style groups),
// this component's internals swap out; the slot/placement data model
// upstream doesn't change.
export function DecorPlaceholder({ decorType }: { decorType: DecorType }) {
  const Icon = ICONS[decorType];
  return (
    <div className="grain-overlay flex h-full w-full items-end justify-center pb-1">
      <div className="relative z-10 flex h-[70%] w-[70%] items-center justify-center rounded-token-lg border border-border bg-surface-raised shadow-token-inset">
        <Icon className="h-1/2 w-1/2 text-accent" strokeWidth={1.5} />
      </div>
    </div>
  );
}

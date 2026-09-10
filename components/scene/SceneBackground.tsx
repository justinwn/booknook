import Image from "next/image";
import clsx from "clsx";

interface SceneBackgroundProps {
  src: string;
  /** how hard to darken the photo so foreground type stays legible */
  scrim?: "heavy" | "medium" | "light";
  className?: string;
  priority?: boolean;
}

const SCRIMS: Record<NonNullable<SceneBackgroundProps["scrim"]>, string> = {
  heavy: "bg-black/65",
  medium: "bg-black/45",
  light: "bg-black/25",
};

/**
 * Full-bleed room photography with a legibility scrim. The room is the
 * environment, never the layout system — nothing positions itself against
 * features of the image.
 */
export function SceneBackground({ src, scrim = "heavy", className, priority }: SceneBackgroundProps) {
  return (
    <div className={clsx("absolute inset-0 overflow-hidden", className)} aria-hidden>
      <Image src={src} alt="" fill priority={priority} className="object-cover" />
      <div className={clsx("absolute inset-0", SCRIMS[scrim])} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
    </div>
  );
}

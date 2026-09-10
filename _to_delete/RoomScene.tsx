import Image from "next/image";
import type { ReactNode } from "react";

interface RoomSceneProps {
  src: string;
  /** width / height of the photograph */
  aspectRatio: number;
  alt?: string;
  /** children are positioned in PHOTO percentage coordinates, not viewport ones */
  children?: ReactNode;
}

/**
 * Establishes the room's coordinate space.
 *
 * Reproduces object-cover cropping on a real, measurable element: the inner
 * box keeps the photograph's aspect ratio, is at least as large as the
 * viewport in both axes, and is centred. Anything absolutely positioned
 * inside it with `%` units therefore lands on the same spot of the image no
 * matter how the window is shaped — which is what lets the slot map stay
 * honest data instead of guesswork tuned to one screen size.
 */
export function RoomScene({ src, aspectRatio, alt = "", children }: RoomSceneProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          aspectRatio: `${aspectRatio}`,
          minWidth: "100%",
          minHeight: "100%",
          // the larger of the two keeps it covering in both axes
          width: `max(100%, ${100 * aspectRatio}vh)`,
          height: `max(100%, ${100 / aspectRatio}vw)`,
        }}
      >
        <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" />
        {children}
      </div>
    </div>
  );
}

import Image from "next/image";
import clsx from "clsx";

interface BookCoverImageProps {
  src: string;
  alt: string;
  /** degrees of tilt — small values only; the book should sit, not float */
  tilt?: number;
  className?: string;
  priority?: boolean;
}

/**
 * A book rendered as a physical object: faked page edges down one side, a
 * cast shadow, and a slight tilt. Deliberately not a card — no border, no
 * rounded-SaaS chrome.
 */
export function BookCoverImage({ src, alt, tilt = -4, className, priority }: BookCoverImageProps) {
  return (
    <div
      className={clsx("relative", className)}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* page block, offset behind the cover */}
      <div className="absolute inset-y-1 -right-1.5 rounded-r-[3px] bg-[#efe7d8] shadow-token" />
      <div className="absolute inset-y-2 -right-2.5 rounded-r-[3px] bg-[#e3d9c6]" />

      <div className="relative h-full w-full overflow-hidden rounded-[3px] shadow-token-lg">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 60vw, 360px" className="object-cover" priority={priority} />
        {/* spine shading along the binding edge */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/35 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
      </div>
    </div>
  );
}

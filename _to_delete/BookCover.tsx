import Image from "next/image";

// The login screen's hero object: a book sitting physically in the scene,
// with a small attached note. Cover art is a placeholder image — swap the
// src (and drop the tilt/page-edge treatment onto whatever real artwork
// replaces it) whenever final assets exist.
export function BookCover() {
  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      <div
        className="relative"
        style={{ transform: "rotateY(-8deg) rotateX(2deg)", transformStyle: "preserve-3d" }}
      >
        {/* stacked page edges, faked with offset flat layers for depth */}
        <div className="absolute -right-1.5 top-1.5 h-full w-full rounded-token bg-paper/90" />
        <div className="absolute -right-3 top-3 h-full w-full rounded-token bg-paper/70" />

        <div className="relative h-[420px] w-[280px] overflow-hidden rounded-token shadow-token-lg sm:h-[480px] sm:w-[320px]">
          <Image
            src="/assets/book-placeholder.webp"
            alt=""
            fill
            sizes="320px"
            className="object-cover"
            priority
          />
        </div>

        {/* attached note */}
        <div
          className="grain-overlay absolute -bottom-6 -right-8 w-32 rounded-token-sm border border-border bg-paper p-3 shadow-token"
          style={{ transform: "rotate(-6deg)" }}
        >
          <p className="relative z-10 font-display text-sm italic text-ink/80">Ex libris</p>
        </div>
      </div>
    </div>
  );
}

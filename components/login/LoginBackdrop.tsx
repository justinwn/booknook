import { BookNote } from "@/components/book/BookNote";
import { SCATTERED_NOTES } from "@/lib/mock/sample-books";
import { getTheme, type PaperTreatment } from "@/lib/theme/themes";

/**
 * Sky behind the book, with other people's reading notes pinned across it.
 * Three down each side and none in the middle, so the book sits in clear air:
 * the columns are anchored to their own edge rather than to a shared grid, so
 * the balance holds at any width. Each card wears a different room's paper
 * stock, which is the quickest way to show there is more than one library
 * inside.
 */
type Spot = {
  /** which edge the card hangs off */
  side: "left" | "right";
  /** how far past that edge it sits, in rem */
  offset: number;
  top: string;
  tilt: number;
  scale: number;
  paper: PaperTreatment;
};

/**
 * The seaside room's stock is sky blue, which disappears against a sky-blue
 * wall, so the wall gets a pink one of its own instead. It belongs to no room
 * yet — it is here because six cards all in warm cream read as one stack.
 */
const PINK: PaperTreatment = {
  background: "#fbe0e6",
  ink: "#5c2f3a",
  pattern: "lines",
  patternColor: "rgba(120, 60, 78, 0.16)",
  fontDisplay: "var(--font-dm-serif)",
  fontBody: "var(--font-quicksand)",
};

const SPOTS: Spot[] = [
  { side: "left", offset: -2, top: "4%", tilt: -7, paper: getTheme("cozy-room").paper, scale: 0.94 },
  { side: "left", offset: 1, top: "37%", tilt: 5, paper: getTheme("magical-garden").paper, scale: 1 },
  { side: "left", offset: -1.5, top: "70%", tilt: -4, paper: getTheme("dark-academia").paper, scale: 0.9 },
  { side: "right", offset: -1.5, top: "6%", tilt: 6, paper: getTheme("minecraft").paper, scale: 0.9 },
  { side: "right", offset: 1, top: "35%", tilt: -5, paper: PINK, scale: 1 },
  { side: "right", offset: -2, top: "68%", tilt: 7, paper: getTheme("cozy-room").paper, scale: 0.94 },
];

export function LoginBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#bfe1f6]" aria-hidden>
      {SPOTS.map((spot, i) => {
        const note = SCATTERED_NOTES[i % SCATTERED_NOTES.length];
        return (
          <div
            key={`${spot.side}-${note.id}`}
            className="absolute hidden lg:block"
            style={{
              top: spot.top,
              [spot.side]: `${spot.offset}rem`,
              transform: `rotate(${spot.tilt}deg) scale(${spot.scale})`,
            }}
          >
            <BookNote
              title={note.title}
              author={note.author}
              rating={note.rating}
              note={note.note}
              finishedAt={note.finishedAt}
              paper={spot.paper}
              className="w-[15.5rem] rounded-[2px] shadow-[0_16px_34px_-18px_rgba(20,40,70,0.55)]"
            />
          </div>
        );
      })}

      {/* the sky reads through toward the middle, so the book has somewhere
          quiet to sit and the notes stay in the periphery */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(46% 52% at 50% 50%, rgba(191,225,246,0.94) 42%, rgba(191,225,246,0) 78%)",
        }}
      />
    </div>
  );
}

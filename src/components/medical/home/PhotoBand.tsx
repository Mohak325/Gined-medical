import type { CSSProperties } from "react";
import Photo from "@/components/motion/Photo";
import SplitWords from "@/components/motion/SplitWords";

/** A full-bleed photo break with one sentence: the page's quiet, cinematic pause. */
export default function PhotoBand() {
  return (
    <section aria-label="Our approach" className="relative min-h-[85svh] flex items-end overflow-hidden bg-ink-deep text-text-on-dark">
      <Photo name="operatingTheatre" parallax overlay="bottom" decorative />
      <div className="relative z-[2] max-w-marketing w-full mx-auto px-4 sm:px-6 md:px-10 pb-16 md:pb-24">
        <SplitWords
          className="text-display-xl max-w-5xl"
          parts={[{ text: "A rank is a number." }, { text: "Your choice list is a strategy.", className: "italic text-gold" }]}
        />
        <p className="mt-8 max-w-xl text-body-large text-text-on-dark/75" data-reveal="up" style={{ "--delay": "300ms" } as CSSProperties}>
          Two students with the same rank can end up in very different colleges. The difference is the order they fill their choices in, round after round.
        </p>
      </div>
    </section>
  );
}

import type { CSSProperties, ElementType, ReactNode } from "react";

/**
 * A display line whose words slide up from behind a mask when it scrolls into view.
 * Pass plain text, or `parts` to style some words (for example an italic accent).
 * Screen readers get the whole sentence once, from aria-label.
 */
export default function SplitWords({
  as: Tag = "h2",
  text,
  parts,
  className = "",
  delay = 0,
  intro = false,
  id,
}: {
  as?: ElementType;
  text?: string;
  parts?: { text: string; className?: string }[];
  className?: string;
  delay?: number;
  /** Animate on page load (CSS only) instead of on scroll: for the first screen. */
  intro?: boolean;
  id?: string;
}) {
  const pieces = parts ?? [{ text: text ?? "" }];
  const label = pieces.map((p) => p.text).join(" ");
  let i = 0;
  const words: ReactNode[] = [];
  for (const piece of pieces) {
    for (const word of piece.text.split(/\s+/).filter(Boolean)) {
      words.push(
        <span key={i} className="split-word" style={{ "--i": i } as CSSProperties}>
          <span className={piece.className}>{word}</span>
        </span>,
        " "
      );
      i++;
    }
  }
  return (
    <Tag id={id} {...(intro ? { "data-split-intro": "" } : { "data-split": "" })} aria-label={label} className={className} style={{ "--delay": `${delay}ms` } as CSSProperties}>
      <span aria-hidden>{words}</span>
    </Tag>
  );
}

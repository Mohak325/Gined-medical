import type { CSSProperties } from "react";
import { Plus } from "lucide-react";

/** "Show more" with a thin gold line showing how much of the list you have seen. */
export default function ShowMoreButton({
  shown,
  total,
  noun,
  onClick,
}: {
  shown: number;
  total: number;
  noun: string;
  onClick: () => void;
}) {
  if (shown >= total) return null;

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <div className="w-full max-w-xs">
        <div className="relative h-[3px] rounded-full bg-ink/10 overflow-hidden" aria-hidden>
          <span className="bar-fill bg-gold rounded-full" style={{ "--s": shown / total } as CSSProperties} />
        </div>
        <p className="mt-3 text-small text-text-muted text-center tabular-nums">
          Showing {shown.toLocaleString("en-IN")} of {total.toLocaleString("en-IN")} {noun}
        </p>
      </div>
      <button
        type="button"
        onClick={onClick}
        data-magnetic=""
        className="group btn-shine inline-flex items-center gap-3 pl-6 pr-1.5 py-1.5 rounded-full border border-border-strong bg-paper-bright/60 text-small font-semibold text-ink hover:bg-paper-bright transition-colors"
      >
        <span className="py-1.5">Show more</span>
        <span className="w-8 h-8 rounded-full bg-ink text-gold flex items-center justify-center transition-transform duration-500 group-hover:rotate-90" aria-hidden>
          <Plus className="w-4 h-4" />
        </span>
      </button>
    </div>
  );
}

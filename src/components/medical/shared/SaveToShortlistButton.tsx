"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useShortlist, type ShortlistEntry } from "@/lib/medical/shortlist";

/** Adds a college to the student's shortlist, or takes it off again. */
export default function SaveToShortlistButton({ entry, compact = false }: { entry: ShortlistEntry; compact?: boolean }) {
  const { has, toggle } = useShortlist();
  const saved = has(entry.id);
  return (
    <button
      type="button"
      onClick={() => toggle(entry)}
      aria-pressed={saved}
      aria-label={saved ? `Saved ${entry.name}: remove from your shortlist` : `Save ${entry.name} to your shortlist`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-small font-semibold transition-colors ${
        saved ? "border-ink bg-ink text-text-on-dark" : "border-hairline bg-paper-bright text-ink hover:border-border-strong"
      }`}
    >
      {saved ? <BookmarkCheck className="w-4 h-4 text-gold" aria-hidden /> : <Bookmark className="w-4 h-4" aria-hidden />}
      {!compact && (saved ? "Saved" : "Save")}
    </button>
  );
}

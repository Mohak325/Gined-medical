"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useShortlist } from "@/lib/medical/shortlist";

/** Bookmark link to the shortlist, with how many colleges are saved. */
export default function ShortlistNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const { entries } = useShortlist();
  return (
    <Link
      href="/medical/shortlist"
      onClick={onNavigate}
      aria-label={`Your shortlist, ${entries.length} saved`}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full text-ink hover:bg-ink/[0.05]"
    >
      <Bookmark className="w-5 h-5" aria-hidden />
      {entries.length > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-gold text-ink text-[11px] font-bold leading-5 text-center tabular-nums">
          {entries.length}
        </span>
      )}
    </Link>
  );
}

"use client";

import { useTrack } from "@/lib/medical/TrackProvider";

/**
 * TrackToggle — Large segmented control.
 * Gold active indicator, hairline inactive.
 * Design Guidelines v2 §10.2
 */
export default function TrackToggle() {
  const { track, setTrack } = useTrack();

  return (
    <div className="inline-flex items-stretch rounded-[var(--radius-md)] border border-hairline bg-paper-bright overflow-hidden">
      <button
        onClick={() => setTrack("ug")}
        className={`px-6 py-3 text-body font-semibold transition-colors duration-[var(--dur-fast)] ${
          track === "ug"
            ? "bg-gold text-ink"
            : "bg-transparent text-text-muted hover:text-text-main"
        }`}
      >
        UG (MBBS / BDS)
      </button>
      <button
        onClick={() => setTrack("pg")}
        className={`px-6 py-3 text-body font-semibold transition-colors duration-[var(--dur-fast)] ${
          track === "pg"
            ? "bg-gold text-ink"
            : "bg-transparent text-text-muted hover:text-text-main"
        }`}
      >
        PG (MD / MS / DNB)
      </button>
    </div>
  );
}

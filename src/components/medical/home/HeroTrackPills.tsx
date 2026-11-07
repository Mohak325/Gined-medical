"use client";

import { PG_ENABLED, useTrack } from "@/lib/medical/TrackProvider";

const OPTIONS = [
  { value: "ug", label: "UG", hint: "MBBS / BDS" },
  { value: "pg", label: "PG", hint: "MD / MS" },
] as const;

/** Small UG/PG switch for the hero finder card. */
export default function HeroTrackPills() {
  const { track, setTrack } = useTrack();

  return (
    <div role="radiogroup" aria-label="Exam" className="inline-flex p-1 rounded-full bg-paper-dim border border-hairline">
      {OPTIONS.filter((o) => o.value === "ug" || PG_ENABLED).map((option) => {
        const active = track === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTrack(option.value)}
            className={`px-4 py-1.5 rounded-full text-small font-semibold transition-colors ${
              active ? "bg-ink text-text-on-dark shadow-sm" : "text-text-muted hover:text-ink"
            }`}
          >
            {option.label} <span className={`font-normal ${active ? "text-text-on-dark/70" : ""}`}>· {option.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

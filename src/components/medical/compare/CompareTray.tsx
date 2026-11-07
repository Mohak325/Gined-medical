"use client";

import Link from "next/link";
import { useCompare, COMPARE_MAX } from "@/lib/medical/CompareProvider";
import { useKeyed } from "@/lib/medical/useKeyed";
import { getCompareNames } from "@/app/medical/compare/actions";
import { ArrowUpRight, X } from "lucide-react";

/** A floating dark capsule at the bottom of the screen listing the colleges picked to compare. */
export default function CompareTray() {
  const { ids, remove, clear } = useCompare();
  const idsKey = ids.join(",");
  const colleges = useKeyed(idsKey || null, () => getCompareNames(ids)) ?? [];

  if (ids.length === 0) return null;

  return (
    <div className="intro print:hidden fixed inset-x-3 sm:inset-x-4 bottom-3 sm:bottom-4 z-[var(--z-tray)] pb-[env(safe-area-inset-bottom)]">
      <div className="relative max-w-5xl mx-auto overflow-hidden rounded-[24px] bg-ink-deep/95 backdrop-blur-xl border border-white/10 text-text-on-dark shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] grain">
        <div className="relative z-[2] px-4 sm:px-5 py-3.5 flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex gap-1" aria-hidden>
              {Array.from({ length: COMPARE_MAX }, (_, i) => (
                <span key={i} className={`h-1.5 w-4 rounded-full transition-colors duration-500 ${i < ids.length ? "bg-gold" : "bg-white/15"}`} />
              ))}
            </span>
            <span className="text-small font-semibold tabular-nums">
              {ids.length} of {COMPARE_MAX}
            </span>
          </div>

          <ul className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto" aria-label="Colleges to compare">
            {colleges.map((c) => (
              <li key={c.id} className="flex items-center gap-1.5 rounded-full surface-ink-glass pl-3 pr-1 py-1 shrink-0">
                <span className="text-small truncate max-w-[160px]">{c.name}</span>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-text-on-dark/60 hover:text-text-on-dark hover:bg-white/10 transition-colors"
                  aria-label={`Remove ${c.name} from comparison`}
                >
                  <X className="w-3.5 h-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <button type="button" onClick={clear} className="text-small text-text-on-dark/70 hover:text-text-on-dark transition-colors">
              Clear all
            </button>
            <Link
              href={`/medical/compare?ids=${ids.join(",")}`}
              data-magnetic=""
              className="group btn-shine inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full bg-gold text-ink text-small font-semibold"
            >
              Compare
              <span className="w-8 h-8 rounded-full bg-ink text-gold flex items-center justify-center transition-transform duration-500 group-hover:rotate-45" aria-hidden>
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, type SelectHTMLAttributes } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getSeats } from "@/lib/medical/api";
import { useKeyed } from "@/lib/medical/useKeyed";
import { type College, type SeatEntry, INDIA_STATES } from "@/lib/medical/mockData";
import { SeatMatrixQuerySchema } from "@/lib/medical/schemas";
import SeatTableView from "@/components/medical/seat-matrix/SeatTableView";
import EmptyState from "@/components/medical/shared/EmptyState";
import ShowMoreButton from "@/components/medical/shared/ShowMoreButton";
import TweenNumber from "@/components/motion/TweenNumber";
import { ChevronDown, Search, SlidersHorizontal, Users, X } from "lucide-react";
import { useTrack } from "@/lib/medical/TrackProvider";

type SeatWithCollege = SeatEntry & { college: College };

const PAGE_SIZE = 50;
const fieldClass =
  "w-full appearance-none pl-4 pr-9 py-2.5 bg-paper-bright border border-hairline rounded-full text-small text-ink shadow-[inset_0_1px_2px_rgba(15,46,61,0.06)] focus:outline-none focus:border-gold transition-colors";
const labelClass = "text-eyebrow text-text-muted block mb-2";

/**
 * Each college has one record per quota. Combine the records left after filtering
 * into one total per course, so a college appears once in the table.
 */
function totalByCourse(seats: SeatWithCollege[]): SeatWithCollege[] {
  const totals = new Map<string, SeatWithCollege>();
  for (const seat of seats) {
    const key = `${seat.collegeId}|${seat.course}`;
    const existing = totals.get(key);
    if (existing) {
      existing.seats += seat.seats;
    } else {
      totals.set(key, { ...seat });
    }
  }
  return [...totals.values()];
}

function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select {...props} className={`${fieldClass} cursor-pointer`} />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden />
    </div>
  );
}

export default function SeatMatrixClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { track } = useTrack();

  const rawParams = Object.fromEntries(searchParams.entries());
  const parsed = SeatMatrixQuerySchema.safeParse(rawParams);
  const params = parsed.success ? parsed.data : SeatMatrixQuerySchema.parse({});

  const dataKey = `${searchParams.toString()}|${track}`;
  const loaded = useKeyed(dataKey, () => getSeats({ ...params, track }).then(totalByCourse));
  const seats = loaded ?? [];
  const loading = !loaded;
  // Rows shown; starts again at one page whenever the filters change.
  const [paging, setPaging] = useState({ key: "", n: PAGE_SIZE });
  const visibleCount = paging.key === dataKey ? paging.n : PAGE_SIZE;
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });
      // Replace, without scrolling, so typing in the search box doesn't jump the page or fill history.
      router.replace(`${pathname}?${current.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // Sync track with URL on load
  useEffect(() => {
    if (params.track !== track) {
      updateQuery({ track });
    }
  }, [track]);

  const hasFilters = !!(params.state || params.search || params.quota !== "all");
  const totalSeats = seats.reduce((sum, s) => sum + s.seats, 0);
  const summary = [
    { label: "Seats", value: totalSeats },
    { label: "Colleges", value: new Set(seats.map((s) => s.collegeId)).size },
    { label: "Courses", value: new Set(seats.map((s) => s.course)).size },
  ];

  return (
    <div className="grid gap-8 lg:gap-10 lg:grid-cols-12">
      <aside className="lg:col-span-4 xl:col-span-3">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className="lg:hidden w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-full surface-premium text-small font-semibold text-ink"
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden /> {filtersOpen ? "Hide filters" : "Filters"}
          {hasFilters && <span className="w-2 h-2 rounded-full bg-gold" aria-hidden />}
        </button>
        <div data-reveal="up" className={`${filtersOpen ? "block mt-4" : "hidden"} lg:block lg:sticky lg:top-28 rounded-[28px] surface-premium p-5 md:p-6`}>
          <p className="font-[family-name:var(--font-instrument)] text-[1.75rem] leading-none text-ink mb-6">Filters</p>

          <div className="space-y-6">
            <div>
              <label htmlFor="sm-search" className={labelClass}>Search</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden />
                <input
                  id="sm-search"
                  type="search"
                  placeholder="College or city"
                  className={`${fieldClass} !pl-10 !pr-4 py-3`}
                  value={params.search || ""}
                  onChange={(e) => updateQuery({ search: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="sm-quota" className={labelClass}>Quota</label>
              <Select id="sm-quota" value={params.quota} onChange={(e) => updateQuery({ quota: e.target.value })}>
                <option value="all">All quotas</option>
                <option value="aiq">All India Quota</option>
                <option value="state">State Quota (Competent Authority)</option>
                <option value="management">Management Quota</option>
                <option value="nri">NRI / Minority Quota</option>
              </Select>
            </div>

            <div>
              <label htmlFor="sm-state" className={labelClass}>State</label>
              <Select id="sm-state" value={params.state || ""} onChange={(e) => updateQuery({ state: e.target.value })}>
                <option value="">All states</option>
                {INDIA_STATES.map((st) => (
                  <option key={st.code} value={st.code}>{st.name}</option>
                ))}
              </Select>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={() => router.replace(pathname, { scroll: false })}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-4 py-2 text-small font-semibold text-ink hover:bg-ink hover:text-text-on-dark transition-colors"
              >
                <X className="w-4 h-4" aria-hidden /> Clear filters
              </button>
            )}
          </div>
        </div>
      </aside>

      <section className="lg:col-span-8 xl:col-span-9 min-w-0" aria-label="Seats" aria-busy={loading}>
        {/* At a glance: what the current filters add up to */}
        <div data-reveal="up" className="relative overflow-hidden rounded-[28px] bg-ink text-text-on-dark p-6 sm:p-8 mb-8 grain">
          <div aria-hidden className="absolute -right-24 -top-24 w-[24rem] h-[24rem] rounded-full bg-gold/15 blur-3xl" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:44px_44px]"
          />
          <div className="relative z-[2]">
            <p className="text-eyebrow text-gold">{hasFilters ? "Matching your filters" : `Every ${track.toUpperCase()} seat, all quotas`}</p>
            <dl className="mt-5 grid grid-cols-3 gap-4" aria-live="polite">
              {summary.map((s) => (
                <div key={s.label} className="flex flex-col-reverse gap-1">
                  <dt className="text-small text-text-on-dark/75">{s.label}</dt>
                  <dd className="font-[family-name:var(--font-instrument)] text-[2.25rem] sm:text-[3rem] md:text-[3.5rem] leading-none tabular-nums">
                    {loading ? <span className="inline-block h-[0.8em] w-[2.5ch] rounded-lg bg-white/10 animate-pulse" /> : <TweenNumber value={s.value} />}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="min-h-[500px]">
          {loading ? (
            <div className="space-y-3" aria-label="Loading seats">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="skeleton h-20 rounded-[20px]" />
              ))}
            </div>
          ) : seats.length > 0 ? (
            <>
              <SeatTableView seats={seats.slice(0, visibleCount)} />
              <ShowMoreButton
                shown={Math.min(visibleCount, seats.length)}
                total={seats.length}
                noun="entries"
                onClick={() => setPaging({ key: dataKey, n: visibleCount + PAGE_SIZE })}
              />
            </>
          ) : (
            <EmptyState icon={<Users />} title="No seats found" description="No seats match your search, quota, or state filter." actions={[{ label: "Clear filters", href: pathname }]} />
          )}
        </div>
      </section>
    </div>
  );
}

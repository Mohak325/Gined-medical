"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getSeats } from "@/lib/medical/api";
import { useKeyed } from "@/lib/medical/useKeyed";
import { type College, type SeatEntry, INDIA_STATES } from "@/lib/medical/mockData";
import { SeatMatrixQuerySchema } from "@/lib/medical/schemas";
import SeatTableView from "@/components/medical/seat-matrix/SeatTableView";
import EmptyState from "@/components/medical/shared/EmptyState";
import ShowMoreButton from "@/components/medical/shared/ShowMoreButton";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import { useTrack } from "@/lib/medical/TrackProvider";

type SeatWithCollege = SeatEntry & { college: College };

const PAGE_SIZE = 50;

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

  const updateQuery = useCallback((updates: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    router.push(`${pathname}?${current.toString()}`);
  }, [searchParams, pathname, router]);

  // Sync track with URL on load
  useEffect(() => {
    if (params.track !== track) {
      updateQuery({ track });
    }
  }, [track]);



  const hasFilters = params.state || params.search || params.quota !== "all";

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className={`${filtersOpen ? "block" : "hidden"} lg:block w-full lg:w-72 shrink-0`}>
        <div className="bg-paper-bright/80 backdrop-blur-md border border-hairline rounded-[var(--radius-lg)] p-6 sticky top-28 shadow-card">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-hairline/60">
            <h3 className="font-semibold text-text-main flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gold" /> Filters
            </h3>
            {hasFilters && (
              <button 
                onClick={() => router.push(pathname)}
                className="text-micro font-medium text-gold-deep hover:text-gold transition-colors"
              >
                Reset All
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="group">
              <label htmlFor="sm-search" className="text-micro font-bold text-text-muted uppercase tracking-wider block mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-gold transition-colors" />
                <input id="sm-search" 
                  type="text" 
                  placeholder="College or City..."
                  className="w-full pl-9 pr-3 py-2.5 bg-paper border border-hairline rounded-[var(--radius-sm)] text-small focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all placeholder:text-text-muted/50 shadow-inner"
                  value={params.search || ""}
                  onChange={(e) => updateQuery({ search: e.target.value })}
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="sm-quota" className="text-micro font-bold text-text-muted uppercase tracking-wider block mb-2">Quota</label>
              <div className="relative">
                <select id="sm-quota"
                  className="w-full pl-3 pr-9 py-2.5 bg-paper border border-hairline rounded-[var(--radius-sm)] text-small focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all appearance-none shadow-inner cursor-pointer"
                  value={params.quota}
                  onChange={(e) => updateQuery({ quota: e.target.value })}
                >
                  <option value="all">All Quotas</option>
                  <option value="aiq">All India Quota</option>
                  <option value="state">State Quota (Competent Authority)</option>
                  <option value="management">Management Quota</option>
                  <option value="nri">NRI / Minority Quota</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-focus-within:text-gold transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <div className="group">
              <label htmlFor="sm-state" className="text-micro font-bold text-text-muted uppercase tracking-wider block mb-2">State</label>
              <div className="relative">
                <select id="sm-state" 
                  className="w-full pl-3 pr-9 py-2.5 bg-paper border border-hairline rounded-[var(--radius-sm)] text-small focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all appearance-none shadow-inner cursor-pointer"
                  value={params.state || ""}
                  onChange={(e) => updateQuery({ state: e.target.value })}
                >
                  <option value="">All States</option>
                  {INDIA_STATES.map((st) => (
                    <option key={st.code} value={st.code}>{st.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-focus-within:text-gold transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-small text-text-muted">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-gold border-t-transparent animate-spin" /> Fetching allocations...
              </span>
            ) : (
              <span>Found <strong className="text-gold-deep font-bold">{seats.length.toLocaleString("en-IN")}</strong> college and course entries</span>
            )}
          </div>
          <button type="button" onClick={() => setFiltersOpen(open => !open)} aria-expanded={filtersOpen} className="lg:hidden flex-1 px-4 py-2 border border-hairline rounded-[var(--radius-sm)] bg-paper-bright text-small font-medium flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-gold" /> Filters
          </button>
        </div>

        <div className="min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 animate-in fade-in duration-500">
              <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
              <p className="text-small text-text-muted font-medium">Analyzing matrix...</p>
            </div>
          ) : seats.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-paper-bright border border-hairline rounded-[var(--radius-md)] p-4 shadow-sm flex flex-col items-center text-center justify-center hover:border-gold/30 transition-colors">
                  <div className="text-h3 font-bold text-gold-deep mb-1">
                    {seats.reduce((sum, s) => sum + s.seats, 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-micro uppercase tracking-wider text-text-muted">Total Seats</div>
                </div>
                <div className="bg-paper-bright border border-hairline rounded-[var(--radius-md)] p-4 shadow-sm flex flex-col items-center text-center justify-center hover:border-gold/30 transition-colors">
                  <div className="text-h3 font-bold text-text-main mb-1">
                    {new Set(seats.map(s => s.collegeId)).size}
                  </div>
                  <div className="text-micro uppercase tracking-wider text-text-muted">Colleges</div>
                </div>
                <div className="bg-paper-bright border border-hairline rounded-[var(--radius-md)] p-4 shadow-sm flex flex-col items-center text-center justify-center hover:border-gold/30 transition-colors">
                  <div className="text-h3 font-bold text-text-main mb-1">
                    {new Set(seats.map(s => s.course)).size}
                  </div>
                  <div className="text-micro uppercase tracking-wider text-text-muted">Courses</div>
                </div>
              </div>
              
              <SeatTableView seats={seats.slice(0, visibleCount)} />
              <ShowMoreButton
                shown={Math.min(visibleCount, seats.length)}
                total={seats.length}
                noun="entries"
                onClick={() => setPaging({ key: dataKey, n: visibleCount + PAGE_SIZE })}
              />
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <EmptyState
                icon={<Users className="w-12 h-12 text-gold/50" />}
                title="No seats found"
                description="No seats match your search, quota, or state filter."
                actions={[{ label: "Reset Filters", href: pathname }]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getColleges } from "@/lib/medical/api";
import { type College, INDIA_STATES } from "@/lib/medical/mockData";
import { DirectoryQuerySchema } from "@/lib/medical/schemas";
import CollegeListView from "@/components/medical/directory/CollegeListView";
import CollegeTableView from "@/components/medical/directory/CollegeTableView";
import EmptyState from "@/components/medical/shared/EmptyState";
import { Search, LayoutGrid, List, SlidersHorizontal, Building2 } from "lucide-react";

export default function DirectoryClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse params
  const rawParams = Object.fromEntries(searchParams.entries());
  const parsed = DirectoryQuerySchema.safeParse(rawParams);
  const params = parsed.success ? parsed.data : DirectoryQuerySchema.parse({});

  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("grid");

  // Fetch
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getColleges(params).then((data) => {
      if (mounted) {
        setColleges(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [searchParams]); // re-fetch when URL changes

  // Update URL helper
  const updateQuery = useCallback((updates: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    router.push(`${pathname}?${current.toString()}`);
  }, [searchParams, pathname, router]);

  const hasFilters = params.state || params.type !== "all" || params.search;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters (Desktop) */}
      <aside className="hidden lg:block w-72 shrink-0">
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
              <label className="text-micro font-bold text-text-muted uppercase tracking-wider block mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-gold transition-colors" />
                <input 
                  type="text" 
                  placeholder="College or City..."
                  className="w-full pl-9 pr-3 py-2.5 bg-paper border border-hairline rounded-[var(--radius-sm)] text-small focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all placeholder:text-text-muted/50 shadow-inner"
                  value={params.search || ""}
                  onChange={(e) => updateQuery({ search: e.target.value })}
                />
              </div>
            </div>

            <div className="group">
              <label className="text-micro font-bold text-text-muted uppercase tracking-wider block mb-2">State</label>
              <div className="relative">
                <select 
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

            <div className="group">
              <label className="text-micro font-bold text-text-muted uppercase tracking-wider block mb-2">Institution Type</label>
              <div className="relative">
                <select 
                  className="w-full pl-3 pr-9 py-2.5 bg-paper border border-hairline rounded-[var(--radius-sm)] text-small focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all appearance-none shadow-inner cursor-pointer"
                  value={params.type}
                  onChange={(e) => updateQuery({ type: e.target.value })}
                >
                  <option value="all">All Types</option>
                  <option value="government">Government</option>
                  <option value="private">Private</option>
                  <option value="deemed">Deemed</option>
                  <option value="central">Central / AIIMS</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-focus-within:text-gold transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            
            <div className="group">
              <label className="text-micro font-bold text-text-muted uppercase tracking-wider block mb-2">Sort By</label>
              <div className="relative">
                <select 
                  className="w-full pl-3 pr-9 py-2.5 bg-paper border border-hairline rounded-[var(--radius-sm)] text-small focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all appearance-none shadow-inner cursor-pointer"
                  value={params.sort}
                  onChange={(e) => updateQuery({ sort: e.target.value })}
                >
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="established">Oldest First</option>
                  <option value="nirf_asc">NIRF Ranking (Top)</option>
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
        {/* Mobile Filter Toggle & Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="text-small text-text-muted">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-gold border-t-transparent animate-spin" /> Searching...
              </span>
            ) : (
              <span>Found <strong className="text-gold font-bold">{colleges.length}</strong> matching colleges</span>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="lg:hidden flex-1 px-4 py-2 border border-hairline rounded-[var(--radius-sm)] bg-paper-bright text-small font-medium flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
              <SlidersHorizontal className="w-4 h-4 text-gold" /> Filters
            </button>
            
            <div className="flex items-center bg-paper-bright border border-hairline rounded-[var(--radius-sm)] p-1 shrink-0 shadow-sm relative">
              {/* Highlight Pill for toggle */}
              <div 
                className="absolute inset-y-1 w-8 bg-paper rounded-[var(--radius-sm)-2px] shadow-sm border border-hairline/30 transition-all duration-300 ease-out"
                style={{ left: view === "grid" ? "4px" : "36px" }}
              />
              <button 
                onClick={() => setView("grid")}
                className={`relative z-10 w-8 h-7 flex items-center justify-center rounded-[var(--radius-sm)-2px] transition-colors duration-200 ${view === "grid" ? "text-gold" : "text-text-muted hover:text-text-main"}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView("table")}
                className={`relative z-10 w-8 h-7 flex items-center justify-center rounded-[var(--radius-sm)-2px] transition-colors duration-200 ${view === "table" ? "text-gold" : "text-text-muted hover:text-text-main"}`}
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 animate-in fade-in duration-500">
              <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
              <p className="text-small text-text-muted font-medium">Loading colleges...</p>
            </div>
          ) : colleges.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {view === "grid" ? (
                <CollegeListView colleges={colleges} />
              ) : (
                <CollegeTableView colleges={colleges} />
              )}
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <EmptyState
                icon={<Building2 className="w-12 h-12 text-gold/50" />}
                title="No colleges found"
                description="Try adjusting your filters or search terms to see more results."
                actions={[{ label: "Clear all filters", href: pathname }]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

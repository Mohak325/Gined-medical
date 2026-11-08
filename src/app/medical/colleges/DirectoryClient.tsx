"use client";

import { useMemo, useState, type CSSProperties, type SelectHTMLAttributes } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, ChevronDown, LayoutGrid, List, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import type { CollegeSummary } from "@/lib/medical/collegeSummary";
import { INDIA_STATES } from "@/lib/medical/mockData";
import { formatCurrencyShort, formatRank } from "@/lib/medical/format";
import CollegeImage from "@/components/medical/shared/CollegeImage";
import AddToCompareButton from "@/components/medical/shared/AddToCompareButton";
import SaveToShortlistButton from "@/components/medical/shared/SaveToShortlistButton";
import meta from "@/data/meta.json";
import ShowMoreButton from "@/components/medical/shared/ShowMoreButton";
import EmptyState from "@/components/medical/shared/EmptyState";
import StateTileMap from "@/components/medical/directory/StateTileMap";
import { stateSlug } from "@/lib/medical/states";

/** The fields of a college summary that the directory uses. */
export type DirectoryCollege = Omit<CollegeSummary, "website" | "nmcStatus" | "feeGovt">;

const PAGE_SIZE = 24;
const BUDGETS = [100000, 500000, 1000000, 1500000, 2000000, 3000000];
const SORTS = {
  name: "Name (A–Z)",
  closing: "Most competitive first",
  fee: "Lowest fee first",
  newest: "Newest first",
} as const;
type SortKey = keyof typeof SORTS;
const STATE_NAMES = Object.fromEntries(INDIA_STATES.map((s) => [s.code, s.name]));

const selectClass = "w-full appearance-none pl-4 pr-9 py-2.5 bg-paper-bright border border-hairline rounded-full text-small text-ink shadow-[inset_0_1px_2px_rgba(15,46,61,0.06)] focus:outline-none focus:border-gold transition-colors";
const labelClass = "text-eyebrow text-text-muted block mb-2";

function feeLabel(c: DirectoryCollege) {
  if (!c.feeMin) return "Not published";
  return c.feeMin === c.feeMax ? formatCurrencyShort(c.feeMin) : `${formatCurrencyShort(c.feeMin)}–${formatCurrencyShort(c.feeMax)}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex flex-col-reverse gap-0.5">
      <dt className="text-micro font-normal tracking-normal text-text-muted whitespace-nowrap">{label}</dt>
      <dd className="font-[family-name:var(--font-instrument)] text-[1.5rem] leading-none text-ink tabular-nums truncate">{value}</dd>
    </div>
  );
}

/** A pill select with its own chevron. */
function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select {...props} className={selectClass} />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden />
    </div>
  );
}

export default function DirectoryClient({ colleges }: { colleges: DirectoryCollege[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const state = params.get("state") ?? undefined;
  const type = params.get("type") ?? "all";
  const course = params.get("course") ?? "mbbs";
  const budget = Number(params.get("budget")) || undefined;
  const sort = (params.get("sort") as SortKey) in SORTS ? (params.get("sort") as SortKey) : "name";
  const view = params.get("view") === "list" ? "list" : "grid";
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [paging, setPaging] = useState<{ key: string; n: number }>({ key: "", n: PAGE_SIZE });

  const setParam = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "" || value === "all") next.delete(key);
      else next.set(key, value);
    }
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  // Course and type filters first, so the state map counts what the other filters leave.
  const base = useMemo(() => {
    const q = search.trim().toLowerCase();
    return colleges.filter(
      (c) =>
        (course === "all" || (course === "mbbs" ? c.mbbsSeats > 0 : c.pgSeats > 0)) &&
        (type === "all" || c.type.toLowerCase() === type) &&
        (!q || `${c.name} ${c.city} ${c.university ?? ""}`.toLowerCase().includes(q))
    );
  }, [colleges, course, type, search]);

  const beforeBudget = useMemo(() => (state ? base.filter((c) => c.stateCode === state) : base), [base, state]);
  const filtered = useMemo(() => {
    const list = budget ? beforeBudget.filter((c) => c.feeMin !== undefined && c.feeMin <= budget) : [...beforeBudget];
    const last = Number.MAX_SAFE_INTEGER;
    list.sort((a, b) => {
      if (sort === "closing") return (a.aiqClose ?? last) - (b.aiqClose ?? last) || a.name.localeCompare(b.name);
      if (sort === "fee") return (a.feeMin ?? last) - (b.feeMin ?? last) || a.name.localeCompare(b.name);
      if (sort === "newest") return (b.established || 0) - (a.established || 0) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [beforeBudget, budget, sort]);
  const hiddenNoFee = budget ? beforeBudget.filter((c) => c.feeMin === undefined).length : 0;

  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of base) counts[c.stateCode] = (counts[c.stateCode] ?? 0) + 1;
    return counts;
  }, [base]);

  const filterKey = [state, type, course, budget, sort, search].join("|");
  const visible = paging.key === filterKey ? paging.n : PAGE_SIZE;
  const hasFilters = !!(state || type !== "all" || course !== "mbbs" || budget || search);

  const filters = (
    <div className="space-y-6">
      <div>
        <label htmlFor="dir-search" className={labelClass}>Search</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden />
          <input
            id="dir-search"
            type="search"
            placeholder="Name, city, university"
            className={`${selectClass} !pl-10 !pr-4 py-3`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setParam({ q: e.target.value });
            }}
          />
        </div>
      </div>

      <div>
        <p className={labelClass}>State {state && <span className="normal-case tracking-normal text-ink">· {STATE_NAMES[state]}</span>}</p>
        {state && (
          <Link href={`/medical/state/${stateSlug(STATE_NAMES[state] ?? state)}`} className="group mb-3 inline-flex items-center gap-1.5 text-small font-semibold text-ink hover:text-gold-deep">
            About counselling in {STATE_NAMES[state]}
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" aria-hidden />
          </Link>
        )}
        <StateTileMap counts={stateCounts} names={STATE_NAMES} selected={state} onSelect={(code) => setParam({ state: code })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dir-type" className={labelClass}>Type</label>
          <Select id="dir-type" value={type} onChange={(e) => setParam({ type: e.target.value })}>
            <option value="all">All</option>
            <option value="government">Government</option>
            <option value="private">Private</option>
            <option value="deemed">Deemed</option>
            <option value="central">Central</option>
          </Select>
        </div>
        <div>
          <label htmlFor="dir-course" className={labelClass}>Courses</label>
          <Select id="dir-course" value={course} onChange={(e) => setParam({ course: e.target.value === "mbbs" ? undefined : e.target.value })}>
            <option value="mbbs">MBBS</option>
            <option value="pg">PG (MD/MS)</option>
            <option value="all">Any</option>
          </Select>
        </div>
      </div>

      <div>
        <label htmlFor="dir-budget" className={labelClass}>Yearly fee up to</label>
        <Select id="dir-budget" value={budget ?? ""} onChange={(e) => setParam({ budget: e.target.value || undefined })}>
          <option value="">Any fee</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>{formatCurrencyShort(b)}</option>
          ))}
        </Select>
        <p className="text-micro font-normal tracking-normal text-text-muted mt-2">Uses the lowest published MBBS fee at each college.</p>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            router.replace(pathname, { scroll: false });
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-4 py-2 text-small font-semibold text-ink hover:bg-ink hover:text-text-on-dark transition-colors"
        >
          <X className="w-4 h-4" aria-hidden /> Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:gap-10 lg:grid-cols-12">
      <aside className="lg:col-span-4 xl:col-span-3">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          className="lg:hidden w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-full surface-premium text-small font-semibold text-ink"
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden /> {filtersOpen ? "Hide filters" : "Filters"}
          {hasFilters && <span className="w-2 h-2 rounded-full bg-gold" aria-hidden />}
        </button>
        <div
          data-reveal="up"
          className={`${filtersOpen ? "block mt-4" : "hidden"} lg:block lg:sticky lg:top-28 rounded-[28px] surface-premium p-5 md:p-6`}
        >
          <p className="font-[family-name:var(--font-instrument)] text-[1.75rem] leading-none text-ink mb-6">Filters</p>
          {filters}
        </div>
      </aside>

      <section className="lg:col-span-8 xl:col-span-9 min-w-0" aria-label="Colleges">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <p className="text-small text-text-muted" aria-live="polite">
            <span className="block font-[family-name:var(--font-instrument)] text-[2.5rem] md:text-[3rem] leading-none text-ink tabular-nums">
              {filtered.length.toLocaleString("en-IN")}
            </span>
            <span className="block mt-2">
              {filtered.length === 1 ? "college" : "colleges"}
              {state ? ` in ${STATE_NAMES[state]}` : ""}
              {hiddenNoFee > 0 && ` · ${hiddenNoFee} more have no published fee`}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Select aria-label="Sort" value={sort} onChange={(e) => setParam({ sort: e.target.value === "name" ? undefined : e.target.value })} className="w-56">
              {Object.entries(SORTS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
            <div className="inline-flex rounded-full surface-premium p-1" role="group" aria-label="View">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setParam({ view: v === "grid" ? undefined : v })}
                  aria-pressed={view === v}
                  aria-label={v === "grid" ? "Grid view" : "List view"}
                  className={`p-2 rounded-full transition-colors duration-300 ${view === v ? "bg-ink text-gold" : "text-text-muted hover:text-ink"}`}
                >
                  {v === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search />}
            title="No colleges match"
            description={budget ? "No college with a published fee fits this budget. Many colleges haven't published fees yet; a counsellor can tell you the real figures." : "Try clearing a filter or searching for a different name."}
            actions={[{ label: "Ask a counsellor", href: "/medical/book?source=directory-empty" }]}
          />
        ) : view === "grid" ? (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.slice(0, visible).map((c, i) => (
              <li key={c.id} data-reveal="up" style={{ "--delay": `${(i % 3) * 70}ms` } as CSSProperties}>
                <div
                  data-spotlight=""
                  className="group h-full rounded-[24px] surface-premium overflow-hidden flex flex-col transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                >
                  <Link href={`/medical/college/${c.id}`} className="block relative h-32 overflow-hidden" tabIndex={-1} aria-hidden>
                    <span className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]">
                      <CollegeImage college={c} sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 100vw" />
                    </span>
                    <span className="absolute top-3 left-3 z-[2] rounded-full bg-ink-deep/85 backdrop-blur-sm px-2.5 py-1 text-micro font-semibold text-text-on-dark">{c.type}</span>
                    <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gold text-ink flex items-center justify-center opacity-0 scale-75 transition-[opacity,transform] duration-500 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-45">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="inline-flex items-center gap-1.5 text-micro font-normal tracking-normal text-text-muted">
                      <MapPin className="w-3.5 h-3.5" aria-hidden />
                      {c.city}, {c.state}
                    </span>
                    <Link href={`/medical/college/${c.id}`} className="font-[family-name:var(--font-instrument)] text-[1.4rem] leading-[1.15] text-ink mt-2 hover:text-gold-deep transition-colors line-clamp-2">
                      {c.name}
                    </Link>
                    <dl className="grid grid-cols-3 gap-2 mt-auto pt-5">
                      <Stat label="Seats" value={c.mbbsSeats ? String(c.mbbsSeats) : "—"} />
                      <Stat label="AIQ close" value={c.aiqClose ? formatRank(c.aiqClose) : "—"} />
                      <Stat label="Yearly fee" value={c.feeMin ? formatCurrencyShort(c.feeMin) : "—"} />
                    </dl>
                    <div className="mt-5 pt-4 border-t border-hairline flex justify-end gap-2">
                      <SaveToShortlistButton entry={{ id: c.id, name: c.name, closing: c.aiqClose, basis: c.aiqClose ? `All India General · ${meta.cutoffYear} R1` : undefined }} />
                      <AddToCompareButton collegeId={c.id} collegeName={c.name} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div data-reveal="up" className="rounded-[24px] surface-premium overflow-x-auto">
            <table className="w-full text-small">
              <thead className="text-left text-micro font-semibold text-text-muted border-b border-hairline bg-paper/60">
                <tr>
                  <th scope="col" className="px-5 py-4">College</th>
                  <th scope="col" className="px-5 py-4">Type</th>
                  <th scope="col" className="px-5 py-4 text-right">MBBS seats</th>
                  <th scope="col" className="px-5 py-4 text-right">AIQ close {"(R1)"}</th>
                  <th scope="col" className="px-5 py-4 text-right">Yearly fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.slice(0, visible).map((c) => (
                  <tr key={c.id} className="group transition-colors hover:bg-gold/[0.06]">
                    <td className="px-5 py-4 min-w-[16rem]">
                      <Link href={`/medical/college/${c.id}`} className="inline-flex items-center gap-1.5 font-semibold text-ink group-hover:text-gold-deep transition-colors">
                        {c.name}
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-0 -translate-x-1 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0" aria-hidden />
                      </Link>
                      <span className="block text-micro font-normal tracking-normal text-text-muted mt-0.5">{c.city}, {c.state}</span>
                    </td>
                    <td className="px-5 py-4 text-text-muted">{c.type}</td>
                    <td className="px-5 py-4 text-right tabular-nums">{c.mbbsSeats || "—"}</td>
                    <td className="px-5 py-4 text-right tabular-nums font-semibold text-ink">{c.aiqClose ? formatRank(c.aiqClose) : "—"}</td>
                    <td className="px-5 py-4 text-right tabular-nums whitespace-nowrap">{feeLabel(c)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ShowMoreButton shown={Math.min(visible, filtered.length)} total={filtered.length} noun="colleges" onClick={() => setPaging({ key: filterKey, n: visible + PAGE_SIZE })} />
      </section>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import type { CollegeSummary } from "@/lib/medical/collegeSummary";
import { INDIA_STATES } from "@/lib/medical/mockData";
import { formatCurrencyShort, formatRank } from "@/lib/medical/format";
import CollegeCover from "@/components/medical/shared/CollegeCover";
import AddToCompareButton from "@/components/medical/shared/AddToCompareButton";
import SaveToShortlistButton from "@/components/medical/shared/SaveToShortlistButton";
import meta from "@/data/meta.json";
import ShowMoreButton from "@/components/medical/shared/ShowMoreButton";
import EmptyState from "@/components/medical/shared/EmptyState";
import StateTileMap from "@/components/medical/directory/StateTileMap";
import { stateSlug } from "@/lib/medical/states";

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

const selectClass = "w-full px-3 py-2.5 bg-paper border border-hairline rounded-[var(--radius-sm)] text-small focus:outline-none focus:border-ink";
const labelClass = "text-eyebrow text-text-muted block mb-2";

function feeLabel(c: CollegeSummary) {
  if (!c.feeMin) return "Not published";
  return c.feeMin === c.feeMax ? formatCurrencyShort(c.feeMin) : `${formatCurrencyShort(c.feeMin)}–${formatCurrencyShort(c.feeMax)}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-micro font-normal tracking-normal text-text-muted">{label}</dt>
      <dd className="text-small font-semibold text-ink tabular-nums truncate">{value}</dd>
    </div>
  );
}

export default function DirectoryClient({ colleges }: { colleges: CollegeSummary[] }) {
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden />
          <input
            id="dir-search"
            type="search"
            placeholder="College, city or university"
            className={`${selectClass} pl-9`}
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
          <Link href={`/medical/state/${stateSlug(STATE_NAMES[state] ?? state)}`} className="block mb-3 text-small font-semibold text-ink underline underline-offset-4 hover:text-gold-deep">
            About counselling in {STATE_NAMES[state]}
          </Link>
        )}
        <StateTileMap counts={stateCounts} names={STATE_NAMES} selected={state} onSelect={(code) => setParam({ state: code })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dir-type" className={labelClass}>Type</label>
          <select id="dir-type" className={selectClass} value={type} onChange={(e) => setParam({ type: e.target.value })}>
            <option value="all">All</option>
            <option value="government">Government</option>
            <option value="private">Private</option>
            <option value="deemed">Deemed</option>
            <option value="central">Central</option>
          </select>
        </div>
        <div>
          <label htmlFor="dir-course" className={labelClass}>Courses</label>
          <select id="dir-course" className={selectClass} value={course} onChange={(e) => setParam({ course: e.target.value === "mbbs" ? undefined : e.target.value })}>
            <option value="mbbs">MBBS</option>
            <option value="pg">PG (MD/MS)</option>
            <option value="all">Any</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dir-budget" className={labelClass}>Yearly fee up to</label>
        <select id="dir-budget" className={selectClass} value={budget ?? ""} onChange={(e) => setParam({ budget: e.target.value || undefined })}>
          <option value="">Any fee</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>{formatCurrencyShort(b)}</option>
          ))}
        </select>
        <p className="text-micro font-normal tracking-normal text-text-muted mt-2">Uses the lowest published MBBS fee at each college.</p>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            router.replace(pathname, { scroll: false });
          }}
          className="inline-flex items-center gap-1.5 text-small font-semibold text-ink underline underline-offset-4"
        >
          <X className="w-4 h-4" aria-hidden /> Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-4 xl:col-span-3">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          className="lg:hidden w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-hairline bg-paper-bright text-small font-semibold"
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden /> {filtersOpen ? "Hide filters" : "Filters"}
        </button>
        <div className={`${filtersOpen ? "block mt-4" : "hidden"} lg:block lg:sticky lg:top-24 rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-5`}>
          {filters}
        </div>
      </aside>

      <section className="lg:col-span-8 xl:col-span-9 min-w-0" aria-label="Colleges">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-small text-text-muted" aria-live="polite">
            <span className="font-semibold text-ink tabular-nums">{filtered.length.toLocaleString("en-IN")}</span> colleges
            {hiddenNoFee > 0 && ` · ${hiddenNoFee} more have no published fee`}
          </p>
          <div className="flex items-center gap-2">
            <select aria-label="Sort" className="px-3 py-2 bg-paper-bright border border-hairline rounded-full text-small" value={sort} onChange={(e) => setParam({ sort: e.target.value === "name" ? undefined : e.target.value })}>
              {Object.entries(SORTS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <div className="inline-flex rounded-full border border-hairline bg-paper-bright p-0.5" role="group" aria-label="View">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setParam({ view: v === "grid" ? undefined : v })}
                  aria-pressed={view === v}
                  aria-label={v === "grid" ? "Grid view" : "List view"}
                  className={`p-2 rounded-full ${view === v ? "bg-ink text-text-on-dark" : "text-text-muted hover:text-ink"}`}
                >
                  {v === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No colleges match"
            description={budget ? "No college with a published fee fits this budget. Many colleges haven't published fees yet; a counsellor can tell you the real figures." : "Try clearing a filter or searching for a different name."}
            actions={[{ label: "Ask a counsellor", href: "/medical/book?source=directory-empty" }]}
          />
        ) : view === "grid" ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.slice(0, visible).map((c) => (
              <li key={c.id} className="group rounded-[var(--radius-lg)] border border-hairline bg-paper-bright overflow-hidden flex flex-col hover:border-border-strong transition-colors">
                <Link href={`/medical/college/${c.id}`} className="block" tabIndex={-1} aria-hidden>
                  <CollegeCover id={c.id} type={c.type} stateCode={c.stateCode} established={c.established} className="w-full h-28" />
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-micro font-semibold text-text-muted">{c.type} · {c.city}, {c.state}</span>
                  <Link href={`/medical/college/${c.id}`} className="text-h4 text-ink mt-1.5 hover:text-gold-deep line-clamp-2">
                    {c.name}
                  </Link>
                  <dl className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-hairline">
                    <Stat label="MBBS seats" value={c.mbbsSeats ? String(c.mbbsSeats) : "—"} />
                    <Stat label="AIQ close" value={c.aiqClose ? formatRank(c.aiqClose) : "—"} />
                    <Stat label="Yearly fee" value={c.feeMin ? formatCurrencyShort(c.feeMin) : "—"} />
                  </dl>
                  <div className="mt-4 flex justify-end gap-2">
                    <SaveToShortlistButton entry={{ id: c.id, name: c.name, closing: c.aiqClose, basis: c.aiqClose ? `All India General · ${meta.cutoffYear} R1` : undefined }} />
                    <AddToCompareButton collegeId={c.id} collegeName={c.name} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-hairline bg-paper-bright overflow-x-auto">
            <table className="w-full text-small">
              <thead className="text-left text-text-muted border-b border-hairline">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">College</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">MBBS seats</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">AIQ close {"(R1)"}</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Yearly fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.slice(0, visible).map((c) => (
                  <tr key={c.id} className="hover:bg-paper">
                    <td className="px-4 py-3 min-w-[16rem]">
                      <Link href={`/medical/college/${c.id}`} className="font-semibold text-ink hover:text-gold-deep">{c.name}</Link>
                      <span className="block text-micro font-normal tracking-normal text-text-muted">{c.city}, {c.state}</span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{c.type}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.mbbsSeats || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.aiqClose ? formatRank(c.aiqClose) : "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{feeLabel(c)}</td>
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

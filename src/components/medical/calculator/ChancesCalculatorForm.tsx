"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTrack } from "@/lib/medical/TrackProvider";
import { parseIndianNumber, formatIndian } from "@/lib/medical/format";
import { INDIA_STATES } from "@/lib/medical/mockData";
import meta from "@/data/meta.json";
import { KEA_GROUPS, KEA_SEATS, KEA_SUB_QUOTAS, composeKeaCode, parseKeaCode, type KeaSeat } from "@/lib/medical/karnataka";
import { ArrowRight } from "lucide-react";
import { track as trackEvent } from "@vercel/analytics";

interface ChancesCalculatorFormProps {
  /** hero: the homepage card, which supplies its own heading; landing: a standalone card; results: the compact bar in the results hero (its card comes from the page). */
  mode: "hero" | "landing" | "results";
}

export default function ChancesCalculatorForm({ mode }: ChancesCalculatorFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { track, setTrack } = useTrack();

  // On the results page the address decides UG or PG, so a shared PG link opens as PG.
  const urlTrack = searchParams.get("track");
  useEffect(() => {
    if (mode === "results" && (urlTrack === "ug" || urlTrack === "pg")) setTrack(urlTrack);
  }, [mode, urlTrack, setTrack]);

  // Initialize state from URL if in results mode, otherwise defaults
  const initRank = searchParams.get("rank") || "";
  const initQuota = searchParams.get("quota") || "aiq";
  const initCategory = searchParams.get("category") || "general";
  const initState = searchParams.get("state") || "";
  const initCourse = searchParams.get("course") || "all";

  const [rankInput, setRankInput] = useState(initRank);
  const [quota, setQuota] = useState(initQuota);
  const [category, setCategory] = useState(initCategory);
  const [domicileState, setDomicileState] = useState(initState);
  const [course, setCourse] = useState(initCourse);

  const initKea = parseKeaCode(searchParams.get("stateCategory"));
  const [keaSeat, setKeaSeat] = useState<KeaSeat>(initKea.seat);
  const [keaGroup, setKeaGroup] = useState(initKea.group);
  const [keaSubQuota, setKeaSubQuota] = useState(initKea.subQuota);
  // Karnataka has its own categories, so the national ones would mislead here.
  const usesKarnataka = quota === "state" && domicileState === "KA";
  // Other states with data offer their own codes from one list.
  const allOptions = meta.stateOptions as Record<string, { code: string; label: string }[]>;
  const stateOptions = quota === "state" ? allOptions[domicileState] : undefined;
  const [stateCode, setStateCode] = useState(searchParams.get("stateCategory") || "");
  const chosenStateCode = stateOptions?.some((o) => o.code === stateCode) ? stateCode : stateOptions?.[0]?.code;
  const usesOwnCategories = usesKarnataka || !!stateOptions;
  // A few states counsel on their own rank, so an All India rank would give wrong answers.
  const stateRanks = meta.stateRanks as Record<string, { label: string; help: string }>;
  const stateRank = quota === "state" ? stateRanks[domicileState] : undefined;

  const handleRankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and commas
    const val = e.target.value.replace(/[^\d,]/g, "");
    setRankInput(val);
  };

  const handleRankBlur = () => {
    // Format on blur
    const num = parseIndianNumber(rankInput);
    if (num) {
      setRankInput(formatIndian(num));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rankNum = parseIndianNumber(rankInput);
    if (!rankNum) return; // Simple validation

    const params = new URLSearchParams();
    params.set("track", track);
    params.set("rank", rankNum.toString());
    params.set("quota", quota);
    params.set("category", category);
    
    // PG has no state quota data, so a state quota choice left over from UG becomes All India.
    if (track === "pg" && quota === "state") params.set("quota", "aiq");
    if (track === "ug" && quota === "state" && domicileState) {
      params.set("state", domicileState);
    }
    if (usesKarnataka) {
      params.set("stateCategory", composeKeaCode(keaSeat, keaGroup, keaSubQuota));
    } else if (chosenStateCode) {
      params.set("stateCategory", chosenStateCode);
    }
    if (track === "pg" && course !== "all") {
      params.set("course", course);
    }

    trackEvent("rank_entered", { track, quota: params.get("quota") ?? quota, from: mode });
    router.push(`/medical/results?${params.toString()}`);
  };

  const isHero = mode === "hero";
  const isLanding = mode === "landing";
  const fieldSpan = isHero ? "" : isLanding ? "lg:col-span-4" : "lg:flex-1 lg:min-w-0";

  return (
    <form 
      onSubmit={handleSubmit}
      className={isLanding ? "bg-paper border border-hairline rounded-[var(--radius-md)] p-6 md:p-10 shadow-card" : ""}
    >
      {isLanding && (
        <div className="mb-8">
          <h2 className="text-h2 text-text-main mb-2">Check Your Chances</h2>
          <p className="text-body text-text-muted">
            Enter your NEET {track.toUpperCase()} rank and category to see which colleges you can realistically get into.
          </p>
        </div>
      )}

      <div className={`grid ${isHero ? "gap-4 sm:grid-cols-2" : `gap-6 ${isLanding ? "md:grid-cols-2 lg:grid-cols-12" : "md:grid-cols-2 lg:flex lg:gap-4 items-end"}`}`}>
        
        {/* Rank Input */}
        <div className={`${fieldSpan}`}>
          <label htmlFor="rank-input" className="block text-small font-semibold text-text-main mb-2">
            {stateRank ? stateRank.label : `NEET ${track.toUpperCase()} Rank`}
          </label>
          <input
            id="rank-input"
            type="text"
            required
            aria-describedby={stateRank ? "rank-help" : undefined}
            value={rankInput}
            onChange={handleRankChange}
            onBlur={handleRankBlur}
            placeholder="e.g. 12,500"
            className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body tabular-nums focus:outline-none focus:border-gold transition-colors"
          />
          {stateRank && (
            <p id="rank-help" className="text-micro text-text-muted mt-2">{stateRank.help}</p>
          )}
        </div>

        {/* Quota */}
        <div className={`${fieldSpan}`}>
          <label htmlFor="quota-select" className="block text-small font-semibold text-text-main mb-2">
            Counselling Quota
          </label>
          <select
            id="quota-select"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-gold transition-colors"
          >
            <option value="aiq">{track === "pg" ? "All India Quota (50%)" : "All India Quota (15%)"}</option>
            {/* PG state quota results aren't collected yet. */}
            {track === "ug" && <option value="state">State Quota (85%)</option>}
            <option value="deemed">Deemed Universities</option>
            <option value="central">Central Universities</option>
          </select>
        </div>

        {/* Category */}
        {!usesOwnCategories && (
          <div className={`${fieldSpan}`}>
            <label htmlFor="category-select" className="block text-small font-semibold text-text-main mb-2">
              Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-gold transition-colors"
            >
              <option value="general">General (UR)</option>
              <option value="obc">OBC-NCL</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
              <option value="ews">EWS</option>
            </select>
          </div>
        )}

        {/* State (Conditional) */}
        {quota === "state" && (
          <div className={`${fieldSpan}`}>
            <label htmlFor="state-select" className="block text-small font-semibold text-text-main mb-2">
              Counselling State
            </label>
            <select
              id="state-select"
              required
              value={domicileState}
              onChange={(e) => setDomicileState(e.target.value)}
              className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-gold transition-colors"
            >
              <option value="">Select State</option>
              {INDIA_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Another state's own categories */}
        {stateOptions && (
          <div className={`${fieldSpan}`}>
            <label htmlFor="state-code" className="block text-small font-semibold text-text-main mb-2">
              State Category
            </label>
            <select
              id="state-code"
              value={chosenStateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-gold transition-colors"
            >
              {stateOptions.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
            </select>
          </div>
        )}

        {/* Karnataka's own seat types and categories */}
        {usesKarnataka && (
          <>
            <div className={`${fieldSpan}`}>
              <label htmlFor="kea-seat" className="block text-small font-semibold text-text-main mb-2">
                Seat Type
              </label>
              <select
                id="kea-seat"
                value={keaSeat}
                onChange={(e) => setKeaSeat(e.target.value as KeaSeat)}
                className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-gold transition-colors"
              >
                {KEA_SEATS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {keaSeat === "government" && (
              <div className={`${fieldSpan}`}>
                <label htmlFor="kea-group" className="block text-small font-semibold text-text-main mb-2">
                  Karnataka Category
                </label>
                <select
                  id="kea-group"
                  value={keaGroup}
                  onChange={(e) => setKeaGroup(e.target.value)}
                  className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-gold transition-colors"
                >
                  {KEA_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            )}
            {keaSeat !== "private_open" && (
              <div className={`${fieldSpan}`}>
                <label htmlFor="kea-sub" className="block text-small font-semibold text-text-main mb-2">
                  Sub-quota
                </label>
                <select
                  id="kea-sub"
                  value={keaSeat === "private_karnataka" && keaSubQuota !== "H" ? "G" : keaSubQuota}
                  onChange={(e) => setKeaSubQuota(e.target.value)}
                  className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-gold transition-colors"
                >
                  {KEA_SUB_QUOTAS.filter((s) => keaSeat === "government" || s.value === "G" || s.value === "H").map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* Course (Conditional for PG) */}
        {track === "pg" && (
          <div className={`${fieldSpan}`}>
            <label htmlFor="specialty-select" className="block text-small font-semibold text-text-main mb-2">
              Specialty
            </label>
            <select
              id="specialty-select"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-gold transition-colors"
            >
              <option value="all">All Specialties</option>
              {meta.pgCourses.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Submit */}
        <div className={isHero ? "sm:col-span-2 pt-1" : isLanding ? "lg:col-span-4 flex items-end" : "lg:w-44 lg:shrink-0"}>
          <button
            type="submit"
            className="w-full h-[50px] inline-flex items-center justify-center gap-2 bg-ink text-gold font-semibold text-body rounded-[var(--radius-sm)] hover:bg-ink-deep hover:text-gold-deep transition-colors"
          >
            {isHero || isLanding ? "See my colleges" : "Update"}
            {(isHero || isLanding) && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </form>
  );
}

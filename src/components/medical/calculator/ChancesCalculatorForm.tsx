"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTrack } from "@/lib/medical/TrackProvider";
import { parseIndianNumber, formatIndian } from "@/lib/medical/format";
import { INDIA_STATES } from "@/lib/medical/mockData";
import { ArrowRight } from "lucide-react";

interface ChancesCalculatorFormProps {
  mode: "landing" | "results";
}

export default function ChancesCalculatorForm({ mode }: ChancesCalculatorFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { track } = useTrack();

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
    
    if (quota === "state" && domicileState) {
      params.set("state", domicileState);
    }
    if (course !== "all") {
      params.set("course", course);
    }

    router.push(`/medical/results?${params.toString()}`);
  };

  const isLanding = mode === "landing";

  return (
    <form 
      onSubmit={handleSubmit}
      className={`bg-paper border border-hairline rounded-[var(--radius-md)] ${isLanding ? "p-6 md:p-10 shadow-card" : "p-4 md:p-6"}`}
    >
      {isLanding && (
        <div className="mb-8">
          <h2 className="text-h2 text-text-main mb-2">Check Your Chances</h2>
          <p className="text-body text-text-muted">
            Enter your NEET {track.toUpperCase()} rank and category to see which colleges you can realistically get into.
          </p>
        </div>
      )}

      <div className={`grid gap-6 ${isLanding ? "md:grid-cols-2 lg:grid-cols-12" : "md:grid-cols-2 lg:grid-cols-5 items-end"}`}>
        
        {/* Rank Input */}
        <div className={`${isLanding ? "lg:col-span-4" : "lg:col-span-1"}`}>
          <label className="block text-small font-semibold text-text-main mb-2">
            NEET {track.toUpperCase()} Rank
          </label>
          <input
            type="text"
            required
            value={rankInput}
            onChange={handleRankChange}
            onBlur={handleRankBlur}
            placeholder="e.g. 12,500"
            className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body tabular-nums focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Quota */}
        <div className={`${isLanding ? "lg:col-span-4" : "lg:col-span-1"}`}>
          <label className="block text-small font-semibold text-text-main mb-2">
            Counselling Quota
          </label>
          <select
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-gold transition-colors"
          >
            <option value="aiq">All India Quota (15%)</option>
            <option value="state">State Quota (85%)</option>
            <option value="deemed">Deemed Universities</option>
            <option value="central">Central Universities</option>
          </select>
        </div>

        {/* Category */}
        <div className={`${isLanding ? "lg:col-span-4" : "lg:col-span-1"}`}>
          <label className="block text-small font-semibold text-text-main mb-2">
            Category
          </label>
          <select
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

        {/* State (Conditional) */}
        {quota === "state" && (
          <div className={`${isLanding ? "lg:col-span-4" : "lg:col-span-1"}`}>
            <label className="block text-small font-semibold text-text-main mb-2">
              Domicile State
            </label>
            <select
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

        {/* Course (Conditional for PG) */}
        {track === "pg" && (
          <div className={`${isLanding ? "lg:col-span-4" : "lg:col-span-1"}`}>
            <label className="block text-small font-semibold text-text-main mb-2">
              Specialty
            </label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-gold transition-colors"
            >
              <option value="all">All Specialties</option>
              <option value="MD General Medicine">MD General Medicine</option>
              <option value="MS General Surgery">MS General Surgery</option>
              {/* Add more in real app */}
            </select>
          </div>
        )}

        {/* Submit */}
        <div className={`${isLanding ? "lg:col-span-4 flex items-end" : "lg:col-span-1"}`}>
          <button
            type="submit"
            className="w-full h-[50px] inline-flex items-center justify-center gap-2 bg-ink text-gold font-semibold text-body rounded-[var(--radius-sm)] hover:bg-ink-deep hover:text-gold-deep transition-colors"
          >
            {isLanding ? "See My Chances" : "Update"}
            {isLanding && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </form>
  );
}

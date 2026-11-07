"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { useLocalValue } from "@/lib/medical/sessionValue";

/** Every document the counselling steps ask for, ticked off in this browser. */
export default function DocumentChecklist({ documents }: { documents: string[] }) {
  const [raw, setRaw] = useLocalValue("medical:documents", "[]");
  const done = useMemo(() => {
    try {
      const list = JSON.parse(raw);
      return new Set<string>(Array.isArray(list) ? list : []);
    } catch {
      return new Set<string>();
    }
  }, [raw]);

  const toggle = (doc: string) => {
    const next = new Set(done);
    if (next.has(doc)) next.delete(doc);
    else next.add(doc);
    setRaw(JSON.stringify([...next]));
  };

  return (
    <div>
      <p className="text-small text-text-muted mb-4" aria-live="polite">
        <span className="font-semibold text-ink tabular-nums">{documents.filter((d) => done.has(d)).length}</span> of {documents.length} ready
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {documents.map((doc) => {
          const ticked = done.has(doc);
          return (
            <li key={doc}>
              <label className={`flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 cursor-pointer transition-colors ${ticked ? "border-safe/40 bg-safe/[0.06]" : "border-hairline bg-paper-bright hover:border-border-strong"}`}>
                <input type="checkbox" checked={ticked} onChange={() => toggle(doc)} className="sr-only" />
                <span aria-hidden className={`mt-0.5 w-5 h-5 shrink-0 rounded-[4px] border flex items-center justify-center ${ticked ? "bg-safe border-safe text-white" : "border-border-strong"}`}>
                  {ticked && <Check className="w-3.5 h-3.5" />}
                </span>
                <span className={`text-small ${ticked ? "text-text-muted line-through" : "text-ink"}`}>{doc}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-micro font-normal tracking-normal text-text-muted">Ticks stay in this browser. Exact lists differ by state and quota; check your counselling body&apos;s notice.</p>
    </div>
  );
}

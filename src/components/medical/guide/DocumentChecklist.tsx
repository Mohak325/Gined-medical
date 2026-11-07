"use client";

import { useMemo, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { useLocalValue } from "@/lib/medical/sessionValue";
import TweenNumber from "@/components/motion/TweenNumber";

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

  const ready = documents.filter((d) => done.has(d)).length;
  const all = ready === documents.length;

  return (
    <div className="rounded-[28px] surface-premium p-5 md:p-7">
      <div className="flex items-end justify-between gap-4 mb-3" aria-live="polite">
        <p className="font-[family-name:var(--font-instrument)] text-[2.5rem] leading-none text-ink tabular-nums">
          <TweenNumber value={ready} duration={400} />
          <span className="text-text-muted"> / {documents.length}</span>
        </p>
        <p className={`text-small font-semibold ${all ? "text-[var(--safe-ink)]" : "text-text-muted"}`}>{all ? "Everything is ready" : "ready"}</p>
      </div>
      <div className="relative h-1.5 rounded-full bg-ink/[0.08] overflow-hidden mb-6" aria-hidden>
        <span className="bar-fill bg-safe rounded-full" style={{ "--s": documents.length ? ready / documents.length : 0 } as CSSProperties} />
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {documents.map((doc) => {
          const ticked = done.has(doc);
          return (
            <li key={doc}>
              <label
                className={`group flex items-start gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-[background-color,border-color,transform] duration-300 active:scale-[0.98] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                  ticked ? "border-safe/35 bg-[var(--safe-bg)]" : "border-hairline bg-paper-bright hover:border-border-strong"
                }`}
              >
                <input type="checkbox" checked={ticked} onChange={() => toggle(doc)} className="sr-only" />
                <span
                  aria-hidden
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border flex items-center justify-center transition-[background-color,border-color,transform] duration-300 ${
                    ticked ? "bg-safe border-safe text-white scale-110" : "border-border-strong group-hover:border-ink"
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 transition-[opacity,transform] duration-300 ${ticked ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
                </span>
                <span className={`text-small transition-colors ${ticked ? "text-text-muted line-through decoration-safe/60" : "text-ink"}`}>{doc}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-micro font-normal tracking-normal text-text-muted">Ticks stay in this browser. Exact lists differ by state and quota; check your counselling body&apos;s notice.</p>
    </div>
  );
}

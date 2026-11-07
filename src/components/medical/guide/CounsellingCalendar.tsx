"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import calendar from "@/content/calendar.json";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

// Today's date only exists in the browser; the server render shows the list with nothing marked.
const subscribe = () => () => {};
const useToday = () => useSyncExternalStore(subscribe, () => new Date().toISOString().slice(0, 10), () => null);

function SampleTag() {
  if (!calendar.placeholder) return null;
  return <span className="text-micro font-semibold uppercase tracking-widest text-gold border border-dashed border-gold/60 rounded-full px-2.5 py-0.5">Sample dates</span>;
}

/** The full counselling calendar on a dark card, with the next event marked by a pulsing dot. */
export default function CounsellingCalendar() {
  const today = useToday();
  const nextIndex = today ? calendar.events.findIndex((e) => e.date >= today) : -1;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h3 className="font-[family-name:var(--font-instrument)] text-[1.75rem] leading-none">{calendar.cycle}</h3>
        <SampleTag />
      </div>
      <ol className="relative ml-2 space-y-6">
        <span aria-hidden className="absolute left-0 top-1 bottom-1 w-px bg-white/15" />
        {calendar.events.map((event, i) => {
          const past = today ? event.date < today : false;
          const next = i === nextIndex;
          return (
            <li key={`${event.date}-${event.title}`} className={`pl-7 relative transition-opacity ${past ? "opacity-50" : ""}`}>
              <span aria-hidden className="absolute -left-[7px] top-1.5 w-3.5 h-3.5">
                {next && <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-60" />}
                <span className={`absolute inset-0 rounded-full ring-4 ring-ink ${next ? "bg-gold" : event.kind === "state" ? "bg-white/40" : "bg-white/80"}`} />
              </span>
              <p className="text-small font-semibold text-gold tabular-nums">
                {day(event.date)} · {event.authority}
                {next && <span className="ml-2 text-micro uppercase tracking-widest text-ink bg-gold rounded-full px-2 py-0.5">Next</span>}
              </p>
              <p className="text-body font-semibold mt-0.5">{event.title}</p>
              <p className="text-small text-text-on-dark/75 mt-0.5">{event.body}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** One line under the homepage hero: what's next in counselling. */
export function CalendarStrip() {
  const today = useToday();
  const upcoming = today ? calendar.events.filter((e) => e.date >= today).slice(0, 3) : calendar.events.slice(0, 3);
  if (upcoming.length === 0) return null;
  return (
    <section aria-label="Counselling calendar" className="bg-ink text-text-on-dark">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
        <p className="flex items-center gap-2 text-small font-semibold shrink-0">
          <CalendarDays className="w-4 h-4 text-gold" aria-hidden /> Coming up
          {calendar.placeholder && <span className="text-micro uppercase tracking-widest text-gold">(sample dates)</span>}
        </p>
        <ul className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-small text-text-on-dark/80 min-w-0">
          {upcoming.map((e) => (
            <li key={`${e.date}-${e.title}`} className="truncate">
              <span className="text-gold tabular-nums">{day(e.date)}</span> {e.title}
            </li>
          ))}
        </ul>
        <Link href="/medical/guide#calendar" className="md:ml-auto shrink-0 inline-flex items-center gap-1 text-small font-semibold text-gold hover:underline">
          Full calendar <ArrowUpRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

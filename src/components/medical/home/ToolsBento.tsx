import Link from "next/link";
import { ArrowUpRight, Building2, Columns3, IndianRupee, LayoutGrid } from "lucide-react";
import meta from "@/data/meta.json";

const LABELS = [
  // Wording follows CONFIDENCE_THRESHOLDS in src/lib/medical/confidence.ts.
  { name: "Safe", tone: "bg-safe", text: "Your rank is at least 15% better than the closing rank." },
  { name: "Moderate", tone: "bg-moderate", text: "Near the closing rank: up to 15% better or 10% past it." },
  { name: "Ambitious", tone: "bg-ambitious", text: "10 to 35% past the closing rank. Worth a place in your list." },
];

function Tile({
  href,
  className = "",
  icon: Icon,
  title,
  body,
  figure,
}: {
  href: string;
  className?: string;
  icon: typeof Building2;
  title: string;
  body: string;
  figure?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col justify-between gap-8 rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-6 md:p-7 transition-[border-color,transform] duration-[var(--dur-base)] hover:-translate-y-0.5 hover:border-border-strong ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="w-10 h-10 rounded-full bg-paper-dim flex items-center justify-center">
          <Icon className="w-5 h-5 text-ink" aria-hidden />
        </span>
        <ArrowUpRight className="w-5 h-5 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
      </div>
      <div>
        {figure && <p className="text-h1 text-ink tabular-nums mb-1">{figure}</p>}
        <h3 className="text-h4 text-ink">{title}</h3>
        <p className="text-small text-text-muted mt-1">{body}</p>
      </div>
    </Link>
  );
}

export default function ToolsBento() {
  return (
    <section id="tools" className="py-20 md:py-28">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
        <header className="max-w-2xl mb-10 md:mb-14">
          <p className="text-eyebrow text-gold-deep mb-4">Free tools</p>
          <h2 className="text-display text-ink">Everything you need before choice filling.</h2>
        </header>

        <div className="grid gap-4 md:grid-cols-6 md:auto-rows-[minmax(200px,auto)]">
          <Link
            href="/medical#finder"
            className="group md:col-span-4 md:row-span-2 relative overflow-hidden rounded-[var(--radius-lg)] bg-ink text-text-on-dark p-7 md:p-10 flex flex-col justify-between gap-10"
          >
            <div aria-hidden className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-gold/15 blur-3xl" />
            <div className="relative flex items-start justify-between">
              <p className="text-eyebrow text-gold">College Finder</p>
              <ArrowUpRight className="w-6 h-6 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </div>
            <div className="relative">
              <h3 className="text-h1 max-w-lg">Your rank against every college&apos;s {meta.cutoffYears.join(" and ")} closing ranks.</h3>
              <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                {LABELS.map((label) => (
                  <li key={label.name} className="rounded-[var(--radius-md)] bg-white/[0.06] border border-white/10 p-4">
                    <span className="flex items-center gap-2 text-small font-semibold">
                      <span className={`w-2.5 h-2.5 rounded-full ${label.tone}`} aria-hidden />
                      {label.name}
                    </span>
                    <span className="block text-micro font-normal tracking-normal text-text-on-dark/65 mt-2 leading-relaxed">{label.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Link>

          <Tile
            href="/medical/colleges"
            className="md:col-span-2"
            icon={Building2}
            figure={meta.collegeCount.toLocaleString("en-IN")}
            title="Colleges directory"
            body="Search and filter every medical college by state and type."
          />
          <Tile
            href="/medical/seat-matrix"
            className="md:col-span-2"
            icon={LayoutGrid}
            figure={meta.ugSeats.toLocaleString("en-IN")}
            title="Seat matrix"
            body={`${meta.seatYear} seats by college, course and quota.`}
          />
          <Tile
            href="/medical/compare"
            className="md:col-span-3"
            icon={Columns3}
            title="Compare colleges"
            body="Put up to three colleges side by side: cutoffs, seats and fees."
          />
          <Tile
            href="/medical/colleges"
            className="md:col-span-3"
            icon={IndianRupee}
            figure={meta.collegesWithFees.toLocaleString("en-IN")}
            title="Colleges with official fees"
            body="Fees taken from counselling bodies' and fee committees' own documents."
          />
        </div>
      </div>
    </section>
  );
}

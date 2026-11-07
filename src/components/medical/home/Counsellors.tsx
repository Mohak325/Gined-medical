import Link from "next/link";
import { ArrowUpRight, UserRound } from "lucide-react";
import team from "@/content/team.json";

/** Shown on anything from team.json while it still holds placeholder content, so samples never pass as real. */
function SampleTag() {
  if (!team.placeholder) return null;
  return (
    <span className="inline-block text-micro font-semibold uppercase tracking-widest text-ambitious border border-dashed border-ambitious/50 rounded-full px-2.5 py-0.5">
      Sample
    </span>
  );
}

export function TrustStats({ dark = false }: { dark?: boolean }) {
  return (
    <dl className="grid grid-cols-3 gap-4">
      {team.stats.map((stat) => (
        <div key={stat.label} className="flex flex-col-reverse justify-end">
          <dt className={`text-small ${dark ? "text-text-on-dark/65" : "text-text-muted"}`}>{stat.label}</dt>
          <dd className={`text-h1 tabular-nums ${dark ? "text-text-on-dark" : "text-ink"}`}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Counsellors() {
  return (
    <section id="counsellors" className="scroll-mt-16 py-20 md:py-28 bg-paper-bright border-y border-hairline">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end mb-10 md:mb-14">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-gold-deep mb-4 flex items-center gap-3">Your counsellors <SampleTag /></p>
            <h2 className="text-display text-ink">People who have been through every round.</h2>
          </div>
          <div className="lg:col-span-5">
            <TrustStats />
          </div>
        </header>

        <ul className="grid gap-4 md:grid-cols-3">
          {team.counsellors.map((person, i) => (
            <li key={`${person.role}-${i}`} className="rounded-[var(--radius-lg)] border border-hairline bg-paper p-6 md:p-7 flex flex-col">
              <div className="w-16 h-16 rounded-full bg-paper-dim flex items-center justify-center text-text-muted" aria-hidden>
                <UserRound className="w-8 h-8" />
              </div>
              <h3 className="text-h3 text-ink mt-6">{person.name}</h3>
              <p className="text-small font-semibold text-gold-deep">{person.role}</p>
              <p className="text-small text-text-muted mt-3">{person.credentials}</p>
              <p className="text-small text-text-muted mt-1 flex-grow">{person.experience}</p>
            </li>
          ))}
        </ul>

        <Link href="/medical/book?source=counsellors" className="mt-8 inline-flex items-center gap-1.5 text-small font-semibold text-ink underline underline-offset-4 hover:text-gold-deep">
          Book a session with a counsellor <ArrowUpRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

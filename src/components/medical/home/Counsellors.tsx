import type { CSSProperties } from "react";
import { UserRound } from "lucide-react";
import SplitWords from "@/components/motion/SplitWords";
import Cta from "@/components/ui/Cta";
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
          <dd className={`text-[clamp(2.25rem,4vw,3.25rem)] leading-none font-[family-name:var(--font-instrument)] tabular-nums ${dark ? "text-text-on-dark" : "text-ink"}`}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Counsellors() {
  return (
    <section id="counsellors" className="scroll-mt-16 py-24 md:py-32 bg-paper-bright border-y border-hairline">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end mb-10 md:mb-14">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-gold-deep mb-4 flex items-center gap-3" data-reveal="fade">Your counsellors <SampleTag /></p>
            <SplitWords text="People who have been through every round." className="text-display text-ink" />
          </div>
          <div className="lg:col-span-5" data-reveal="up">
            <TrustStats />
          </div>
        </header>

        <ul className="grid gap-4 md:grid-cols-3">
          {team.counsellors.map((person, i) => (
            <li
              key={`${person.role}-${i}`}
              data-spotlight=""
              data-reveal="up"
              style={{ "--delay": `${i * 120}ms` } as CSSProperties}
              className="group surface-premium rounded-[24px] p-7 md:p-8 flex flex-col transition-transform duration-500 hover:-translate-y-1"
            >
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-ink to-ink-soft flex items-center justify-center text-gold ring-4 ring-paper-bright shadow-lg" aria-hidden>
                <UserRound className="w-9 h-9" />
              </div>
              <h3 className="text-h2 font-[family-name:var(--font-instrument)] font-normal text-ink mt-6">{person.name}</h3>
              <p className="text-small font-semibold text-gold-deep">{person.role}</p>
              <p className="text-small text-text-muted mt-3">{person.credentials}</p>
              <p className="text-small text-text-muted mt-1 flex-grow">{person.experience}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10" data-reveal="up">
          <Cta href="/medical/book?source=counsellors">Book a session with a counsellor</Cta>
        </div>
      </div>
    </section>
  );
}

import { Suspense, type CSSProperties } from "react";
import { Clock, PhoneCall, ListChecks } from "lucide-react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import Photo from "@/components/motion/Photo";
import SplitWords from "@/components/motion/SplitWords";
import { TrustStats } from "@/components/medical/home/Counsellors";
import team from "@/content/team.json";
import BookingForm from "./BookingForm";

export const metadata = {
  title: "Book a counselling session — gined.in",
  description: "Leave your name and number and a NEET counsellor will call you to plan your college list and choice filling.",
};

const steps = [
  { icon: Clock, title: "Under a minute", body: "Your name and number are enough to start." },
  { icon: PhoneCall, title: "We call you", body: "Our counselling team gets in touch to schedule your first session." },
  { icon: ListChecks, title: "Plan your list", body: "Go through your rank, options and choice-filling order together." },
];

export default function BookPage() {
  return (
    <>
      <SiteNavbar />
      <main className="relative min-h-screen bg-ink-deep text-text-on-dark overflow-hidden">
        <Photo name="laptopStethoscope" priority overlay="hero" decorative />
        <div aria-hidden className="absolute inset-0 z-[1] bg-ink-deep/55" />
        <div aria-hidden className="absolute -right-40 top-1/3 z-[1] w-[40rem] h-[40rem] rounded-full bg-gold/10 blur-[140px]" />

        <div className="relative z-[2] max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-40 pb-20 md:pb-28 grid gap-10 lg:gap-x-16 lg:gap-y-0 lg:grid-cols-12 lg:grid-rows-[auto_1fr] items-start">
          {/* On phones the form comes straight after the headline; on desktop it sits beside both. */}
          <header className="lg:col-span-5 lg:row-start-1 lg:pt-4">
            <p className="intro-fade text-eyebrow text-gold mb-5 flex items-center gap-3">
              <span aria-hidden className="h-px w-10 bg-gold" /> Book a session
            </p>
            <SplitWords
              as="h1"
              intro
              delay={100}
              className="text-display [text-wrap:balance]"
              parts={[{ text: "A counsellor who reads the numbers" }, { text: "with you.", className: "italic text-sheen pr-1" }]}
            />
          </header>

          <section className="intro-scale lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:row-span-2" aria-label="Booking form" style={{ "--delay": "200ms" } as CSSProperties}>
            <Suspense fallback={<div className="skeleton h-[560px] rounded-[28px]" />}>
              <BookingForm />
            </Suspense>
          </section>

          <section className="lg:col-span-5 lg:row-start-2" aria-label="How booking works">
            <ul className="intro lg:mt-10 space-y-3" style={{ "--delay": "350ms" } as CSSProperties}>
              {steps.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4 rounded-[20px] surface-ink-glass p-4">
                  <span className="w-10 h-10 shrink-0 rounded-full bg-gold/15 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gold" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="block text-small text-text-on-dark/75 mt-0.5">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="intro-fade mt-10 pt-8 border-t border-white/10" style={{ "--delay": "550ms" } as CSSProperties}>
              {team.placeholder && <p className="text-micro font-semibold uppercase tracking-widest text-gold mb-4">Sample figures</p>}
              <TrustStats dark />
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

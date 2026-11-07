import { Suspense } from "react";
import { Clock, PhoneCall, ListChecks } from "lucide-react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
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
      <main className="bg-paper min-h-screen pt-24 md:pt-32 pb-20">
        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 grid gap-10 lg:grid-cols-12">
          <section className="lg:col-span-5 lg:pt-4">
            <p className="text-eyebrow text-gold-deep mb-4">Book a session</p>
            <h1 className="text-display text-ink">A counsellor who reads the numbers with you.</h1>
            <ul className="mt-10 space-y-6">
              {steps.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="w-10 h-10 shrink-0 rounded-full bg-paper-dim flex items-center justify-center">
                    <Icon className="w-5 h-5 text-ink" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-h4 text-ink">{title}</span>
                    <span className="block text-small text-text-muted">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-10 pt-8 border-t border-hairline">
              {team.placeholder && <p className="text-micro font-semibold uppercase tracking-widest text-ambitious mb-4">Sample figures</p>}
              <TrustStats />
            </div>
          </section>

          <section className="lg:col-span-7" aria-label="Booking form">
            <Suspense fallback={<div className="h-[520px] rounded-[var(--radius-lg)] border border-hairline bg-paper-bright animate-pulse" />}>
              <BookingForm />
            </Suspense>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

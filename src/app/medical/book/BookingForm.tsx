"use client";

import { useRef, useState, useTransition, type CSSProperties, type ReactNode, type SelectHTMLAttributes } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { track as trackEvent } from "@vercel/analytics";
import { ArrowUpRight, ChevronDown, MessageCircle } from "lucide-react";
import packagesData from "@/content/packages.json";
import { INDIA_STATES } from "@/lib/medical/mockData";
import { whatsappHref } from "@/lib/medical/booking";
import { SHORTLIST_KEY, shortlistText, type ShortlistEntry } from "@/lib/medical/shortlist";
import { readStored } from "@/lib/medical/sessionValue";
import Cta from "@/components/ui/Cta";
import { submitLead, type LeadResult } from "./actions";

const inputClass =
  "w-full px-4 py-3.5 bg-paper-bright border border-hairline rounded-2xl text-body text-ink shadow-[inset_0_1px_2px_rgba(15,46,61,0.06)] placeholder:text-text-muted/60 focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/15 transition-[border-color,box-shadow]";
const labelClass = "block text-small font-semibold text-ink mb-2";

const ERROR_MESSAGES: Record<Extract<LeadResult, { ok: false }>["reason"], string> = {
  invalid: "Please check your name and phone number (at least 10 digits), then try again.",
  delivery: "We couldn't send your request, so it has not reached our team. Please try again in a little while, or message us on WhatsApp.",
};

type Step = "contact" | "details" | "done";

function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${inputClass} appearance-none pr-10 cursor-pointer`} />
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden />
    </div>
  );
}

/** The main button: an ink pill with a gold arrow disc, as on the rest of the site. */
function SubmitButton({ pending, children, className = "" }: { pending: boolean; children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      data-magnetic=""
      className={`group btn-shine inline-flex items-center justify-between gap-3 pl-6 pr-2 py-2 rounded-full bg-ink text-text-on-dark font-semibold shadow-[0_10px_30px_-10px_rgba(8,26,36,0.6)] hover:bg-ink-deep transition-colors disabled:opacity-60 disabled:cursor-wait ${className}`}
    >
      <span className="py-1.5">{pending ? "Sending…" : children}</span>
      <span className="w-10 h-10 rounded-full bg-gold text-ink flex items-center justify-center transition-transform duration-500 group-hover:rotate-45" aria-hidden>
        {pending ? <span className="w-4 h-4 rounded-full border-2 border-ink border-t-transparent animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
      </span>
    </button>
  );
}

function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-5 p-4 text-small text-[var(--ambitious-ink)] bg-[var(--ambitious-bg)] border border-ambitious/20 rounded-2xl">
      {children}
    </p>
  );
}

export default function BookingForm() {
  const params = useSearchParams();
  const get = (key: string) => params.get(key) ?? "";
  const source = get("source");
  const fromFinder = source.startsWith("finder");
  const initialPackage = packagesData.packages.some((p) => p.id === get("package")) ? get("package") : "";

  const [step, setStep] = useState<Step>("contact");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pkg, setPkg] = useState(initialPackage);
  const leadId = useRef<string | null>(null);

  const send = (form: HTMLFormElement, stage: "contact" | "details", onOk: () => void) => {
    const data = new FormData(form);
    leadId.current ??= crypto.randomUUID();
    data.set("leadId", leadId.current);
    data.set("stage", stage);
    data.set("name", name);
    data.set("phone", phone);
    data.set("source", source);
    if (source === "shortlist" && stage === "details") {
      try {
        const saved = JSON.parse(readStored("local", SHORTLIST_KEY) ?? "[]") as ShortlistEntry[];
        if (saved.length) data.set("shortlist", shortlistText(saved));
      } catch {
        // A damaged list is simply not sent.
      }
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitLead(data);
        if (result.ok) {
          onOk();
          // The next step is shorter or taller than this one, so bring its top into view.
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else setError(ERROR_MESSAGES[result.reason]);
      } catch {
        setError(ERROR_MESSAGES.delivery);
      }
    });
  };

  const firstName = name.split(" ")[0];

  if (step === "done") {
    return (
      <div className="intro relative overflow-hidden rounded-[28px] surface-glass text-ink p-8 md:p-12">
        <div aria-hidden className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />
        <svg viewBox="0 0 64 64" className="relative w-16 h-16 draw-check" aria-hidden>
          <circle cx="32" cy="32" r="29" pathLength={1} fill="none" stroke="var(--safe)" strokeWidth="3" />
          <path d="M20 33 l8 8 l16 -18" pathLength={1} fill="none" stroke="var(--safe)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="relative font-[family-name:var(--font-instrument)] text-[2.5rem] md:text-[3.25rem] leading-[1.02] mt-8">Request received, {firstName}.</h2>
        <p className="relative text-body-large text-text-muted mt-4 max-w-lg">
          Our counselling team will contact you on <span className="font-semibold text-ink tabular-nums">{phone}</span> to schedule your first session. Want an answer sooner? Message us on WhatsApp.
        </p>
        <div className="relative mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <Cta href={whatsappHref(`Hi Gined, I just booked a session on the website. My name is ${name}.`)} external className="whitespace-nowrap">
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="w-4 h-4" aria-hidden /> Message us on WhatsApp
            </span>
          </Cta>
          {fromFinder ? (
            <button
              type="button"
              onClick={() => history.back()}
              className="whitespace-nowrap inline-flex items-center justify-center px-6 py-3 rounded-full border border-border-strong bg-paper-bright/60 text-small font-semibold text-ink hover:bg-paper-bright transition-colors"
            >
              Back to my colleges
            </button>
          ) : (
            <Cta href="/medical#finder" variant="outline" className="whitespace-nowrap">
              Check my chances meanwhile
            </Cta>
          )}
        </div>
      </div>
    );
  }

  const stepIndex = step === "contact" ? 0 : 1;

  return (
    <div className="relative rounded-[28px] surface-glass text-ink p-6 sm:p-8 md:p-10">
      <ol className="grid grid-cols-2 gap-3 mb-10" aria-label="Booking steps">
        {(["Your contact", "Your NEET details"] as const).map((label, i) => {
          const current = stepIndex === i;
          const done = stepIndex > i;
          return (
            <li key={label} aria-current={current ? "step" : undefined}>
              <span className="relative block h-1 rounded-full bg-ink/10 overflow-hidden" aria-hidden>
                <span className="bar-fill bg-gold rounded-full" style={{ "--s": done || current ? 1 : 0 } as CSSProperties} />
              </span>
              <span className={`mt-3 flex items-center gap-2 text-small ${current ? "font-semibold text-ink" : "text-text-muted"}`}>
                <span className="hidden sm:inline tabular-nums text-micro">{done ? "Done" : `Step ${i + 1}`}</span>
                <span className="hidden sm:inline" aria-hidden>·</span>
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {step === "contact" ? (
        <form
          key="contact"
          onSubmit={(e) => {
            e.preventDefault();
            send(e.currentTarget, "contact", () => {
              trackEvent("booking_started", { source: source || "direct" });
              setStep("details");
            });
          }}
        >
          <h2 className="font-[family-name:var(--font-instrument)] text-[2.25rem] md:text-[2.75rem] leading-[1.02]">Talk to a counsellor.</h2>
          <p className="text-body text-text-muted mt-3 mb-8">Leave your name and number. It takes under a minute.</p>
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor="lead-name" className={labelClass}>Full name</label>
              <input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" className={inputClass} />
            </div>
            <div>
              <label htmlFor="lead-phone" className={labelClass}>Phone number</label>
              <input
                id="lead-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                pattern="\+?[\d\s\-]{10,16}"
                title="Enter a phone number with at least 10 digits"
                className={`${inputClass} tabular-nums`}
              />
            </div>
          </div>
          {error && <ErrorNote>{error}</ErrorNote>}
          <SubmitButton pending={pending} className="mt-8 w-full">Continue</SubmitButton>
          <p className="mt-5 text-micro font-normal tracking-normal text-text-muted text-center">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-ink">Terms</Link> and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">Privacy Policy</Link>.
          </p>
        </form>
      ) : (
        <form
          key="details"
          className="intro"
          onSubmit={(e) => {
            e.preventDefault();
            send(e.currentTarget, "details", () => {
              trackEvent("booking_sent", { source: source || "direct", package: pkg || "none" });
              setStep("done");
            });
          }}
        >
          <h2 className="font-[family-name:var(--font-instrument)] text-[2.25rem] md:text-[2.75rem] leading-[1.02]">Thanks, {firstName}. A few details help us prepare.</h2>
          <p className="text-body text-text-muted mt-3 mb-8">Your number has reached our team. Everything below is optional.</p>

          <input type="hidden" name="track" value={get("track")} />
          <input type="hidden" name="stateCategory" value={get("stateCategory")} />
          <input type="hidden" name="package" value={pkg} />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-rank" className={labelClass}>NEET rank</label>
              <input id="lead-rank" name="rank" defaultValue={get("rank")} maxLength={20} inputMode="numeric" className={`${inputClass} tabular-nums`} />
            </div>
            <div>
              <label htmlFor="lead-category" className={labelClass}>Category</label>
              <Select id="lead-category" name="category" defaultValue={get("category")}>
                <option value="">Select</option>
                <option value="general">General (UR)</option>
                <option value="obc">OBC-NCL</option>
                <option value="sc">SC</option>
                <option value="st">ST</option>
                <option value="ews">EWS</option>
              </Select>
            </div>
            <div>
              <label htmlFor="lead-quota" className={labelClass}>Quota you&apos;re aiming for</label>
              <Select id="lead-quota" name="quota" defaultValue={get("quota")}>
                <option value="">Not sure yet</option>
                <option value="aiq">All India</option>
                <option value="state">State quota</option>
                <option value="deemed">Deemed universities</option>
                <option value="central">Central universities</option>
              </Select>
            </div>
            <div>
              <label htmlFor="lead-state" className={labelClass}>Home state</label>
              <Select id="lead-state" name="state" defaultValue={get("state")}>
                <option value="">Select</option>
                {INDIA_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="lead-email" className={labelClass}>Email</label>
              <input id="lead-email" name="email" type="email" autoComplete="email" className={inputClass} />
            </div>
          </div>

          <fieldset className="mt-8">
            <legend className={labelClass}>Package</legend>
            <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-4">
              {[{ id: "", name: "Not sure", price: 0 }, ...packagesData.packages].map((p) => {
                const chosen = pkg === p.id;
                return (
                  <label
                    key={p.id || "none"}
                    className={`relative cursor-pointer rounded-2xl border px-4 py-3.5 transition-[background-color,border-color,box-shadow,transform] duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                      chosen
                        ? "border-ink bg-ink text-text-on-dark shadow-[0_12px_28px_-14px_rgba(8,26,36,0.7)] -translate-y-0.5"
                        : "border-hairline bg-paper-bright hover:border-border-strong hover:-translate-y-0.5"
                    }`}
                  >
                    <input type="radio" name="package-choice" value={p.id} checked={chosen} onChange={() => setPkg(p.id)} className="sr-only" />
                    <span className="block text-small font-semibold">{p.name}</span>
                    <span className={`block font-[family-name:var(--font-instrument)] text-[1.35rem] leading-tight tabular-nums mt-1 ${chosen ? "text-gold" : "text-text-muted"}`}>
                      {p.price > 0 ? `₹${p.price.toLocaleString("en-IN")}` : "Decide later"}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-8">
            <label htmlFor="lead-message" className={labelClass}>Anything we should know?</label>
            <textarea id="lead-message" name="message" maxLength={600} rows={3} className={inputClass} placeholder="For example: colleges you're considering, or a deadline coming up" />
          </div>

          {error && <ErrorNote>{error}</ErrorNote>}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            <SubmitButton pending={pending} className="flex-1">Send details</SubmitButton>
            <button type="button" onClick={() => setStep("done")} className="px-5 py-3.5 text-small font-semibold text-text-muted hover:text-ink transition-colors">
              Skip, just call me
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

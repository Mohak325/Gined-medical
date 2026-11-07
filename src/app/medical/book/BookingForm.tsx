"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { track as trackEvent } from "@vercel/analytics";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import packagesData from "@/content/packages.json";
import { INDIA_STATES } from "@/lib/medical/mockData";
import { whatsappHref } from "@/lib/medical/booking";
import { SHORTLIST_KEY, shortlistText, type ShortlistEntry } from "@/lib/medical/shortlist";
import { readStored } from "@/lib/medical/sessionValue";
import { submitLead, type LeadResult } from "./actions";

const inputClass =
  "w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-ink transition-colors";
const labelClass = "block text-small font-semibold text-ink mb-2";

const ERROR_MESSAGES: Record<Extract<LeadResult, { ok: false }>["reason"], string> = {
  invalid: "Please check your name and phone number (at least 10 digits), then try again.",
  delivery: "We couldn't send your request, so it has not reached our team. Please try again in a little while, or message us on WhatsApp.",
};

type Step = "contact" | "details" | "done";

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
        }
        else setError(ERROR_MESSAGES[result.reason]);
      } catch {
        setError(ERROR_MESSAGES.delivery);
      }
    });
  };

  if (step === "done") {
    return (
      <div className="rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-8 md:p-10">
        <span className="w-12 h-12 rounded-full bg-safe/10 text-safe flex items-center justify-center">
          <Check className="w-6 h-6" aria-hidden />
        </span>
        <h2 className="text-h1 text-ink mt-6">Request received, {name.split(" ")[0]}.</h2>
        <p className="text-body text-text-muted mt-3">
          Our counselling team will contact you on {phone} to schedule your first session. Want an answer sooner? Message us on WhatsApp.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a
            href={whatsappHref(`Hi Gined, I just booked a session on the website. My name is ${name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-ink text-text-on-dark font-semibold text-small rounded-full hover:bg-ink-soft"
          >
            <MessageCircle className="w-4 h-4" aria-hidden /> Message us on WhatsApp
          </a>
          {fromFinder ? (
            <button type="button" onClick={() => history.back()} className="inline-flex items-center justify-center px-5 py-3 border border-border-strong font-semibold text-small rounded-full hover:bg-ink/[0.04]">
              Back to my colleges
            </button>
          ) : (
            <Link href="/medical#finder" className="inline-flex items-center justify-center px-5 py-3 border border-border-strong font-semibold text-small rounded-full hover:bg-ink/[0.04]">
              Check my chances meanwhile
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-6 md:p-8 shadow-[0_24px_60px_-32px_rgba(15,46,61,0.3)]">
      <ol className="flex items-center gap-3 mb-8 text-small" aria-label="Booking steps">
        {(["Your contact", "Your NEET details"] as const).map((label, i) => {
          const current = (step === "contact" ? 0 : 1) === i;
          const done = step === "details" && i === 0;
          return (
            <li key={label} className="flex items-center gap-2" aria-current={current ? "step" : undefined}>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-micro font-semibold ${
                  done ? "bg-safe text-white" : current ? "bg-ink text-gold" : "bg-paper-dim text-text-muted"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" aria-hidden /> : i + 1}
              </span>
              <span className={current ? "font-semibold text-ink" : "text-text-muted"}>{label}</span>
              {i === 0 && <span className="w-8 h-px bg-hairline" aria-hidden />}
            </li>
          );
        })}
      </ol>

      {step === "contact" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(e.currentTarget, "contact", () => {
              trackEvent("booking_started", { source: source || "direct" });
              setStep("details");
            });
          }}
        >
          <h2 className="text-h1 text-ink">Talk to a counsellor.</h2>
          <p className="text-body text-text-muted mt-2 mb-6">Leave your name and number. It takes under a minute.</p>
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="space-y-4">
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
                className={inputClass}
              />
            </div>
          </div>
          {error && <p role="alert" className="mt-4 p-3 text-small text-ambitious bg-ambitious/5 border border-ambitious/20 rounded-[var(--radius-sm)]">{error}</p>}
          <button type="submit" disabled={pending} className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 bg-ink text-text-on-dark font-semibold rounded-full hover:bg-ink-soft disabled:opacity-60 disabled:cursor-wait">
            {pending ? "Sending…" : "Continue"} {!pending && <ArrowRight className="w-4 h-4 text-gold" aria-hidden />}
          </button>
          <p className="mt-4 text-micro font-normal tracking-normal text-text-muted text-center">
            By continuing, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(e.currentTarget, "details", () => {
              trackEvent("booking_sent", { source: source || "direct", package: pkg || "none" });
              setStep("done");
            });
          }}
        >
          <h2 className="text-h1 text-ink">Thanks, {name.split(" ")[0]}. A few details help us prepare.</h2>
          <p className="text-body text-text-muted mt-2 mb-6">Your number has reached our team. Everything below is optional.</p>

          <input type="hidden" name="track" value={get("track")} />
          <input type="hidden" name="stateCategory" value={get("stateCategory")} />
          <input type="hidden" name="package" value={pkg} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-rank" className={labelClass}>NEET rank</label>
              <input id="lead-rank" name="rank" defaultValue={get("rank")} maxLength={20} inputMode="numeric" className={inputClass} />
            </div>
            <div>
              <label htmlFor="lead-category" className={labelClass}>Category</label>
              <select id="lead-category" name="category" defaultValue={get("category")} className={inputClass}>
                <option value="">Select</option>
                <option value="general">General (UR)</option>
                <option value="obc">OBC-NCL</option>
                <option value="sc">SC</option>
                <option value="st">ST</option>
                <option value="ews">EWS</option>
              </select>
            </div>
            <div>
              <label htmlFor="lead-quota" className={labelClass}>Quota you&apos;re aiming for</label>
              <select id="lead-quota" name="quota" defaultValue={get("quota")} className={inputClass}>
                <option value="">Not sure yet</option>
                <option value="aiq">All India</option>
                <option value="state">State quota</option>
                <option value="deemed">Deemed universities</option>
                <option value="central">Central universities</option>
              </select>
            </div>
            <div>
              <label htmlFor="lead-state" className={labelClass}>Home state</label>
              <select id="lead-state" name="state" defaultValue={get("state")} className={inputClass}>
                <option value="">Select</option>
                {INDIA_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="lead-email" className={labelClass}>Email</label>
              <input id="lead-email" name="email" type="email" autoComplete="email" className={inputClass} />
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className={labelClass}>Package</legend>
            <div className="grid gap-2 sm:grid-cols-4">
              {[{ id: "", name: "Not sure", price: 0 }, ...packagesData.packages].map((p) => (
                <label
                  key={p.id || "none"}
                  className={`cursor-pointer rounded-[var(--radius-md)] border px-3 py-2.5 text-small transition-colors ${
                    pkg === p.id ? "border-ink bg-ink text-text-on-dark" : "border-hairline bg-paper hover:border-border-strong"
                  }`}
                >
                  <input type="radio" name="package-choice" value={p.id} checked={pkg === p.id} onChange={() => setPkg(p.id)} className="sr-only" />
                  <span className="block font-semibold">{p.name}</span>
                  {p.price > 0 && <span className={`block tabular-nums ${pkg === p.id ? "text-text-on-dark/70" : "text-text-muted"}`}>₹{p.price.toLocaleString("en-IN")}</span>}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6">
            <label htmlFor="lead-message" className={labelClass}>Anything we should know?</label>
            <textarea id="lead-message" name="message" maxLength={600} rows={3} className={inputClass} placeholder="For example: colleges you're considering, or a deadline coming up" />
          </div>

          {error && <p role="alert" className="mt-4 p-3 text-small text-ambitious bg-ambitious/5 border border-ambitious/20 rounded-[var(--radius-sm)]">{error}</p>}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={pending} className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 bg-ink text-text-on-dark font-semibold rounded-full hover:bg-ink-soft disabled:opacity-60 disabled:cursor-wait">
              {pending ? "Sending…" : "Send details"}
            </button>
            <button type="button" onClick={() => setStep("done")} className="sm:w-auto px-5 py-3.5 text-small font-semibold text-text-muted hover:text-ink">
              Skip, just call me
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

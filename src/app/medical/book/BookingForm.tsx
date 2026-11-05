"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import packagesData from "@/content/packages.json";
import { submitLead, type LeadResult } from "./actions";

const inputClass =
  "w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] focus:outline-none focus:border-gold";

const ERROR_MESSAGES: Record<Extract<LeadResult, { ok: false }>["reason"], string> = {
  invalid: "Please check your name, email and phone number, then try again.",
  delivery: "We couldn't send your request, so it has not reached our team. Please try again in a little while.",
};

export default function BookingForm() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("package") || "standard";
  const source = searchParams.get("source") || "";
  const pkg = packagesData.packages.find(p => p.id === packageId) || packagesData.packages[1];

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitLead(formData);
        if (result.ok) {
          setSubmitted(true);
        } else {
          setError(ERROR_MESSAGES[result.reason]);
        }
      } catch {
        setError(ERROR_MESSAGES.delivery);
      }
    });
  };

  if (submitted) {
    return (
      <div className="bg-safe/10 border border-safe/20 rounded-[var(--radius-lg)] p-12 text-center">
        <h2 className="text-h2 text-safe mb-4">Request Received</h2>
        <p className="text-body text-text-main">
          Thank you for choosing the {pkg.name} package. Our counselling team will contact you shortly to schedule your first session.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-paper border border-hairline rounded-[var(--radius-lg)] p-8 shadow-card">
      <h2 className="text-h3 text-text-main mb-6">Request Counselling</h2>

      <div className="mb-6 p-4 bg-paper-bright border border-gold/30 rounded-[var(--radius-sm)] flex justify-between items-center">
        <span className="font-medium text-text-main">Selected Package: <span className="text-gold">{pkg.name}</span></span>
        <span className="font-tabular-nums text-text-muted">₹{pkg.price.toLocaleString("en-IN")}</span>
      </div>

      <input type="hidden" name="package" value={pkg.id} />
      <input type="hidden" name="source" value={source} />
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="lead-name" className="block text-small font-semibold text-text-main mb-2">Full Name</label>
          <input id="lead-name" name="name" required minLength={2} maxLength={100} type="text" autoComplete="name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="lead-email" className="block text-small font-semibold text-text-main mb-2">Email Address</label>
          <input id="lead-email" name="email" required type="email" autoComplete="email" className={inputClass} />
        </div>
        <div>
          <label htmlFor="lead-phone" className="block text-small font-semibold text-text-main mb-2">Phone Number</label>
          <input id="lead-phone" name="phone" required type="tel" autoComplete="tel" title="Enter a phone number with at least 10 digits" className={inputClass} />
        </div>
        <div>
          <label htmlFor="lead-rank" className="block text-small font-semibold text-text-main mb-2">NEET Rank (Optional)</label>
          <input id="lead-rank" name="rank" maxLength={20} type="text" inputMode="numeric" className={inputClass} />
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 p-3 text-small text-ambitious bg-ambitious/5 border border-ambitious/20 rounded-[var(--radius-sm)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-4 bg-gold text-ink font-semibold rounded-[var(--radius-sm)] hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        {pending ? "Sending..." : "Submit Request"}
      </button>

      <p className="mt-4 text-micro text-text-muted text-center">
        By submitting, you agree to our{" "}
        <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </form>
  );
}

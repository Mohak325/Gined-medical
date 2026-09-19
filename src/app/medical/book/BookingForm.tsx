"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import packagesData from "@/content/packages.json";

export default function BookingForm() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("package") || "standard";
  const pkg = packagesData.packages.find(p => p.id === packageId) || packagesData.packages[1];

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, this would send a lead to the backend
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

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-small font-semibold text-text-main mb-2">Full Name</label>
          <input required type="text" className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-small font-semibold text-text-main mb-2">Email Address</label>
          <input required type="email" className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-small font-semibold text-text-main mb-2">Phone Number</label>
          <input required type="tel" className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-small font-semibold text-text-main mb-2">NEET Rank (Optional)</label>
          <input type="text" className="w-full px-4 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] focus:outline-none focus:border-gold" />
        </div>
      </div>

      <button type="submit" className="w-full py-4 bg-gold text-ink font-semibold rounded-[var(--radius-sm)] hover:bg-gold-deep transition-colors">
        Submit Request
      </button>
    </form>
  );
}

import type { Metadata } from "next";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Use — gined.in",
  description: "The terms for using gined.in and its counselling services.",
};

const sections = [
  {
    title: "Guidance, not a guarantee",
    body: "gined.in offers information and counselling to help you make your own decisions. We do not guarantee admission, a seat allotment or any particular college. Seats are allotted only by the official counselling authorities.",
  },
  {
    title: "Data accuracy",
    body: "Cutoffs and seat counts come from past data and may be incomplete or out of date. Fees and bond details are estimates based on college type, not figures published by each college. Safe, Moderate and Ambitious labels are indicative. Always check details with MCC, your state counselling authority and the college before acting on them.",
  },
  {
    title: "Not affiliated",
    body: "gined.in is not affiliated with NTA, MCC, NMC, any state counselling authority or any college.",
  },
  {
    title: "Counselling packages",
    body: "Submitting a booking request is not a payment or a confirmed booking. We will contact you to confirm the package, schedule and payment terms before any session begins.",
  },
  {
    title: "Your responsibilities",
    body: "You remain responsible for your registrations, choice filling, documents, deadlines and fee payments with the counselling authorities and colleges.",
  },
];

export default function TermsPage() {
  return (
    <>
      <SiteNavbar variant="solid" />
      <main className="pt-28 pb-24 bg-paper min-h-screen">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-h1 text-text-main mb-2">Terms of Use</h1>
          <p className="text-small text-text-muted mb-10">Last updated: 5 November 2026</p>
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-h3 text-text-main mb-2">{section.title}</h2>
                <p className="text-body text-text-muted">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

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
    body: "Cutoffs and seat counts come from past official results and may be incomplete or out of date. Fees are shown only where an official document publishes them; where none is published, we say so. Safe, Moderate and Ambitious labels are indicative. Always check details with MCC, your state counselling authority and the college before acting on them.",
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
  return <LegalPage eyebrow="Terms" title="Terms of Use" updated="8 November 2026" sections={sections} />;
}

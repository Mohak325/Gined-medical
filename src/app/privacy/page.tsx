import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — gined.in",
  description: "What information gined.in collects and how it is used.",
};

const sections = [
  {
    title: "What we collect",
    body: "When you request counselling, we collect your name and phone number and, if you provide them, your email address, NEET rank, category, quota, home state, chosen package, a message and, when you send it, your shortlist. The rank, quota and category you enter in the College Finder are used to show your results and appear in that page's web address. They are not stored in an account.",
  },
  {
    title: "How we use it",
    body: "We use your booking details only to respond to your request, arrange counselling sessions and provide the service you asked for. We do not sell your personal information.",
  },
  {
    title: "Who handles it",
    body: "Booking requests are passed through the service providers we use to host this site and receive enquiries. When you visit the site, your browser also loads fonts and images from third-party services, which can see your IP address as part of that request.",
  },
  {
    title: "Information kept in your browser",
    body: "Some things you do on the site are kept only in your own browser, not sent to us. Your compare list and your UG or PG choice are kept in session storage and cleared when you close the tab. Your shortlist, the rank you enter on it and your documents checklist are kept in local storage, so they are still there next time; clearing your browser's site data removes them.",
  },
  {
    title: "Your choices",
    body: "You can ask us to access, correct or delete the booking details you gave us by replying to any message we send you about your request.",
  },
];

export default function PrivacyPage() {
  return <LegalPage eyebrow="Privacy" title="Privacy Policy" updated="8 November 2026" sections={sections} />;
}

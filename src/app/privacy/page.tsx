import type { Metadata } from "next";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — gined.in",
  description: "What information gined.in collects and how it is used.",
};

const sections = [
  {
    title: "What we collect",
    body: "When you request counselling, we collect your name, email address, phone number, chosen package and, if you provide it, your NEET rank. The rank, quota and category you enter in the chances calculator are used to show your results and appear in that page's web address. They are not stored in an account.",
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
    body: "Your compare list is kept in your browser's session storage so it stays available while you browse. It is cleared when you close the tab.",
  },
  {
    title: "Your choices",
    body: "You can ask us to access, correct or delete the booking details you gave us by replying to any message we send you about your request.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteNavbar variant="solid" />
      <main className="pt-28 pb-24 bg-paper min-h-screen">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-h1 text-text-main mb-2">Privacy Policy</h1>
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

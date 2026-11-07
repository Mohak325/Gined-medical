import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import HomeHero from "@/components/medical/home/HomeHero";
import DataStrip from "@/components/medical/home/DataStrip";
import { CalendarStrip } from "@/components/medical/guide/CounsellingCalendar";
import ToolsBento from "@/components/medical/home/ToolsBento";
import HowItWorks from "@/components/medical/home/HowItWorks";
import WhyGined from "@/components/medical/home/WhyGined";
import Counsellors from "@/components/medical/home/Counsellors";
import PhotoBand from "@/components/medical/home/PhotoBand";
import PackagesPreview from "@/components/medical/home/PackagesPreview";
import HomeFAQ from "@/components/medical/home/HomeFAQ";
import JsonLd from "@/components/JsonLd";
import faqData from "@/content/faq.ug.json";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export default function MedicalLandingPage() {
  return (
    <div className="bg-background">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: SITE_NAME, url: `${SITE_URL}/medical` },
            { "@type": "WebSite", name: SITE_NAME, url: SITE_URL, publisher: { "@id": `${SITE_URL}/#org` } },
            {
              "@type": "FAQPage",
              mainEntity: faqData.questions.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
            },
          ],
        }}
      />
      <SiteNavbar />
      <main>
        <HomeHero />
        <CalendarStrip />
        <DataStrip />
        <ToolsBento />
        <HowItWorks />
        <PhotoBand />
        <WhyGined />
        <Counsellors />
        <PackagesPreview />
        <HomeFAQ />
        <CTABand id="cta" source="landing_bottom" />
      </main>
      <SiteFooter />
    </div>
  );
}

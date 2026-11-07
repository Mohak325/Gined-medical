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
import PackagesPreview from "@/components/medical/home/PackagesPreview";
import HomeFAQ from "@/components/medical/home/HomeFAQ";

export default function MedicalLandingPage() {
  return (
    <div className="bg-background">
      <SiteNavbar />
      <main>
        <HomeHero />
        <CalendarStrip />
        <DataStrip />
        <ToolsBento />
        <HowItWorks />
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

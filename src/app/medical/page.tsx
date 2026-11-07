import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import HomeHero from "@/components/medical/home/HomeHero";
import DataStrip from "@/components/medical/home/DataStrip";
import ToolsBento from "@/components/medical/home/ToolsBento";
import HowItWorks from "@/components/medical/home/HowItWorks";
import WhyGined from "@/components/medical/home/WhyGined";
import PackagesPreview from "@/components/medical/home/PackagesPreview";
import HomeFAQ from "@/components/medical/home/HomeFAQ";

export default function MedicalLandingPage() {
  return (
    <div className="bg-background">
      <SiteNavbar />
      <main>
        <HomeHero />
        <DataStrip />
        <ToolsBento />
        <HowItWorks />
        <WhyGined />
        <PackagesPreview />
        <HomeFAQ />
        <CTABand id="cta" source="landing_bottom" />
      </main>
      <SiteFooter />
    </div>
  );
}

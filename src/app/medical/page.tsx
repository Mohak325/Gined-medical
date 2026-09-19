import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";

import { CinematicProvider } from "@/lib/medical/CinematicProvider";
import SmoothScrollRoot from "@/components/medical/cinematic/SmoothScrollRoot";
import Veil from "@/components/medical/cinematic/Veil";
import RegisterEdge from "@/components/medical/cinematic/RegisterEdge";

import HeroSection from "@/components/medical/sections/HeroSection";
import TrustBar from "@/components/medical/sections/TrustBar";
import RoadmapSection from "@/components/medical/sections/RoadmapSection";
import GuidanceSection from "@/components/medical/sections/GuidanceSection";
import CoverageSection from "@/components/medical/sections/CoverageSection";
import CalculatorSection from "@/components/medical/sections/CalculatorSection";
import ToolEntryGrid from "@/components/medical/sections/ToolEntryGrid";
import WhyChooseUsSection from "@/components/medical/sections/WhyChooseUsSection";
import TestimonialsSection from "@/components/medical/sections/TestimonialsSection";
import PricingSection from "@/components/medical/sections/PricingSection";
import FAQSection from "@/components/medical/sections/FAQSection";

export default function MedicalLandingPage() {
  return (
    <div className="bg-background">
      <SiteNavbar variant="cinematic" />
      
      <CinematicProvider>
        <SmoothScrollRoot>
          <main>
            <HeroSection id="hero" />
            
            <TrustBar id="trust" />
            
            <RoadmapSection id="roadmap" />
            
            <GuidanceSection id="guidance" />
            
            <CoverageSection id="coverage" />
            
            <RegisterEdge />
            
            <CalculatorSection id="calculator" />
            <ToolEntryGrid id="tools" />
            
            <WhyChooseUsSection id="why-us" />
            
            <TestimonialsSection id="stories" />
            
            <PricingSection id="pricing" />
            <FAQSection id="faq" />
          </main>
        </SmoothScrollRoot>
      </CinematicProvider>

      <CTABand id="cta" source="landing_bottom" />
      <SiteFooter />
    </div>
  );
}

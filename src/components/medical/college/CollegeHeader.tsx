import { type College } from "@/lib/medical/mockData";
import TypographicFallback from "@/components/medical/shared/TypographicFallback";
import { Building2, MapPin, Bed, FileText } from "lucide-react";

interface CollegeHeaderProps {
  college: College;
}

export default function CollegeHeader({ college }: CollegeHeaderProps) {
  const hasImage = Boolean(college.hero_image_url);

  return (
    <div className="relative bg-ink">
      {/* If we have an image, render it as a cinematic hero block */}
      {hasImage && (
        <div className="h-[40vh] min-h-[320px] max-h-[480px] w-full relative">
          <img 
            src={college.hero_image_url!} 
            alt={college.name}
            className="w-full h-full object-cover"
          />
          {/* Scrim for navbar readability at the top */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-deep/90 to-transparent" />
        </div>
      )}

      {/* The unified Title and Metadata Bar */}
      <div className={`text-text-on-dark px-6 md:px-12 pb-10 border-b border-white/10 ${hasImage ? "pt-8" : "pt-32"}`}>
        <div className="max-w-ledger mx-auto">
          
          {/* subtle background pattern if no image */}
          {!hasImage && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,75,0.08)_0%,transparent_50%)] pointer-events-none" />
          )}

          <div className="relative z-10">
            <div className="text-micro text-gold tracking-widest uppercase mb-4 opacity-90">
              [ {college.type} · {college.city}, {college.state} ]
            </div>
            <h1 className="text-h1 max-w-4xl tracking-tight leading-tight mb-8">
              {college.name}
            </h1>
            
            {/* Key Figures Strip */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold" />
                <span className="text-small text-text-on-dark/90 font-medium">{college.city}, {college.stateCode}</span>
              </div>
              
              <div className="w-px h-6 bg-white/10 hidden sm:block"></div>

              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gold" />
                <span className="text-small text-text-on-dark/90 font-medium">Est. {college.established || "N/A"}</span>
              </div>
              
              {college.hospitalBeds > 0 && (
                <>
                  <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-gold" />
                    <span className="text-small text-text-on-dark/90 font-medium">{college.hospitalBeds} Beds</span>
                  </div>
                </>
              )}
              
              {college.nirfRanking && (
                <>
                  <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold font-bold">#</span>
                    <span className="text-small text-gold font-bold tracking-wide">NIRF Rank {college.nirfRanking}</span>
                  </div>
                </>
              )}
              
              {college.nmcRecognized && (
                <>
                  <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-safe" />
                    <span className="text-small text-safe font-semibold tracking-wide">NMC Recognized</span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

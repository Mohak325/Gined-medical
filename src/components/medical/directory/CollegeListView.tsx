"use client";

import Link from "next/link";
import { type College } from "@/lib/medical/mockData";
import AddToCompareButton from "@/components/medical/shared/AddToCompareButton";
import { MapPin, Building2, Bed, GraduationCap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlareHover } from "@/components/reactbits/GlareHover";

interface CollegeListViewProps {
  colleges: College[];
}

export default function CollegeListView({ colleges }: CollegeListViewProps) {
  if (colleges.length === 0) {
    return null;
  }

  return (
    <motion.div 
      layout 
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {colleges.map((college, index) => (
          <motion.article
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.16, 1, 0.3, 1],
              layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
            }}
            key={college.id}
          >
            <GlareHover className="h-full bg-paper-bright border border-hairline rounded-[var(--radius-lg)] shadow-card flex flex-col transition-all duration-[var(--dur-base)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
              {college.hero_image_url ? (
                <div className="relative h-48 w-full overflow-hidden bg-paper-dim">
                  <img
                    src={college.hero_image_url}
                    alt={college.name}
                    className="w-full h-full object-cover transition-transform duration-[var(--dur-slow)] hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                     <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gold/90 backdrop-blur-sm text-micro font-bold text-ink shadow-sm uppercase tracking-wider">
                      {college.type}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative h-48 w-full bg-ink flex items-center justify-center p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,75,0.1)_0%,transparent_70%)]" />
                  <span className="text-text-on-dark font-bold text-center leading-tight text-h4 z-10 opacity-80">
                    {college.name}
                  </span>
                  <div className="absolute bottom-3 left-4">
                     <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gold/90 text-micro font-bold text-ink uppercase tracking-wider">
                      {college.type}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 flex flex-col flex-grow relative z-10 bg-paper-bright">
                <div className="mb-5">
                  <Link
                    href={`/medical/college/${college.id}`}
                    className="text-h4 font-bold text-text-main hover:text-gold-deep transition-colors leading-tight line-clamp-2 mb-2 before:absolute before:inset-0 before:z-0"
                  >
                    {college.name}
                  </Link>
                  <p className="text-small text-text-muted flex items-center gap-1.5 mt-1 font-medium">
                    <MapPin className="w-4 h-4 text-gold" />
                    {college.city}, {college.state}
                  </p>
                </div>

                {/* 3-column micro grid for metrics as requested in PRD */}
                <div className="grid grid-cols-3 gap-2 mb-5 py-3 border-y border-hairline/60">
                   <div className="flex flex-col">
                     <span className="text-micro text-text-muted uppercase tracking-wider mb-1">Established</span>
                     <span className="text-small font-semibold text-text-main flex items-center gap-1">
                       <Building2 className="w-3.5 h-3.5 text-text-muted/60" />
                       {college.established || "N/A"}
                     </span>
                   </div>
                    <div className="flex flex-col border-l border-hairline/60 pl-3">
                     <span className="text-micro text-text-muted uppercase tracking-wider mb-1">Seats</span>
                     <span className="text-small font-semibold text-text-main flex items-center gap-1">
                       <GraduationCap className="w-3.5 h-3.5 text-text-muted/60" />
                       150+
                     </span>
                   </div>
                   {college.nirfRanking ? (
                     <div className="flex flex-col border-l border-hairline/60 pl-3">
                       <span className="text-micro text-gold uppercase tracking-wider mb-1">NIRF</span>
                       <span className="text-small font-bold text-gold flex items-center gap-1">
                         #{college.nirfRanking}
                       </span>
                     </div>
                   ) : (
                     <div className="flex flex-col border-l border-hairline/60 pl-3">
                       <span className="text-micro text-text-muted uppercase tracking-wider mb-1">Beds</span>
                       <span className="text-small font-semibold text-text-main flex items-center gap-1">
                         <Activity className="w-3.5 h-3.5 text-text-muted/60" />
                         {college.hospitalBeds}
                       </span>
                     </div>
                   )}
                </div>

                <div className="mt-auto flex items-center justify-between relative z-20">
                  <Link 
                    href={`/medical/college/${college.id}`}
                    className="text-small font-semibold text-gold-deep hover:text-gold transition-colors"
                  >
                    View Details &rarr;
                  </Link>
                  <AddToCompareButton collegeId={college.id} collegeName={college.name} />
                </div>
              </div>
            </GlareHover>
          </motion.article>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

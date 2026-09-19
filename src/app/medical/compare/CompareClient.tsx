"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCompareColleges } from "@/app/medical/compare/actions";
import { type College } from "@/lib/medical/mockData";
import { CompareQuerySchema } from "@/lib/medical/schemas";
import { useCompare } from "@/lib/medical/CompareProvider";
import EmptyState from "@/components/medical/shared/EmptyState";
import { Scale, Check, X, Building2 } from "lucide-react";
import { formatIndian } from "@/lib/medical/format";

export default function CompareClient() {
  const searchParams = useSearchParams();
  const rawParams = Object.fromEntries(searchParams.entries());
  const parsed = CompareQuerySchema.safeParse(rawParams);
  const ids = parsed.success ? parsed.data.ids : [];

  const { remove } = useCompare();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    
    let mounted = true;
    setLoading(true);
    getCompareColleges(ids).then(data => {
      if (mounted) {
        setColleges(data as College[]);
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (colleges.length === 0) {
    return (
      <EmptyState
        icon={<Scale className="w-12 h-12" />}
        title="Nothing to compare"
        description="Add colleges to your compare tray from the directory or results pages to see them side-by-side."
        actions={[{ label: "Browse Directory", href: "/medical/colleges" }]}
      />
    );
  }

  return (
    <div className="bg-paper-bright border border-hairline rounded-[var(--radius-md)] overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-paper border-b border-hairline">
              <th className="p-6 w-1/4 border-r border-hairline align-bottom">
                <span className="text-small text-text-muted font-semibold uppercase tracking-wider">Features</span>
              </th>
              {colleges.map(c => (
                <th key={c.id} className="p-6 w-1/4 border-r border-hairline last:border-r-0 relative group">
                  <button 
                    onClick={() => remove(c.id)}
                    className="absolute top-4 right-4 text-text-muted hover:text-ambitious opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Link href={`/medical/college/${c.id}`} className="text-h4 text-text-main hover:text-gold-deep transition-colors block mb-1 pr-6">
                    {c.name}
                  </Link>
                  <div className="text-small text-text-muted">{c.city}, {c.state}</div>
                </th>
              ))}
              {/* Fill empty columns if less than 3 */}
              {Array.from({ length: 3 - colleges.length }).map((_, i) => (
                <th key={`empty-${i}`} className="p-6 w-1/4 border-r border-hairline last:border-r-0 bg-paper-dim/30">
                  <div className="text-center text-text-muted/50 text-small">
                    <Building2 className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    Add a college
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            
            <tr className="border-b border-hairline">
              <td className="p-6 border-r border-hairline bg-paper-dim/30 font-medium text-text-main">Type</td>
              {colleges.map(c => (
                <td key={c.id} className="p-6 border-r border-hairline last:border-r-0 text-text-muted">
                  {c.type}
                </td>
              ))}
              {Array.from({ length: 3 - colleges.length }).map((_, i) => (
                <td key={`empty-type-${i}`} className="p-6 border-r border-hairline last:border-r-0 bg-paper-dim/10"></td>
              ))}
            </tr>

            <tr className="border-b border-hairline">
              <td className="p-6 border-r border-hairline bg-paper-dim/30 font-medium text-text-main">Established</td>
              {colleges.map(c => (
                <td key={c.id} className="p-6 border-r border-hairline last:border-r-0 text-text-muted tabular-nums">
                  {c.established}
                </td>
              ))}
              {Array.from({ length: 3 - colleges.length }).map((_, i) => (
                <td key={`empty-est-${i}`} className="p-6 border-r border-hairline last:border-r-0 bg-paper-dim/10"></td>
              ))}
            </tr>

            <tr className="border-b border-hairline">
              <td className="p-6 border-r border-hairline bg-paper-dim/30 font-medium text-text-main">Hospital Beds</td>
              {colleges.map(c => (
                <td key={c.id} className="p-6 border-r border-hairline last:border-r-0 text-text-muted tabular-nums">
                  {formatIndian(c.hospitalBeds)}
                </td>
              ))}
              {Array.from({ length: 3 - colleges.length }).map((_, i) => (
                <td key={`empty-beds-${i}`} className="p-6 border-r border-hairline last:border-r-0 bg-paper-dim/10"></td>
              ))}
            </tr>

            <tr className="border-b border-hairline">
              <td className="p-6 border-r border-hairline bg-paper-dim/30 font-medium text-text-main">Campus Size</td>
              {colleges.map(c => (
                <td key={c.id} className="p-6 border-r border-hairline last:border-r-0 text-text-muted">
                  {c.campusSize}
                </td>
              ))}
              {Array.from({ length: 3 - colleges.length }).map((_, i) => (
                <td key={`empty-size-${i}`} className="p-6 border-r border-hairline last:border-r-0 bg-paper-dim/10"></td>
              ))}
            </tr>

            <tr className="border-b border-hairline">
              <td className="p-6 border-r border-hairline bg-paper-dim/30 font-medium text-text-main">NMC Recognized</td>
              {colleges.map(c => (
                <td key={c.id} className="p-6 border-r border-hairline last:border-r-0">
                  {c.nmcRecognized ? (
                    <span className="flex items-center gap-1.5 text-safe text-small">
                      <Check className="w-4 h-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
              ))}
              {Array.from({ length: 3 - colleges.length }).map((_, i) => (
                <td key={`empty-nmc-${i}`} className="p-6 border-r border-hairline last:border-r-0 bg-paper-dim/10"></td>
              ))}
            </tr>

            <tr className="border-b border-hairline">
              <td className="p-6 border-r border-hairline bg-paper-dim/30 font-medium text-text-main">View Full Details</td>
              {colleges.map(c => (
                <td key={c.id} className="p-6 border-r border-hairline last:border-r-0">
                  <Link 
                    href={`/medical/college/${c.id}`}
                    className="text-small font-medium text-gold hover:underline"
                  >
                    View College &rarr;
                  </Link>
                </td>
              ))}
              {Array.from({ length: 3 - colleges.length }).map((_, i) => (
                <td key={`empty-link-${i}`} className="p-6 border-r border-hairline last:border-r-0 bg-paper-dim/10"></td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}

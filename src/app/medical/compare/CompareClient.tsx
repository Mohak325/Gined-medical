"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCompareColleges } from "@/app/medical/compare/actions";
import { type College } from "@/lib/medical/mockData";
import { CompareQuerySchema } from "@/lib/medical/schemas";
import { useCompare } from "@/lib/medical/CompareProvider";
import EmptyState from "@/components/medical/shared/EmptyState";
import { Scale, X, Building2 } from "lucide-react";
import { formatIndian } from "@/lib/medical/format";

export default function CompareClient() {
  const searchParams = useSearchParams();
  const rawParams = Object.fromEntries(searchParams.entries());
  const parsed = CompareQuerySchema.safeParse(rawParams);
  const urlIds = parsed.success ? parsed.data.ids : [];

  const router = useRouter();
  const { ids: trayIds, remove } = useCompare();
  // The nav link has no ids in its URL, so fall back to the compare tray.
  const ids = urlIds.length > 0 ? urlIds : trayIds;
  const idsKey = ids.join(",");

  const handleRemove = (id: string) => {
    remove(id);
    const remaining = ids.filter(i => i !== id);
    router.replace(remaining.length > 0 ? `/medical/compare?ids=${remaining.join(",")}` : "/medical/compare");
  };

  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setColleges([]);
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
  }, [idsKey]);

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
                    onClick={() => handleRemove(c.id)}
                    className="absolute top-4 right-4 text-text-muted hover:text-ambitious transition-colors"
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
                  {c.established || "—"}
                </td>
              ))}
              {Array.from({ length: 3 - colleges.length }).map((_, i) => (
                <td key={`empty-est-${i}`} className="p-6 border-r border-hairline last:border-r-0 bg-paper-dim/10"></td>
              ))}
            </tr>

            <tr className="border-b border-hairline">
              <td className="p-6 border-r border-hairline bg-paper-dim/30 font-medium text-text-main">Total Seats</td>
              {colleges.map(c => (
                <td key={c.id} className="p-6 border-r border-hairline last:border-r-0 text-text-muted tabular-nums">
                  {c.totalSeats ? formatIndian(c.totalSeats) : "—"}
                </td>
              ))}
              {Array.from({ length: 3 - colleges.length }).map((_, i) => (
                <td key={`empty-seats-${i}`} className="p-6 border-r border-hairline last:border-r-0 bg-paper-dim/10"></td>
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

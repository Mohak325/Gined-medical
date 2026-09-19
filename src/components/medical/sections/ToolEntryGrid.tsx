import Link from "next/link";
import { Search, Map, Scale } from "lucide-react";

export default function ToolEntryGrid({ id }: { id: string }) {
  const tools = [
    {
      title: "All Colleges Directory",
      desc: "Browse every NMC-recognised medical college.",
      icon: <Search className="w-6 h-6 text-gold" />,
      href: "/medical/colleges",
    },
    {
      title: "Seat Matrix Explorer",
      desc: "Breakdown of seats across all quotas for every category.",
      icon: <Map className="w-6 h-6 text-gold" />,
      href: "/medical/seat-matrix",
    },
    {
      title: "Comparison Tool",
      desc: "Side-by-side analysis of fees, cutoffs, and bond penalties.",
      icon: <Scale className="w-6 h-6 text-gold" />,
      href: "/medical/compare",
    },
  ];

  return (
    <section id={id} className="pb-32 pt-12 bg-paper relative z-20">
      <div className="max-w-ledger mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link 
              key={tool.title} 
              href={tool.href}
              className="group block bg-paper-bright border border-hairline rounded-[var(--radius-lg)] p-8 hover:border-gold transition-colors"
            >
              <div className="w-12 h-12 bg-paper-dim rounded-[var(--radius-sm)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-[var(--dur-base)]">
                {tool.icon}
              </div>
              <h3 className="text-h3 text-text-main mb-3 group-hover:text-gold-deep transition-colors">
                {tool.title}
              </h3>
              <p className="text-body text-text-muted">
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

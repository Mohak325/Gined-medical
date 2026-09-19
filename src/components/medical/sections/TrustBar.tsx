import { ShieldCheck } from "lucide-react";
import trustData from "@/content/trust-stats.json";

export default function TrustBar({ id }: { id: string }) {
  return (
    <section id={id} className="bg-ink py-12 border-t border-white/10">
      <div className="max-w-ledger mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-gold" />
            </div>
            <div>
              <div className="text-small font-semibold text-white">Verified Data</div>
              <div className="text-micro text-white/60">Updated for 2025 Cycle</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
            {trustData.stats.map((stat) => (
              <div key={stat.label} className="text-center md:text-left border-l border-white/10 pl-4 md:pl-8">
                <div className="text-h2 text-gold mb-1 font-tabular-nums">{stat.value}</div>
                <div className="text-micro text-white/60 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

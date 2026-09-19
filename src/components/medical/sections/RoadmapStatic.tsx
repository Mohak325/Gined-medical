import { CheckCircle2, Calendar } from "lucide-react";

export default function RoadmapStatic({ steps }: { steps: any[] }) {
  return (
    <div className="py-24 max-w-ledger mx-auto px-6 md:px-12">
      <header className="mb-16">
        <div className="text-small text-gold tracking-widest uppercase mb-4 font-semibold">
          The Process
        </div>
        <h2 id="roadmap-heading" className="text-h2 text-text-main max-w-2xl">
          How NEET Counselling Works
        </h2>
      </header>

      <div className="relative">
        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-hairline md:left-1/2 md:-ml-[0.5px]" />

        <div className="space-y-16">
          {steps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={step.step_order} className="relative flex flex-col md:flex-row items-start group">
                <div className={`md:w-1/2 ${isEven ? "md:pr-16 md:text-right" : "md:order-3 md:pl-16"} pl-16 md:pl-0 pt-1.5`}>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] bg-paper-dim text-micro text-text-muted mb-3">
                    <Calendar className="w-3.5 h-3.5" /> {step.timing_window}
                  </div>
                  <h3 className="text-h3 text-text-main mb-3">{step.title}</h3>
                  <p className="text-body text-text-muted">{step.body}</p>
                  
                  {step.documents && step.documents.length > 0 && (
                    <div className={`mt-6 ${isEven ? "md:flex md:flex-col md:items-end" : ""}`}>
                      <div className="text-small font-semibold text-text-main mb-2">Required Documents:</div>
                      <ul className="text-small text-text-muted space-y-1">
                        {step.documents.map((doc: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            {!isEven && <CheckCircle2 className="w-3 h-3 text-safe" />}
                            {doc}
                            {isEven && <CheckCircle2 className="w-3 h-3 text-safe" />}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="absolute left-0 md:left-1/2 md:-ml-7 flex items-center justify-center w-14 h-14 rounded-full bg-paper border-[4px] border-paper-bright z-10 group-hover:border-gold transition-colors duration-[var(--dur-base)]">
                  <span className="text-body font-bold text-text-main group-hover:text-gold transition-colors">
                    {step.step_order}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

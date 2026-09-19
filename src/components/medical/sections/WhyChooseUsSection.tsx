import { Target, Lightbulb, TrendingUp, Lock } from "lucide-react";

export default function WhyChooseUsSection({ id }: { id: string }) {
  const blocks = [
    {
      title: "Data over Intuition",
      body: "We process over 5 years of historical allotments across all state and central counsellings to calculate your exact probabilities.",
      icon: <Target className="w-6 h-6 text-gold" />
    },
    {
      title: "No Hidden Agendas",
      body: "Unlike agents, we do not have tie-ups with private colleges. Our recommendations are 100% unbiased and mathematically derived.",
      icon: <Lock className="w-6 h-6 text-gold" />
    },
    {
      title: "Strategic Preference Building",
      body: "A good rank can be wasted by a bad preference order. We engineer your choice-filling list to maximise your upgrades in Round 2 and Mop-Up.",
      icon: <Lightbulb className="w-6 h-6 text-gold" />
    },
    {
      title: "Volatility Aware",
      body: "We flag colleges where closing ranks have fluctuated by more than 25% year-on-year, protecting you from nasty surprises.",
      icon: <TrendingUp className="w-6 h-6 text-gold" />
    }
  ];

  return (
    <section id={id} className="py-24 bg-paper-bright border-t border-hairline">
      <div className="max-w-ledger mx-auto px-6 md:px-12">
        <header className="mb-16">
          <h2 className="text-h2 text-text-main max-w-2xl">
            Why rely on guesswork when you can rely on data?
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {blocks.map((block, idx) => (
            <div key={idx} className="flex gap-6">
              <div className="w-12 h-12 bg-gold/10 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0">
                {block.icon}
              </div>
              <div>
                <h3 className="text-h3 text-text-main mb-3">{block.title}</h3>
                <p className="text-body-large text-text-muted">{block.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

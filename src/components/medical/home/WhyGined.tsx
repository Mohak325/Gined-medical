import meta from "@/data/meta.json";

const reasons = [
  {
    title: "Data over intuition",
    body: `We compare your rank with official ${meta.cutoffYear} closing ranks, so your shortlist starts from real numbers rather than guesswork.`,
  },
  {
    title: "No hidden agendas",
    body: "We have no tie-ups with private colleges. Recommendations start from your rank and the data, nothing else.",
  },
  {
    title: "Preference order that works",
    body: "A good rank can be wasted by a bad order. We build your choice list so it can upgrade in later rounds and mop-up.",
  },
  {
    title: "Honest about uncertainty",
    body: "Safe, Moderate and Ambitious are guides, not guarantees. Cutoffs move every year, so your list is built to allow for that.",
  },
];

export default function WhyGined() {
  return (
    <section id="why-us" className="py-20 md:py-28">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 grid gap-10 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className="text-eyebrow text-gold-deep mb-4">Why Gined</p>
          <h2 className="text-display text-ink">Counselling that starts from your numbers.</h2>
        </header>
        <ol className="lg:col-span-8 grid gap-px bg-hairline border border-hairline rounded-[var(--radius-lg)] overflow-hidden sm:grid-cols-2">
          {reasons.map((reason, i) => (
            <li key={reason.title} className="bg-paper p-6 md:p-8">
              <span className="text-h1 text-gold-deep tabular-nums" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-h3 text-ink mt-6">{reason.title}</h3>
              <p className="text-body text-text-muted mt-2">{reason.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

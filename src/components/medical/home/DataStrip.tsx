import meta from "@/data/meta.json";

// Every headline number on the site comes from meta.json, written by `npm run data:build`.
const stats = [
  { value: meta.ugCollegeCount.toLocaleString("en-IN"), label: "MBBS colleges listed" },
  { value: meta.ugSeats.toLocaleString("en-IN"), label: `UG seats in ${meta.seatYear}` },
  { value: meta.ugCollegesWithCutoffs.toLocaleString("en-IN"), label: `MBBS colleges with ${meta.cutoffYear} cutoffs` },
  { value: `${meta.stateCutoffs.length} + AIQ`, label: "State quotas and All India" },
];

export default function DataStrip() {
  return (
    <section aria-label="What the data covers" className="border-y border-hairline bg-paper-bright">
      <dl className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 grid grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col-reverse justify-end py-8 md:py-10 px-4 sm:px-6 ${i % 2 === 1 ? "border-l border-hairline" : ""} ${i >= 2 ? "border-t lg:border-t-0 border-hairline" : ""} ${i === 2 ? "lg:border-l" : ""}`}
          >
            <dt className="text-small text-text-muted mt-1">{stat.label}</dt>
            <dd className="text-h1 text-ink tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

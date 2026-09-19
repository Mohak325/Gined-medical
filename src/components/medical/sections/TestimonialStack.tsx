export default function TestimonialStack({ testimonials }: { testimonials: any[] }) {
  return (
    <div className="max-w-ledger mx-auto px-6 md:px-12 space-y-12">
      {testimonials.map((t, i) => (
        <div key={i} className="flex flex-col md:flex-row items-center gap-8 bg-white/5 border border-white/10 p-8 rounded-[var(--radius-lg)]">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0 border-2 border-white/20">
            <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <blockquote className="text-h3 text-white font-medium italic mb-6">"{t.quote}"</blockquote>
            <div className="text-white font-semibold text-lg">{t.name}</div>
            <div className="text-white/60 text-small mb-2">AIR {t.rank} • {t.college_name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

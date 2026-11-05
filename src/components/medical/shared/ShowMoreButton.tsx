export default function ShowMoreButton({
  shown,
  total,
  noun,
  onClick,
}: {
  shown: number;
  total: number;
  noun: string;
  onClick: () => void;
}) {
  if (shown >= total) return null;

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-small text-text-muted">
        Showing {shown.toLocaleString("en-IN")} of {total.toLocaleString("en-IN")} {noun}
      </p>
      <button
        type="button"
        onClick={onClick}
        className="px-6 py-3 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] text-small font-semibold text-text-main hover:border-gold transition-colors"
      >
        Show more
      </button>
    </div>
  );
}

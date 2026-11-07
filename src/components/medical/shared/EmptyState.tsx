import type { ReactNode } from "react";
import Link from "next/link";

interface Action {
  label: string;
  href: string;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actions?: Action[];
}

export default function EmptyState({
  icon,
  title,
  description,
  actions = [],
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="text-text-muted mb-4">{icon}</div>
      )}
      <h3 className="text-h3 text-text-main mb-2">{title}</h3>
      <p className="text-body text-text-muted max-w-md mb-6">{description}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        {actions.map((action) => (
          <Link
            href={action.href}
            key={action.href}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-border-strong bg-paper-bright text-small font-semibold text-ink hover:bg-ink/[0.04]"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

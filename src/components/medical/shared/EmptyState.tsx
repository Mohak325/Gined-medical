import { Button } from "@/components/ui/button";
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
          <Link href={action.href} key={action.href}>
            <Button
              variant="outline"
              className="rounded-[var(--radius-md)] border-hairline"
            >
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}

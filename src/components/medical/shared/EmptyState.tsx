import type { ReactNode } from "react";
import Cta from "@/components/ui/Cta";

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

/** A calm, raised card for "nothing here yet": an icon disc, a serif line, and next steps. */
export default function EmptyState({ icon, title, description, actions = [] }: EmptyStateProps) {
  return (
    <div data-reveal="scale" className="relative overflow-hidden surface-premium rounded-[28px] flex flex-col items-center justify-center py-16 md:py-20 px-6 text-center">
      <div aria-hidden className="absolute left-1/2 -top-24 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full bg-gold/10 blur-3xl" />
      {icon && (
        <div className="relative mb-6 w-20 h-20 rounded-full bg-ink text-gold flex items-center justify-center shadow-[0_0_0_8px_rgba(201,162,75,0.12),0_20px_40px_-16px_rgba(8,26,36,0.6)] [&_svg]:w-8 [&_svg]:h-8">
          {icon}
        </div>
      )}
      <h2 className="relative font-[family-name:var(--font-instrument)] text-[2rem] md:text-[2.5rem] leading-[1.05] text-ink max-w-xl mb-3">{title}</h2>
      <p className="relative text-body text-text-muted max-w-lg mb-8">{description}</p>
      {actions.length > 0 && (
        <div className="relative flex flex-wrap gap-3 justify-center">
          {actions.map((action, i) => (
            <Cta key={action.href} href={action.href} variant={i === 0 ? "ink" : "outline"}>
              {action.label}
            </Cta>
          ))}
        </div>
      )}
    </div>
  );
}

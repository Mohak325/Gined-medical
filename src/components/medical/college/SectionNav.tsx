"use client";

import { useEffect, useState } from "react";

/**
 * A sticky row of pills for the sections of a long page. The pill of the section you are reading
 * fills in as you scroll; each pill jumps to its section.
 */
export default function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string | undefined>(sections[0]?.id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.getAttribute("data-section") ?? undefined);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    for (const { id } of sections) {
      const el = document.querySelector(`[data-section="${id}"]`);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page" className="sticky top-20 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 mb-10">
      <div className="overflow-x-auto">
        <ul className="inline-flex gap-1 p-1.5 rounded-full surface-glass shadow-[0_12px_30px_-14px_rgba(8,26,36,0.4)]">
          {sections.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={active === id ? "true" : undefined}
                className={`block whitespace-nowrap rounded-full px-4 py-2 text-small font-semibold transition-[background-color,color] duration-300 ${
                  active === id ? "bg-ink text-text-on-dark" : "text-ink hover:bg-ink/[0.06]"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

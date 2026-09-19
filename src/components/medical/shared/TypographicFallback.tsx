import React from "react";

interface TypographicFallbackProps {
  name: string;
  type?: string;
  location?: string;
  className?: string;
}

/**
 * TypographicFallback — Used when a college lacks a hero image.
 * Ink background, bracketed metadata, large text.
 * Design Guidelines v2 §10.4
 */
export default function TypographicFallback({
  name,
  type,
  location,
  className = "",
}: TypographicFallbackProps) {
  const metaParts = [type, location].filter(Boolean);

  return (
    <div
      className={`w-full h-full bg-ink flex flex-col justify-end p-6 md:p-12 border-b border-white/10 ${className}`}
    >
      {metaParts.length > 0 && (
        <div className="text-micro text-gold tracking-widest uppercase mb-4 opacity-90">
          [ {metaParts.join(" · ")} ]
        </div>
      )}
      <h1 className="text-h1 text-text-on-dark max-w-4xl tracking-tight leading-tight">
        {name}
      </h1>
    </div>
  );
}

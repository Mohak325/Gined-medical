"use client";

export function ShinyText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block bg-clip-text ${className}`}
      style={{
        backgroundImage: "linear-gradient(120deg, currentColor 40%, rgba(201,162,75,0.8) 50%, currentColor 60%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        animation: "shiny-text 3s ease-in-out infinite",
      }}
    >
      {children}
    </span>
  );
}

"use client";

import { useCinematicContext } from "@/lib/medical/CinematicProvider";

export default function Veil({ variant = "warm" }: { variant?: "warm" | "dark" }) {
  const cinematic = useCinematicContext();

  if (!cinematic) return null;

  return (
    <div 
      aria-hidden="true" 
      className={`h-32 w-full pointer-events-none -mt-32 relative z-20 bg-gradient-to-b ${
        variant === "warm" 
          ? "from-transparent to-paper-bright" 
          : "from-transparent to-ink"
      }`} 
    />
  );
}

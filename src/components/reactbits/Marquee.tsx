"use client";

import { useRef, useEffect, useState } from "react";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
}

export function Marquee({ children, speed = 40, className = "", pauseOnHover = true }: MarqueeProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      
      <div
        className={`flex whitespace-nowrap ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        <div className="flex items-center gap-12 pr-12">
          {children}
        </div>
        <div className="flex items-center gap-12 pr-12" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

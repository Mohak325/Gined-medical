"use client";

import React from "react";

export function StarBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative inline-block rounded-[12px] p-[2px] overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: "conic-gradient(from 0deg, transparent, #C9A24B, transparent, #C9A24B, transparent)",
          animation: "star-border-spin 4s linear infinite",
        }}
      />
      <div className="relative rounded-[10px] bg-ink">
        {children}
      </div>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Track = "ug" | "pg";
export type Category = "general" | "obc" | "sc" | "st" | "ews";
export type Quota = "aiq" | "state";

interface MedicalPageContextType {
  track: Track;
  setTrack: (track: Track) => void;
  category: Category;
  setCategory: (category: Category) => void;
  quota: Quota;
  setQuota: (quota: Quota) => void;
  state: string;
  setState: (state: string) => void;
}

const MedicalPageContext = createContext<MedicalPageContextType | undefined>(undefined);

export function MedicalPageProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<Track>("ug");
  const [category, setCategory] = useState<Category>("general");
  const [quota, setQuota] = useState<Quota>("aiq");
  const [state, setState] = useState<string>("");

  return (
    <MedicalPageContext.Provider
      value={{
        track,
        setTrack,
        category,
        setCategory,
        quota,
        setQuota,
        state,
        setState,
      }}
    >
      {children}
    </MedicalPageContext.Provider>
  );
}

export function useMedicalPage() {
  const context = useContext(MedicalPageContext);
  if (context === undefined) {
    throw new Error("useMedicalPage must be used within a MedicalPageProvider");
  }
  return context;
}

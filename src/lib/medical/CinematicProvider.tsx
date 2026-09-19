"use client";

import { createContext, useContext, ReactNode } from "react";
import { useCinematic as useCinematicHook } from "./useCinematic";

const CinematicContext = createContext<boolean>(false);

export function CinematicProvider({ children }: { children: ReactNode }) {
  const cinematic = useCinematicHook();
  return (
    <CinematicContext.Provider value={cinematic}>
      {children}
    </CinematicContext.Provider>
  );
}

export function useCinematicContext() {
  return useContext(CinematicContext);
}

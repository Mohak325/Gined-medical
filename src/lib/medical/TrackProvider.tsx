"use client";

import { createContext, useContext, useCallback } from "react";
import { useSessionValue } from "./sessionValue";

type Track = "ug" | "pg";

/** PG uses MCC's All India NEET PG results. Turn it off again if that data is ever removed. */
export const PG_ENABLED = true;

interface TrackContextValue {
  track: Track;
  setTrack: (t: Track) => void;
}

const TrackContext = createContext<TrackContextValue | null>(null);

const STORAGE_KEY = "medical:track";

export function TrackProvider({ children }: { children: React.ReactNode }) {
  const [stored, store] = useSessionValue(STORAGE_KEY, "ug");
  const track: Track = stored === "pg" && PG_ENABLED ? "pg" : "ug";

  const setTrack = useCallback(
    (t: Track) => {
      if (t === "pg" && !PG_ENABLED) return;
      store(t);
    },
    [store]
  );

  return (
    <TrackContext value={{ track, setTrack }}>
      {children}
    </TrackContext>
  );
}

export function useTrack(): TrackContextValue {
  const ctx = useContext(TrackContext);
  if (!ctx) throw new Error("useTrack must be used within <TrackProvider>");
  return ctx;
}

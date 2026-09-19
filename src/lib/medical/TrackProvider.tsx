"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type Track = "ug" | "pg";

interface TrackContextValue {
  track: Track;
  setTrack: (t: Track) => void;
}

const TrackContext = createContext<TrackContextValue | null>(null);

const STORAGE_KEY = "medical:track";

export function TrackProvider({ children }: { children: React.ReactNode }) {
  const [track, setTrackState] = useState<Track>("ug");

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "ug" || stored === "pg") {
      setTrackState(stored);
    }
  }, []);

  const setTrack = useCallback((t: Track) => {
    setTrackState(t);
    sessionStorage.setItem(STORAGE_KEY, t);
  }, []);

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

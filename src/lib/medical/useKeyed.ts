"use client";

import { useEffect, useState } from "react";

/**
 * Loads data for a key and returns it only while the key still matches, so a component shows
 * nothing stale and never sets state synchronously inside an effect. A null key loads nothing.
 */
export function useKeyed<T>(key: string | null, load: () => Promise<T>): T | undefined {
  const [state, setState] = useState<{ key: string; data: T } | null>(null);
  useEffect(() => {
    if (!key) return;
    let live = true;
    load().then((data) => {
      if (live) setState({ key, data });
    });
    return () => {
      live = false;
    };
    // `load` is rebuilt each render; the key captures everything it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state && state.key === key ? state.data : undefined;
}

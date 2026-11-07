"use server";

import { collegeSummary } from "@/lib/medical/collegeSummary";

/** Names for the compare tray. */
export async function getCompareNames(ids: string[]): Promise<{ id: string; name: string }[]> {
  return ids.flatMap((id) => {
    const college = collegeSummary(id);
    return college ? [{ id, name: college.name }] : [];
  });
}

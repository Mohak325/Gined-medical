"use server";

import { collegeSummary, type CollegeSummary } from "@/lib/medical/collegeSummary";

/** Directory details for the colleges on a shortlist, in the order asked. */
export async function getShortlistDetails(ids: string[]): Promise<CollegeSummary[]> {
  return ids.slice(0, 100).flatMap((id) => {
    const college = collegeSummary(id);
    return college ? [college] : [];
  });
}

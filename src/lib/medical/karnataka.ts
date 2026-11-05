/**
 * Karnataka's seat codes, as used by its counselling authority (KEA).
 * A code combines a base group and a sub-quota: "2AR" is group 2A, rural.
 */
export type KeaSeat = "government" | "private_karnataka" | "private_open";

export const KEA_SEATS: { value: KeaSeat; label: string }[] = [
  { value: "government", label: "Government quota seats" },
  { value: "private_karnataka", label: "Private seats (GMP, Karnataka candidates)" },
  { value: "private_open", label: "Private seats (OPN, any Indian citizen)" },
];

export const KEA_GROUPS = [
  { value: "GM", label: "General Merit (GM)" },
  { value: "1", label: "Category 1" },
  { value: "2A", label: "2A" },
  { value: "2B", label: "2B" },
  { value: "3A", label: "3A" },
  { value: "3B", label: "3B" },
  { value: "S1", label: "SC, KEA group S1" },
  { value: "S2", label: "SC, KEA group S2" },
  { value: "S3", label: "SC, KEA group S3" },
  { value: "S4", label: "SC, KEA group S4" },
  { value: "ST", label: "ST" },
];

export const KEA_SUB_QUOTAS = [
  { value: "G", label: "None" },
  { value: "R", label: "Rural" },
  { value: "K", label: "Kannada medium" },
  { value: "H", label: "Hyderabad-Karnataka" },
  { value: "RH", label: "Hyderabad-Karnataka and rural" },
  { value: "KH", label: "Hyderabad-Karnataka and Kannada medium" },
];

/** Builds the KEA code for a student's choices. */
export function composeKeaCode(seat: KeaSeat, group: string, subQuota: string): string {
  if (seat === "private_open") return "OPN";
  if (seat === "private_karnataka") return subQuota === "H" ? "GMPH" : "GMP";
  if (group === "GM") return subQuota === "G" ? "GM" : `GM${subQuota}`;
  return `${group}${subQuota}`;
}

/** Reverses composeKeaCode, so the form can show what's in the URL. */
export function parseKeaCode(code: string | null): { seat: KeaSeat; group: string; subQuota: string } {
  if (code === "OPN") return { seat: "private_open", group: "GM", subQuota: "G" };
  if (code === "GMP") return { seat: "private_karnataka", group: "GM", subQuota: "G" };
  if (code === "GMPH") return { seat: "private_karnataka", group: "GM", subQuota: "H" };
  const match = code?.match(/^(GM|1|2A|2B|3A|3B|S[1-4]|ST)(G|RH|KH|R|K|H)?$/);
  if (!match) return { seat: "government", group: "GM", subQuota: "G" };
  return { seat: "government", group: match[1], subQuota: match[2] ?? "G" };
}

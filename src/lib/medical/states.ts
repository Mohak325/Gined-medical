import meta from "@/data/meta.json";
import { INDIA_STATES } from "./mockData";

export const stateSlug = (name: string) => name.toLowerCase().replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const STATE_PAGES = INDIA_STATES.map((s) => ({ ...s, slug: stateSlug(s.name) }));

export const stateBySlug = (slug: string) => STATE_PAGES.find((s) => s.slug === slug);
export const stateByCode = (code: string) => STATE_PAGES.find((s) => s.code === code);

// Karnataka's rules live in their own module, so its authority isn't in meta.stateAuthorities.
const EXTRA_AUTHORITIES: Record<string, string> = { KA: "Karnataka Examinations Authority (KEA)" };

export function stateAuthority(code: string): string | undefined {
  return (meta.stateAuthorities as Record<string, string>)[code] ?? EXTRA_AUTHORITIES[code];
}

export const hasStateCutoffs = (code: string) => meta.stateCutoffs.includes(code);

// What each finder label means, in one place so the homepage and the results page agree.
// The wording follows CONFIDENCE_THRESHOLDS in src/lib/medical/confidence.ts.
export const LABEL_COPY = [
  { level: "safe", name: "Safe", tone: "bg-safe", text: "Your rank is at least 15% better than the closing rank." },
  { level: "moderate", name: "Moderate", tone: "bg-moderate", text: "Near the closing rank: up to 15% better or 10% past it." },
  { level: "ambitious", name: "Ambitious", tone: "bg-ambitious", text: "10 to 35% past the closing rank. Worth a place in your list." },
] as const;

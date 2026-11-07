import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#0F2E3D";
const PAPER = "#F2EEE4";
const GOLD = "#C9A24B";

/** The share card used across the site: eyebrow, a large title, and up to four figures. */
export function ogCard({ eyebrow, title, stats = [] }: { eyebrow: string; title: string; stats?: { label: string; value: string }[] }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: INK, color: PAPER, padding: "64px 72px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>
            gined<span style={{ color: GOLD }}>.in</span>
          </div>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: GOLD }}>{eyebrow}</div>
        </div>
        <div style={{ display: "flex", fontSize: title.length > 60 ? 56 : 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 1050 }}>{title}</div>
        <div style={{ display: "flex", gap: 56, borderTop: "1px solid rgba(242,238,228,0.18)", paddingTop: 28 }}>
          {stats.slice(0, 4).map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 40, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 22, color: "rgba(242,238,228,0.65)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    OG_SIZE
  );
}

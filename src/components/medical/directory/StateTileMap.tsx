"use client";

/**
 * India as a grid of equal tiles, one per state or union territory, placed roughly where it
 * sits on the map. Equal tiles keep small states as easy to tap as large ones.
 * [column, row] on an 8 x 7 grid.
 */
const TILES: Record<string, [number, number]> = {
  JK: [2, 0], LA: [3, 0],
  CH: [0, 1], PB: [1, 1], HP: [2, 1], UK: [3, 1], SK: [6, 1], AR: [7, 1],
  RJ: [1, 2], HR: [2, 2], DL: [3, 2], UP: [4, 2], BR: [5, 2], AS: [6, 2], NL: [7, 2],
  GJ: [0, 3], MP: [2, 3], CG: [3, 3], JH: [4, 3], WB: [5, 3], ML: [6, 3], MN: [7, 3],
  DN: [0, 4], MH: [1, 4], TG: [2, 4], OR: [4, 4], TR: [6, 4], MZ: [7, 4],
  GA: [1, 5], KA: [2, 5], AP: [3, 5],
  LD: [0, 6], KL: [2, 6], TN: [3, 6], PY: [4, 6], AN: [6, 6],
};

export default function StateTileMap({
  counts,
  names,
  selected,
  onSelect,
}: {
  counts: Record<string, number>;
  names: Record<string, string>;
  selected?: string;
  onSelect: (code: string | undefined) => void;
}) {
  const max = Math.max(1, ...Object.values(counts));
  return (
    <div className="grid grid-cols-8 gap-1" role="group" aria-label="Filter by state">
      {Object.entries(TILES).map(([code, [col, row]]) => {
        const n = counts[code] ?? 0;
        const active = selected === code;
        // Shade by how many colleges the state has, on a gentle curve so small counts still show.
        const strength = n === 0 ? 0 : 0.12 + 0.6 * Math.sqrt(n / max);
        return (
          <button
            key={code}
            type="button"
            disabled={n === 0}
            onClick={() => onSelect(active ? undefined : code)}
            aria-pressed={active}
            title={`${names[code] ?? code}: ${n} college${n === 1 ? "" : "s"}`}
            style={{ gridColumnStart: col + 1, gridRowStart: row + 1, ...(active || n === 0 ? {} : { backgroundColor: `rgba(15, 46, 61, ${strength})` }) }}
            className={`aspect-square rounded-[4px] text-[10px] font-semibold leading-none flex flex-col items-center justify-center transition-[outline-color] outline outline-2 outline-transparent ${
              active
                ? "bg-gold text-ink outline-ink"
                : n === 0
                  ? "bg-paper-dim text-text-muted/50 cursor-not-allowed"
                  : `${strength > 0.45 ? "text-text-on-dark" : "text-ink"} hover:outline-gold`
            }`}
          >
            {code}
            {n > 0 && <span className="text-[9px] font-normal opacity-80 tabular-nums">{n}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** @jsxImportSource hono/jsx */
import { COUNTRY_SHAPES } from "../styles/worldMapData";

interface Props {
  countryCounts: Record<string, number>;
}

/**
 * SVG world heatmap using Robinson projection paths (MIT, sirLisko/world-map-country-shapes).
 * Covers 39 key countries. Countries without data are shown in light gray.
 */
export function WorldMap({ countryCounts }: Props) {
  const activeCounts = Object.values(countryCounts).filter((c) => c > 0);

  if (activeCounts.length === 0) {
    return (
      <p style="font-size:0.85rem;color:#bbb;padding:1rem 0">
        Keine Geo-Daten vorhanden – Scans ohne Land-Erkennung werden nicht angezeigt.
      </p>
    );
  }

  const maxCount = Math.max(...activeCounts);

  function fillColor(code: string): string {
    const count = countryCounts[code];
    if (!count) return "#dde3eb";
    const opacity = 0.25 + (count / maxCount) * 0.75;
    return `rgba(26,60,107,${opacity.toFixed(2)})`;
  }

  const legendStops = [0.25, 0.6, 1.0];

  return (
    <div>
      <svg
        viewBox="0 0 2000 1001"
        style="width:100%;height:auto;display:block;background:#eaf1f8;border-radius:0.5rem"
        aria-label="Scan-Weltkarte"
      >
        {Object.keys(COUNTRY_SHAPES).map((code) => (
          <path
            d={COUNTRY_SHAPES[code]}
            fill={fillColor(code)}
            stroke="#fff"
            stroke-width="1.5"
          />
        ))}
      </svg>

      <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.6rem;font-size:0.72rem;color:#888">
        <span>wenige Scans</span>
        {legendStops.map((op) => (
          <span
            style={`width:1rem;height:0.6rem;border-radius:2px;background:rgba(26,60,107,${op});display:inline-block`}
          />
        ))}
        <span>viele Scans</span>
        <span style="margin-left:1rem;color:#bbb">Grau = keine Daten</span>
      </div>
    </div>
  );
}

interface Point {
  date: string;
  value: number;
}

// Matches proageing.org's dashboard trend chart exactly: a simple SVG
// polyline with a highlighted latest point, scaled to the data's own range.
export function TrendChart({ rows, color, dotColor }: { rows: Point[]; color: string; dotColor: string }) {
  const w = 340;
  const h = 160;
  const padL = 28;
  const padR = 14;
  const padT = 16;
  const padB = 26;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const values = rows.map((r) => r.value);
  const minScale = Math.max(0, Math.min(...values) - 5);
  const maxScale = Math.max(...values) + 5;
  const n = rows.length;
  const xFor = (i: number) => padL + (n === 1 ? 0 : i * (plotW / (n - 1)));
  const yFor = (v: number) => padT + plotH * (1 - (v - minScale) / (maxScale - minScale));

  const points = rows.map((r, i) => `${xFor(i)},${yFor(r.value)}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {rows.map((r, i) => {
        const isLast = i === n - 1;
        return (
          <g key={r.date + i}>
            <circle cx={xFor(i)} cy={yFor(r.value)} r={isLast ? 7 : 5} fill={isLast ? color : dotColor} />
            {isLast && (
              <text x={xFor(i)} y={yFor(r.value) - 14} textAnchor="middle" fontSize={13} fontWeight={700} fill={color}>
                {r.value}
              </text>
            )}
            <text x={xFor(i)} y={h - 6} textAnchor="middle" fontSize={10} fill="#767676">
              {r.date}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

"use client";

/** Minimal responsive SVG line chart for 0–100 values. */
export function LineChart({ points, height = 160, label }: { points: { x: string; y: number }[]; height?: number; label: string }) {
  if (points.length === 0) return null;
  const W = 600, H = height, P = { l: 34, r: 12, t: 12, b: 24 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const xs = (i: number) => P.l + (points.length === 1 ? iw / 2 : (i * iw) / (points.length - 1));
  const ys = (v: number) => P.t + ih - (v / 100) * ih;
  const path = points.map((p, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)},${ys(p.y).toFixed(1)}`).join(" ");
  const area = `${path} L${xs(points.length - 1)},${P.t + ih} L${xs(0)},${P.t + ih} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={P.l} x2={W - P.r} y1={ys(g)} y2={ys(g)} stroke="#6B0F1A" strokeOpacity={g === 0 ? 0.25 : 0.08} />
          <text x={P.l - 6} y={ys(g) + 4} textAnchor="end" fontSize="11" fill="#78716c">{g}</text>
        </g>
      ))}
      <path d={area} fill="#C9A84C" fillOpacity={0.18} />
      <path d={path} fill="none" stroke="#6B0F1A" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={xs(i)} cy={ys(p.y)} r={4} fill="#fff" stroke="#6B0F1A" strokeWidth={2}><title>{`${p.x}: ${p.y}%`}</title></circle>
          {(points.length <= 8 || i % Math.ceil(points.length / 8) === 0 || i === points.length - 1) && (
            <text x={xs(i)} y={H - 6} textAnchor="middle" fontSize="10.5" fill="#78716c">{p.x}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

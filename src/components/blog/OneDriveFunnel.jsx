import { useState } from "react";

// Edit these five numbers (millions of devs) and everything else re-lays out.
const STAGES = [
  { key: "all",    label: "Professional devs",     sub: "worldwide",            value: 30 },
  { key: "win",    label: "On Windows",            sub: "KFM pushed hardest here", value: 14,  pct: 0.47, drop: "Mac/Linux (lower odds)"},
  { key: "kfm",    label: "OneDrive KFM on",       sub: "syncing Desktop/Docs", value: 4.9, pct: 0.35, drop: "No KFM" },
  { key: "folder", label: "Code in those folders", sub: "IDE defaults",         value: 2.0, pct: 0.40, drop: "Code elsewhere" },
  { key: "over",   label: "Over the 300k limit",   sub: "silently cooked",      value: 1.2, pct: 0.60, drop: "Under the limit", cooked: true },
];

const VB_W = 960, VB_H = 460;
const M = { top: 70, right: 150, bottom: 34, left: 28 };
const NODE_W = 14;
const plotTop = M.top;
const plotBottom = VB_H - M.bottom;
const plotH = plotBottom - plotTop;
const TOTAL = STAGES[0].value;
const sppm = plotH / TOTAL;
const colStep = (VB_W - M.right - NODE_W - M.left) / (STAGES.length - 1);
const colX = STAGES.map((_, i) => M.left + i * colStep);

const AMBER = [0.30, 0.40, 0.50, 0.62]; // ribbon opacity, deepening as the funnel narrows
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SANS = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

const fmt = (m) => (m >= 1 ? `${m % 1 === 0 ? m : m.toFixed(1)}M` : `${Math.round(m * 1000)}k`);

function ribbon(sx, sy0, sy1, tx, ty0, ty1) {
  const mx = (sx + tx) / 2;
  return `M ${sx} ${sy0} C ${mx} ${sy0} ${mx} ${ty0} ${tx} ${ty0} L ${tx} ${ty1} C ${mx} ${ty1} ${mx} ${sy1} ${sx} ${sy1} Z`;
}

export default function OneDriveFunnel() {
  const [hover, setHover] = useState(null);

  const cont = STAGES.map((s, i) => {
    const h = s.value * sppm;
    return { ...s, i, x: colX[i], y0: plotTop, y1: plotTop + h, h };
  });
  const drops = STAGES.map((s, i) => {
    if (i === 0) return null;
    const dv = STAGES[i - 1].value - s.value;
    const h = dv * sppm;
    return { key: s.key, lk: "d" + i, dropLabel: s.drop, value: dv, x: colX[i], y0: plotBottom - h, y1: plotBottom, h };
  });

  const links = [];
  for (let i = 1; i < STAGES.length; i++) {
    const src = cont[i - 1];
    const sx = src.x + NODE_W;
    const contH = STAGES[i].value * sppm;
    links.push({
      type: "cont", key: "c" + i, fill: `rgba(202,138,4,${AMBER[i - 1]})`,
      d: ribbon(sx, src.y0, src.y0 + contH, cont[i].x, cont[i].y0, cont[i].y1),
      value: STAGES[i].value, label: STAGES[i].label + ", still in the funnel", red: !!STAGES[i].cooked,
    });
    links.push({
      type: "drop", key: "d" + i, fill: "rgba(148,163,184,0.22)",
      d: ribbon(sx, src.y0 + contH, src.y1, drops[i].x, drops[i].y0, drops[i].y1),
      value: drops[i].value, label: drops[i].dropLabel + ", safe",
    });
  }

  const r = hover || { label: "Windows devs in the trap", value: 1.2, hint: "0.3M to 3M range", red: true };
  const dim = (k) => (hover ? (hover.key === k ? 1 : 0.28) : 1);

  return (
    <figure style={{ margin: 0, fontFamily: SANS, color: "#0f172a", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "0 4px 10px", flexWrap: "wrap" }}>
        <span style={{ fontFamily: MONO, fontSize: 13, color: "#64748b", letterSpacing: 0.3 }}>FUNNEL</span>
        <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: r.red ? "#dc2626" : "#0f172a" }}>{fmt(r.value)}</span>
        <span style={{ fontSize: 14, color: "#334155" }}>{r.label}</span>
        {r.hint && <span style={{ fontFamily: MONO, fontSize: 12, color: "#94a3b8" }}>{r.hint}</span>}
      </div>

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" role="img"
           aria-label="Funnel from 30 million professional developers down to roughly 1.2 million on Windows whose OneDrive is over the 300,000 file limit"
           style={{ display: "block", maxWidth: "100%" }}>

        {cont.map((n) => (
          <g key={"h" + n.key}>
            <text x={n.x + NODE_W / 2} y={28} textAnchor="middle"
                  style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, fill: n.cooked ? "#dc2626" : "#334155" }}>
              {n.label}
            </text>
            <text x={n.x + NODE_W / 2} y={46} textAnchor="middle"
                  style={{ fontFamily: MONO, fontSize: 12, fill: n.cooked ? "#dc2626" : "#64748b" }}>
              {fmt(n.value)}{n.pct ? ` / ${Math.round(n.pct * 100)}%` : ""}
            </text>
          </g>
        ))}

        {links.filter((l) => l.type === "drop").map((l) => (
          <path key={l.key} d={l.d} fill={l.fill} opacity={dim(l.key)}
                onMouseEnter={() => setHover(l)} onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer", transition: "opacity .15s" }}>
            <title>{l.label}: {fmt(l.value)}</title>
          </path>
        ))}

        {links.filter((l) => l.type === "cont").map((l) => (
          <path key={l.key} d={l.d} fill={l.fill} opacity={dim(l.key)}
                onMouseEnter={() => setHover(l)} onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer", transition: "opacity .15s" }}>
            <title>{l.label}: {fmt(l.value)}</title>
          </path>
        ))}

        {drops.map((d) => d && (
          <g key={"dn" + d.key}>
            <rect x={d.x} y={d.y0} width={NODE_W} height={Math.max(d.h, 2)} rx={2} fill="#cbd5e1"
                  onMouseEnter={() => setHover({ key: d.lk, label: d.dropLabel + ", safe", value: d.value })}
                  onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }} />
            <text x={d.x + NODE_W + 7} y={d.y0 + Math.max(d.h, 2) / 2} dominantBaseline="middle"
                  style={{ fontFamily: MONO, fontSize: 11, fill: "#94a3b8",
                           paintOrder: "stroke", stroke: "#ffffff", strokeWidth: 3, strokeLinejoin: "round" }}>
              {fmt(d.value)} safe
            </text>
          </g>
        ))}

        {cont.map((n) => (
          <rect key={"cn" + n.key} x={n.x} y={n.y0} width={NODE_W} height={Math.max(n.h, 3)} rx={2}
                fill={n.cooked ? "#dc2626" : "#334155"} />
        ))}

        {(() => {
          const t = cont[cont.length - 1];
          const cx = t.x + NODE_W;
          const lx = cx + 26;
          const ly = t.y0 + 6;
          return (
            <g>
              <path d={`M ${cx} ${t.y0 + t.h / 2} L ${lx - 6} ${ly + 8}`} stroke="#dc2626" strokeWidth={1.2} fill="none" />
              <text x={lx} y={ly} style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, fill: "#dc2626" }}>~1.2M</text>
              <text x={lx} y={ly + 20} style={{ fontFamily: SANS, fontSize: 13, fill: "#dc2626" }}>silently cooked</text>
              <text x={lx} y={ly + 38} style={{ fontFamily: MONO, fontSize: 11, fill: "#94a3b8" }}>0.3M to 3M range</text>
            </g>
          );
        })()}
      </svg>

      <figcaption style={{ display: "flex", gap: 16, padding: "10px 6px 0", fontFamily: MONO, fontSize: 11, color: "#94a3b8", flexWrap: "wrap" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(202,138,4,0.7)", borderRadius: 2, marginRight: 6, verticalAlign: "middle" }} />still in the funnel</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#cbd5e1", borderRadius: 2, marginRight: 6, verticalAlign: "middle" }} />peeled off safe</span>
        <span style={{ marginLeft: "auto" }}>fractions are Fermi guesses, wide error bars, solid direction · Mac/Linux OneDrive users hit the same trap at lower default rates</span>
      </figcaption>
    </figure>
  );
}

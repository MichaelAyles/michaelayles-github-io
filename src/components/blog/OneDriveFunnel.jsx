import { useState } from "react";
import { Sankey, Tooltip, ResponsiveContainer } from "recharts";

// Funnel stages (millions of devs). Edit these and the diagram re-derives.
const STAGES = [
  { name: "Professional devs", value: 30 },
  { name: "On Windows", value: 14, drop: "Mac / Linux" },
  { name: "OneDrive KFM on", value: 4.9, drop: "No KFM" },
  { name: "Code in those folders", value: 2.0, drop: "Code elsewhere" },
  { name: "Over the 300k limit", value: 1.2, drop: "Under the limit", cooked: true },
];

// Build recharts Sankey {nodes, links}: a main chain that narrows, with a
// "safe" branch peeling off at every step.
const nodes = [];
const links = [];
STAGES.forEach((s) => nodes.push({ name: s.name, cooked: !!s.cooked }));
const dropIndex = {};
for (let i = 1; i < STAGES.length; i++) {
  dropIndex[i] = nodes.length;
  nodes.push({ name: STAGES[i].drop, safe: true });
  const carried = STAGES[i].value;
  const dropped = STAGES[i - 1].value - carried;
  links.push({ source: i - 1, target: i, value: carried });
  links.push({ source: i - 1, target: dropIndex[i], value: dropped });
}

const MONO = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const SANS = "'Inter', sans-serif";
const ACCENT = "#f97316"; // house orange
const RED = "#ef4444";
const SAFE = "#94a3b8";

const fmt = (m) => (m >= 1 ? `${m % 1 === 0 ? m : m.toFixed(1)}M` : `${Math.round(m * 1000)}k`);

function Node({ x, y, width, height, index, payload, containerWidth }) {
  const node = nodes[index];
  const cooked = node?.cooked;
  const safe = node?.safe;
  const fill = cooked ? RED : safe ? SAFE : "var(--text-primary)";
  const labelRight = x < containerWidth / 2;
  const tx = labelRight ? x + width + 8 : x - 8;
  const anchor = labelRight ? "start" : "end";
  const h = Math.max(height, 12);
  return (
    <g>
      <rect x={x} y={y} width={width} height={Math.max(height, 2)} rx={2}
        fill={fill} fillOpacity={safe ? 0.5 : 0.9} />
      <text x={tx} y={y + h / 2 - 3} textAnchor={anchor} dominantBaseline="middle"
        fontFamily={SANS} fontSize={12} fontWeight={600}
        fill={cooked ? RED : "var(--text-primary)"}>
        {node?.name}
      </text>
      <text x={tx} y={y + h / 2 + 11} textAnchor={anchor} dominantBaseline="middle"
        fontFamily={MONO} fontSize={11}
        fill={cooked ? RED : safe ? SAFE : "var(--text-secondary)"}>
        {fmt(payload.value)}{safe ? " safe" : ""}
      </text>
    </g>
  );
}

function Link(props) {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, payload } = props;
  const [hover, setHover] = useState(false);
  const targetIdx = payload.target?.index ?? payload.target;
  const targetNode = nodes[targetIdx];
  const safe = targetNode?.safe;
  const cooked = targetNode?.cooked;
  const depth = Math.max(payload.source?.depth ?? 0, 0);
  const stroke = safe ? SAFE : cooked ? RED : ACCENT;
  const baseOpacity = safe ? 0.18 : cooked ? 0.7 : 0.22 + depth * 0.12;
  return (
    <path
      d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none" stroke={stroke} strokeWidth={Math.max(linkWidth, 1)}
      strokeOpacity={hover ? Math.min(baseOpacity + 0.25, 0.95) : baseOpacity}
      style={{ transition: "stroke-opacity .15s" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    />
  );
}

function Box({ children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6,
      padding: "8px 10px", fontFamily: MONO, fontSize: 12, color: "var(--text-primary)",
      display: "flex", flexDirection: "column", gap: 2 }}>
      {children}
    </div>
  );
}

function TipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  // Node hover: recharts gives the node payload with sourceLinks/targetLinks.
  if (p.name && (p.sourceLinks || p.targetLinks)) {
    const n = nodes.find((x) => x.name === p.name);
    return (
      <Box>
        <strong>{p.name}</strong>
        <span>{fmt(p.value)}{n?.safe ? " peeled off safe" : n?.cooked ? " silently cooked" : " still in the funnel"}</span>
      </Box>
    );
  }
  // Link hover
  if (p.source != null && p.target != null) {
    const t = nodes[p.target?.index ?? p.target];
    return (
      <Box>
        <strong>{fmt(p.value)}</strong>
        <span>{t?.safe ? `${t.name}, safe` : `${t?.name}, still in the funnel`}</span>
      </Box>
    );
  }
  return null;
}

export default function OneDriveFunnel() {
  const cooked = STAGES[STAGES.length - 1].value;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, margin: "32px 0" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-secondary)", letterSpacing: 0.3 }}>FUNNEL</span>
        <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: RED }}>~{fmt(cooked)}</span>
        <span style={{ fontFamily: SANS, fontSize: 14, color: "var(--text-primary)" }}>devs over the 300k limit and silently not backed up</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-dim)" }}>0.3M to 3M range</span>
      </div>

      <div style={{ display: "flex", gap: 18, margin: "10px 0 4px", flexWrap: "wrap" }}>
        {[
          { c: ACCENT, l: "still in the funnel" },
          { c: SAFE, l: "peeled off safe", dim: true },
          { c: RED, l: "silently cooked" },
        ].map(({ c, l, dim }) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 14, height: 10, borderRadius: 2, background: c, opacity: dim ? 0.5 : 0.9 }} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: "var(--text-secondary)" }}>{l}</span>
          </div>
        ))}
      </div>

      <div style={{ width: "100%" }}>
        <ResponsiveContainer width="100%" height={440}>
          <Sankey
            data={{ nodes, links }}
            node={<Node />}
            link={<Link />}
            nodePadding={26}
            nodeWidth={12}
            margin={{ top: 20, right: 150, bottom: 20, left: 24 }}
          >
            <Tooltip content={<TipContent />} />
          </Sankey>
        </ResponsiveContainer>
      </div>

      <div style={{ fontFamily: SANS, fontSize: 12, color: "var(--text-dim)", marginTop: 8, lineHeight: 1.5 }}>
        Fractions are Fermi guesses with wide error bars but a solid direction. Mac and Linux OneDrive users hit the same
        300k trap, just at lower default adoption rates. Hover any flow for its count.
      </div>
    </div>
  );
}

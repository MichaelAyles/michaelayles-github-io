import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "var(--background)",
  surface: "var(--surface)",
  border: "var(--border)",
  text: "var(--text-primary)",
  textMuted: "var(--text-secondary)",
  textDim: "var(--text-dim)",
  accent: "#f97316",
  green: "#22c55e",
  red: "#ef4444",
  redDim: "#7f1d1d",
  blue: "#3b82f6",
  purple: "#a855f7",
  yellow: "#eab308",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

// Pathway definitions
const bevSteps = [
  { label: "Renewable\nElectricity", kWh: 100, eff: null },
  { label: "Grid\nTransmission", kWh: 95, eff: 0.95 },
  { label: "Charging", kWh: 85.5, eff: 0.90 },
  { label: "Battery\nRound-trip", kWh: 77.0, eff: 0.90 },
  { label: "Motor to\nWheel", kWh: 69.3, eff: 0.90 },
];

const h2Steps = [
  { label: "Renewable\nElectricity", kWh: 100, eff: null },
  { label: "Grid\nTransmission", kWh: 95, eff: 0.95 },
  { label: "Electrolysis", kWh: 62.7, eff: 0.66 },
  { label: "Compression\n700 bar", kWh: 54.5, eff: 0.87 },
  { label: "Transport &\nDispensing", kWh: 51.8, eff: 0.95 },
  { label: "Fuel Cell", kWh: 29.5, eff: 0.57 },
  { label: "Motor to\nWheel", kWh: 26.6, eff: 0.90 },
];

// SVG path generators
function flowPath(x0, yc0, w0, x1, yc1, w1) {
  const h0 = w0 / 2, h1 = w1 / 2, cpx = (x0 + x1) / 2;
  return [
    `M ${x0} ${yc0 - h0}`,
    `C ${cpx} ${yc0 - h0}, ${cpx} ${yc1 - h1}, ${x1} ${yc1 - h1}`,
    `L ${x1} ${yc1 + h1}`,
    `C ${cpx} ${yc1 + h1}, ${cpx} ${yc0 + h0}, ${x0} ${yc0 + h0}`,
    `Z`,
  ].join(" ");
}

function lossBranchPath(x0, yc0, w0, x1, yc1, w1, dir) {
  const h0 = w0 / 2, h1 = w1 / 2;
  const sY = yc0 + dir * h0;
  const eY = yc1 + dir * (h1 + 4);
  const cpx = (x0 + x1) / 2;
  return [
    `M ${x0} ${sY}`,
    `C ${cpx} ${sY}, ${cpx} ${eY - dir * h1}, ${x1} ${eY - dir * h1}`,
    `L ${x1} ${eY + dir * h1}`,
    `C ${cpx} ${eY + dir * h1}, ${cpx} ${sY + dir * h0 * 0.3}, ${x0} ${sY + dir * h0 * 0.3}`,
    `Z`,
  ].join(" ");
}

// Single pathway renderer
function SankeyPathway({ steps, yCenter, lossDir, color, animPhase, svgWidth, nodeW }) {
  const scale = 70 / 100;
  const n = steps.length;
  const gap = (svgWidth - n * nodeW) / (n - 1);

  const nodes = steps.map((s, i) => ({
    ...s,
    x: i * (nodeW + gap),
    cx: i * (nodeW + gap) + nodeW / 2,
    fH: s.kWh * scale,
  }));

  return (
    <g>
      {nodes.map((node, i) => {
        if (i === 0) return null;
        const prev = nodes[i - 1];
        const x0 = prev.x + nodeW, x1 = node.x;
        const delay = (i - 1) * 0.4;
        const vis = animPhase > delay;
        const lossKWh = prev.kWh - node.kWh;
        const lossH = lossKWh * scale;

        return (
          <g key={i}>
            <path d={flowPath(x0, yCenter, prev.fH, x1, yCenter, node.fH)}
              fill={color} opacity={vis ? 0.55 : 0}
              style={{ transition: "opacity 0.6s ease" }} />
            {lossKWh > 1.5 && (
              <g opacity={vis ? 0.8 : 0} style={{ transition: "opacity 0.6s ease 0.15s" }}>
                <path
                  d={lossBranchPath(
                    x0 + (x1 - x0) * 0.25, yCenter, lossH * 1.1,
                    x0 + (x1 - x0) * 0.75,
                    yCenter + lossDir * (prev.fH * 0.5 + lossH * 0.7 + 10),
                    lossH * 0.3, lossDir
                  )}
                  fill={COLORS.redDim} opacity={0.45}
                />
                <text
                  x={x0 + (x1 - x0) * 0.5}
                  y={yCenter + lossDir * (prev.fH * 0.5 + lossH + 22)}
                  textAnchor="middle" fill={COLORS.red}
                  fontFamily={mono} fontSize={9} fontWeight={600} opacity={0.75}
                >{"−"}{lossKWh.toFixed(1)}</text>
              </g>
            )}
          </g>
        );
      })}

      {nodes.map((node, i) => {
        const vis = animPhase > i * 0.4 - 0.1;
        return (
          <g key={`n${i}`} opacity={vis ? 1 : 0} style={{ transition: "opacity 0.4s ease" }}>
            <rect x={node.x} y={yCenter - node.fH / 2} width={nodeW}
              height={Math.max(node.fH, 8)} rx={4}
              fill={i === 0 ? COLORS.blue : color} opacity={0.85} />
            {node.fH > 16 ? (
              <text x={node.cx} y={yCenter + 1} textAnchor="middle" dominantBaseline="middle"
                fill="#fff" fontFamily={mono} fontSize={node.fH > 28 ? 13 : 10} fontWeight={700}>
                {node.kWh.toFixed(0)}</text>
            ) : (
              <text x={node.cx} y={yCenter - node.fH / 2 - 7} textAnchor="middle"
                fill={color} fontFamily={mono} fontSize={11} fontWeight={700}>
                {node.kWh.toFixed(0)}</text>
            )}
            {node.label.split("\n").map((line, li) => (
              <text key={li} x={node.cx} y={yCenter + node.fH / 2 + 14 + li * 12}
                textAnchor="middle" fill={COLORS.textMuted} fontFamily={mono} fontSize={9}>
                {line}</text>
            ))}
            {node.eff && (
              <text x={node.cx} y={yCenter - node.fH / 2 - 7} textAnchor="middle"
                fill={node.eff >= 0.9 ? COLORS.green : node.eff >= 0.7 ? COLORS.yellow : COLORS.red}
                fontFamily={mono} fontSize={9} fontWeight={600}>
                {"×"}{node.eff.toFixed(2)}</text>
            )}
          </g>
        );
      })}
    </g>
  );
}

// Main component
export default function EnergySankey() {
  const [animPhase, setAnimPhase] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.25 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setAnimPhase((p) => { if (p >= 6) { clearInterval(id); return 6; } return p + 0.06; });
    }, 25);
    return () => clearInterval(id);
  }, [started]);

  const W = 830, H = 420, NW = 68;
  const bevY = 115, h2Y = 310;
  const bevFinal = bevSteps[bevSteps.length - 1].kWh;
  const h2Final = h2Steps[h2Steps.length - 1].kWh;
  const ratio = (bevFinal / h2Final).toFixed(1);

  return (
    <div ref={ref} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 24, margin: "32px 0" }}>
      <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { c: COLORS.green, l: "Battery Electric" },
          { c: COLORS.purple, l: "Hydrogen Fuel Cell" },
          { c: COLORS.red, l: "Energy lost as heat", h: 6 },
        ].map(({ c, l, h }) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 14, height: h || 14, borderRadius: 2, background: c, opacity: h ? 0.5 : 1 }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted }}>{l}</span>
          </div>
        ))}
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", margin: "0 auto" }}>
          <line x1={0} y1={(bevY + h2Y) / 2} x2={W} y2={(bevY + h2Y) / 2}
            stroke={COLORS.border} strokeWidth={1} strokeDasharray="4 4" />
          <text x={6} y={bevY - 50} fill={COLORS.green} fontFamily={mono} fontSize={10} fontWeight={700} opacity={0.6}>
            BATTERY ELECTRIC</text>
          <text x={6} y={h2Y - 56} fill={COLORS.purple} fontFamily={mono} fontSize={10} fontWeight={700} opacity={0.6}>
            HYDROGEN FUEL CELL</text>

          <SankeyPathway steps={bevSteps} yCenter={bevY} lossDir={-1} color={COLORS.green}
            animPhase={animPhase} svgWidth={W - 105} nodeW={NW} />
          <SankeyPathway steps={h2Steps} yCenter={h2Y} lossDir={1} color={COLORS.purple}
            animPhase={animPhase} svgWidth={W - 112} nodeW={NW} />

          {animPhase > 4.5 && (
            <g style={{ opacity: Math.min(1, (animPhase - 4.5) * 1.5) }}>
              <rect x={W - 97} y={bevY - 26} width={92} height={52} rx={6}
                fill={COLORS.green} fillOpacity={0.1} stroke={COLORS.green} strokeWidth={1.5} strokeOpacity={0.35} />
              <text x={W - 51} y={bevY - 4} textAnchor="middle" fill={COLORS.green}
                fontFamily={mono} fontSize={20} fontWeight={700}>{bevFinal.toFixed(0)} kWh</text>
              <text x={W - 51} y={bevY + 14} textAnchor="middle" fill={COLORS.green}
                fontFamily={mono} fontSize={9} opacity={0.7}>to wheels</text>

              <rect x={W - 97} y={h2Y - 26} width={92} height={52} rx={6}
                fill={COLORS.purple} fillOpacity={0.1} stroke={COLORS.purple} strokeWidth={1.5} strokeOpacity={0.35} />
              <text x={W - 51} y={h2Y - 4} textAnchor="middle" fill={COLORS.purple}
                fontFamily={mono} fontSize={20} fontWeight={700}>{h2Final.toFixed(0)} kWh</text>
              <text x={W - 51} y={h2Y + 14} textAnchor="middle" fill={COLORS.purple}
                fontFamily={mono} fontSize={9} opacity={0.7}>to wheels</text>

              <line x1={W - 51} y1={bevY + 28} x2={W - 51} y2={h2Y - 28}
                stroke={COLORS.accent} strokeWidth={1.5} strokeDasharray="3 3" />
              <rect x={W - 78} y={(bevY + h2Y) / 2 - 13} width={54} height={26} rx={4}
                fill={COLORS.surface} stroke={COLORS.accent} strokeWidth={1} />
              <text x={W - 51} y={(bevY + h2Y) / 2 + 4} textAnchor="middle" fill={COLORS.accent}
                fontFamily={mono} fontSize={14} fontWeight={700}>{ratio}{"×"}</text>
            </g>
          )}
        </svg>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
        {[
          { label: "Battery Electric", val: `${bevFinal.toFixed(0)} kWh`, sub: `${(100 - bevFinal).toFixed(0)} kWh lost (${(100 - bevFinal).toFixed(0)}%)`, c: COLORS.green },
          { label: "Hydrogen Fuel Cell", val: `${h2Final.toFixed(0)} kWh`, sub: `${(100 - h2Final).toFixed(0)} kWh lost (${(100 - h2Final).toFixed(0)}%)`, c: COLORS.purple },
          { label: "BEV Advantage", val: `${ratio}×`, sub: "more useful work per kWh", c: COLORS.accent },
        ].map(({ label, val, sub, c }) => (
          <div key={label} style={{ background: COLORS.bg, borderRadius: 6, padding: 14, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: c }}>{val}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.textDim, marginTop: 16, padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5 }}>
        Both pathways start with the same 100 kWh of renewable electricity. The battery electric truck delivers {bevFinal.toFixed(0)} kWh to the wheels.
        The hydrogen truck delivers {h2Final.toFixed(0)} kWh, losing {(100 - h2Final).toFixed(0)}% of the original energy across six conversion steps.
        The electrolysis step alone discards {Math.round(95 - 62.7)} kWh as heat. To move the same freight the same distance, hydrogen needs {ratio} times more wind turbines.
      </div>
    </div>
  );
}

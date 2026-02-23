import { useMemo } from "react";

const COLORS = {
  bg: "#0a0a0a",
  surface: "#141414",
  border: "#262626",
  text: "#e5e5e5",
  textMuted: "#737373",
  textDim: "#525252",
  accent: "#f97316",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'DM Sans', 'Helvetica Neue', sans-serif";

const fuels = [
  { name: "Diesel", kwh_kg: 11.9, kwh_L: 10.0, color: "#f97316" },
  { name: "Petrol", kwh_kg: 12.2, kwh_L: 8.9, color: "#eab308" },
  { name: "LNG", kwh_kg: 13.5, kwh_L: 5.8, color: "#3b82f6" },
  { name: "CNG (200 bar)", kwh_kg: 13.5, kwh_L: 2.4, color: "#60a5fa" },
  { name: "H₂ compressed (700 bar)", kwh_kg: 33.3, kwh_L: 1.3, color: "#22c55e" },
  { name: "H₂ liquid (−253°C)", kwh_kg: 33.3, kwh_L: 2.4, color: "#4ade80" },
  { name: "Li-ion battery", kwh_kg: 0.25, kwh_L: 0.7, color: "#a855f7" },
];

export default function EnergyDensityChart() {
  const maxX = 14;
  const maxY = 12;
  const chartW = 500;
  const chartH = 340;
  const pad = { top: 20, right: 30, bottom: 50, left: 60 };
  const w = chartW - pad.left - pad.right;
  const h = chartH - pad.top - pad.bottom;

  const scaleX = (v) => pad.left + (v / maxX) * w;
  const scaleY = (v) => pad.top + h - (v / maxY) * h;

  // H2 points are off-chart on X axis, handle separately
  const h2Fuels = fuels.filter((f) => f.kwh_kg > maxX);
  const normalFuels = fuels.filter((f) => f.kwh_kg <= maxX);

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: 24,
      margin: "32px 0",
    }}>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", maxWidth: 500, display: "block", margin: "0 auto" }}>
        {/* Grid lines */}
        {[0, 2, 4, 6, 8, 10, 12].map((v) => (
          <line key={`gy-${v}`} x1={pad.left} x2={chartW - pad.right} y1={scaleY(v)} y2={scaleY(v)}
            stroke={COLORS.border} strokeWidth={0.5} />
        ))}
        {[0, 2, 4, 6, 8, 10, 12, 14].map((v) => (
          <line key={`gx-${v}`} x1={scaleX(v)} x2={scaleX(v)} y1={pad.top} y2={pad.top + h}
            stroke={COLORS.border} strokeWidth={0.5} />
        ))}

        {/* Axes */}
        <line x1={pad.left} x2={chartW - pad.right} y1={pad.top + h} y2={pad.top + h} stroke={COLORS.textDim} strokeWidth={1} />
        <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + h} stroke={COLORS.textDim} strokeWidth={1} />

        {/* X axis labels */}
        {[0, 2, 4, 6, 8, 10, 12, 14].map((v) => (
          <text key={`xl-${v}`} x={scaleX(v)} y={pad.top + h + 16} textAnchor="middle"
            fill={COLORS.textDim} fontFamily={mono} fontSize={9}>{v}</text>
        ))}
        <text x={pad.left + w / 2} y={chartH - 4} textAnchor="middle"
          fill={COLORS.textMuted} fontFamily={sans} fontSize={10}>Gravimetric (kWh/kg)</text>

        {/* Y axis labels */}
        {[0, 2, 4, 6, 8, 10, 12].map((v) => (
          <text key={`yl-${v}`} x={pad.left - 8} y={scaleY(v) + 3} textAnchor="end"
            fill={COLORS.textDim} fontFamily={mono} fontSize={9}>{v}</text>
        ))}
        <text x={14} y={pad.top + h / 2} textAnchor="middle" transform={`rotate(-90, 14, ${pad.top + h / 2})`}
          fill={COLORS.textMuted} fontFamily={sans} fontSize={10}>Volumetric (kWh/L)</text>

        {/* Data points */}
        {normalFuels.map((f) => (
          <g key={f.name}>
            <circle cx={scaleX(f.kwh_kg)} cy={scaleY(f.kwh_L)} r={6} fill={f.color} opacity={0.85} />
            <text x={scaleX(f.kwh_kg) + 9} y={scaleY(f.kwh_L) + 3}
              fill={COLORS.text} fontFamily={sans} fontSize={9}>{f.name}</text>
          </g>
        ))}

        {/* H2 arrows (off-chart on X) */}
        {h2Fuels.map((f, i) => {
          const arrowX = chartW - pad.right - 6;
          const yPos = scaleY(f.kwh_L);
          return (
            <g key={f.name}>
              <circle cx={arrowX} cy={yPos} r={6} fill={f.color} opacity={0.85} />
              <text x={arrowX - 10} y={yPos + 3} textAnchor="end"
                fill={COLORS.text} fontFamily={sans} fontSize={9}>{f.name}</text>
              <text x={arrowX} y={yPos - 10} textAnchor="middle"
                fill={COLORS.textDim} fontFamily={mono} fontSize={8}>→ 33.3</text>
            </g>
          );
        })}
      </svg>

      <div style={{
        fontFamily: sans,
        fontSize: 12,
        color: COLORS.textDim,
        marginTop: 12,
        lineHeight: 1.5,
        textAlign: "center",
      }}>
        Diesel sits in the top-right: high energy per kilogram <em>and</em> per litre. Hydrogen excels gravimetrically (off-chart at 33.3 kWh/kg) but is poor volumetrically. Batteries lag on both axes.
      </div>
    </div>
  );
}

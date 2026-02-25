import { useState } from "react";

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
  blue: "#3b82f6",
  cyan: "#06b6d4",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

const Card = ({ children, style }) => (
  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 24, margin: "32px 0", ...style }}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
    {children}
  </span>
);

const Slider = ({ label, value, onChange, min, max, step = 1, unit = "" }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <Label>{label}</Label>
      <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.accent }}>
        {value}{unit}
      </span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }} />
  </div>
);

const Insight = ({ children }) => (
  <div style={{
    fontFamily: sans, fontSize: 13, marginTop: 16, padding: "12px 16px", borderRadius: 6, lineHeight: 1.5,
    background: COLORS.bg,
    color: COLORS.textDim,
  }}>
    {children}
  </div>
);

export default function PowertrainComparator() {
  const [boundary, setBoundary] = useState("wtw");
  const [methaneSlip, setMethaneSlip] = useState(2.0);
  const [gridIntensity, setGridIntensity] = useState(126);

  const gwp = { ch4: 29.8, n2o: 273 };

  const powertrains = [
    {
      name: "Diesel (Euro VI)",
      ttw: 750 + (0.004 * gwp.n2o),
      wtw: 900,
      color: COLORS.textMuted,
      note: "Baseline. Includes ~8% N2O surcharge from SCR.",
    },
    {
      name: "CNG (spark-ignited)",
      ttw: 660 + (280 * (methaneSlip / 100) * gwp.ch4 / 100),
      wtw: 660 + (280 * (methaneSlip / 100) * gwp.ch4 / 100) + (280 * 0.018 * gwp.ch4 / 100) + 55,
      color: COLORS.accent,
      note: `${methaneSlip}% engine slip + 1.8% upstream. Tailpipe CO2 is lower. Total may not be.`,
    },
    {
      name: "BEV (UK grid 2025)",
      ttw: 0,
      wtw: 1.2 * gridIntensity,
      color: COLORS.green,
      note: `At ${gridIntensity} gCO2/kWh. Zero tailpipe. Gets cleaner every year.`,
    },
    {
      name: "BEV (100% renewable)",
      ttw: 0,
      wtw: 12,
      color: COLORS.cyan,
      note: "Near-zero. Small embodied energy from manufacturing and transmission.",
    },
    {
      name: "H2 fuel cell (grey)",
      ttw: 0,
      wtw: 1050,
      color: COLORS.red,
      note: "Zero tailpipe. ~10 kg CO2 per kg H2 at the reformer, plus upstream CH4.",
    },
    {
      name: "H2 fuel cell (green)",
      ttw: 0,
      wtw: 80,
      color: COLORS.blue,
      note: "Zero tailpipe. Low WTW. But the electricity delivers 2.5x more via BEV.",
    },
  ];

  const getValue = (p) => boundary === "ttw" ? p.ttw : p.wtw;
  const sorted = [...powertrains].sort((a, b) => getValue(b) - getValue(a));
  const maxVal = Math.max(...sorted.map(getValue), 1);

  return (
    <Card>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          Powertrain Emissions: TTW vs WTW
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Total greenhouse gas impact per km for six powertrains. Toggle between tank-to-wheel (exhaust only) and well-to-wheel (full supply chain). Watch the ranking change.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { key: "ttw", label: "Tank-to-Wheel (tailpipe only)" },
          { key: "wtw", label: "Well-to-Wheel (full chain)" },
        ].map(b => (
          <button key={b.key} onClick={() => setBoundary(b.key)} style={{
            fontFamily: mono, fontSize: 11, padding: "8px 14px",
            background: boundary === b.key ? COLORS.accent : COLORS.bg,
            color: boundary === b.key ? "#000" : COLORS.textMuted,
            border: `1px solid ${boundary === b.key ? COLORS.accent : COLORS.border}`,
            borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
          }}>{b.label}</button>
        ))}
      </div>

      {boundary === "wtw" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
          <Slider label="CNG methane slip" value={methaneSlip} onChange={setMethaneSlip} min={0} max={5} step={0.1} unit="%" />
          <Slider label="Grid carbon intensity" value={gridIntensity} onChange={setGridIntensity} min={20} max={300} unit=" gCO2/kWh" />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        {sorted.map((pt) => {
          const val = getValue(pt);
          const barPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={pt.name} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, color: pt.color }}>{pt.name}</span>
                <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: val === 0 ? COLORS.green : COLORS.text }}>
                  {val.toFixed(0)} gCO2e/km
                </span>
              </div>
              <div style={{ position: "relative", height: 22, borderRadius: 4, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
                <div style={{
                  width: `${Math.max(barPct, val > 0 ? 0.5 : 0)}%`, height: "100%",
                  background: val === 0 ? `${COLORS.green}44` : `linear-gradient(90deg, ${pt.color}33, ${pt.color})`,
                  borderRadius: 3, transition: "width 0.4s ease",
                }} />
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim, marginTop: 2 }}>{pt.note}</div>
            </div>
          );
        })}
      </div>

      <Insight>
        {boundary === "ttw"
          ? "Tank-to-wheel only: BEV and hydrogen both show zero. CNG shows lower CO2 than diesel. This is the number most fleets report. Toggle to well-to-wheel to see what the atmosphere actually receives."
          : `Well-to-wheel changes everything. Grey hydrogen exceeds diesel. CNG's advantage shrinks to near-zero at ${methaneSlip}% methane slip. BEV on the current UK grid (${gridIntensity} gCO2/kWh) is substantially lower than all fossil pathways, and the gap widens as the grid decarbonises. The fewer conversion steps between source and wheel, the fewer places for emissions to hide.`
        }
      </Insight>
    </Card>
  );
}

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = {
  bg: "var(--background)",
  surface: "var(--surface)",
  border: "var(--border)",
  text: "var(--text-primary)",
  textMuted: "var(--text-secondary)",
  textDim: "var(--text-dim)",
  accent: "#f97316",
  green: "#22c55e",
  greenDim: "#166534",
  red: "#ef4444",
  blue: "#3b82f6",
  blueDim: "#1e40af",
  yellow: "#eab308",
  purple: "#a855f7",
  cyan: "#06b6d4",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

const Label = ({ children }) => (
  <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
    {children}
  </span>
);

const Slider = ({ label, value, onChange, min, max, step = 1, unit = "", format }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <Label>{label}</Label>
      <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.accent }}>
        {format ? format(value) : value}{unit}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }}
    />
  </div>
);

const Stat = ({ value, unit, label, color = COLORS.accent }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>
      {value}
      <span style={{ fontSize: 13, color: COLORS.textMuted, marginLeft: 4 }}>{unit}</span>
    </div>
    <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </div>
  </div>
);

const presets = {
  green_current: { label: "Green H\u2082 (current)", electricity: 28, efficiency: 66, overhead: 20, color: COLORS.green },
  green_2030: { label: "Green H\u2082 (2030 target)", electricity: 15, efficiency: 75, overhead: 15, color: COLORS.cyan },
  grey: { label: "Grey H\u2082 (SMR)", electricity: 0, efficiency: 100, overhead: 5, color: COLORS.textMuted },
  blue: { label: "Blue H\u2082 (SMR+CCS)", electricity: 0, efficiency: 100, overhead: 15, color: COLORS.blue },
};

export default function HydrogenProductionCalc() {
  const [electricityRate, setElectricityRate] = useState(28);
  const [efficiency, setEfficiency] = useState(66);
  const [overhead, setOverhead] = useState(20);
  const [activePreset, setActivePreset] = useState("green_current");

  const applyPreset = (key) => {
    const p = presets[key];
    setActivePreset(key);
    if (p.electricity > 0) setElectricityRate(p.electricity);
    setEfficiency(p.efficiency);
    setOverhead(p.overhead);
  };

  // Green hydrogen via electrolysis
  const kWhPerKgH2 = 33.33 / (efficiency / 100); // electricity needed per kg
  const kWhWithOverhead = kWhPerKgH2 * (1 + overhead / 100); // including compression etc
  const costPerKgH2 = (kWhWithOverhead * electricityRate) / 100; // £ per kg
  const costPerkWhH2 = costPerKgH2 / 33.33; // £ per kWh of H2 energy

  // Grey/blue hydrogen costs (fixed estimates)
  const isElectrolysis = activePreset === "green_current" || activePreset === "green_2030";
  const greyH2Cost = 2.5; // £/kg approx
  const blueH2Cost = 4.0;

  // Comparison: diesel cost per kWh
  const dieselPricePerL = 1.15;
  const dieselKWhPerL = 10;
  const dieselCostPerKWh = dieselPricePerL / dieselKWhPerL; // £0.115/kWh

  // Fuel cell truck: ~10 kg H2 per 100 miles
  const h2KgPer100Miles = 9;
  const h2CostPer100Miles = h2KgPer100Miles * costPerKgH2;

  // Diesel truck: ~8.5 mpg ≈ 53.4 L per 100 miles
  const dieselLPer100Miles = 100 / (8.5 / 4.546); // convert mpg to L/100mi
  const dieselCostPer100Miles = dieselLPer100Miles * dieselPricePerL;

  // BEV truck: ~1.7 kWh per mile at 20p/kWh commercial
  const bevKWhPerMile = 1.7;
  const bevRate = 0.20;
  const bevCostPer100Miles = 100 * bevKWhPerMile * bevRate;

  const comparisonData = [
    { name: "Battery Electric", cost: bevCostPer100Miles, color: COLORS.green },
    { name: "Diesel", cost: dieselCostPer100Miles, color: COLORS.textMuted },
    { name: `H\u2082 Fuel Cell`, cost: h2CostPer100Miles, color: COLORS.accent },
  ].sort((a, b) => a.cost - b.cost);

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: 24,
      margin: "32px 0",
    }}>
      {/* Presets */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(presets).map(([key, p]) => (
          <button key={key} onClick={() => applyPreset(key)}
            style={{
              fontFamily: mono, fontSize: 11, padding: "6px 14px",
              background: activePreset === key ? COLORS.accent : COLORS.bg,
              color: activePreset === key ? COLORS.bg : COLORS.textMuted,
              border: `1px solid ${activePreset === key ? COLORS.accent : COLORS.border}`,
              borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Sliders */}
      {isElectrolysis && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          <Slider label="Electricity Cost" value={electricityRate} onChange={(v) => { setElectricityRate(v); setActivePreset(null); }}
            min={5} max={50} unit="p/kWh" />
          <Slider label="Electrolyser Efficiency" value={efficiency} onChange={(v) => { setEfficiency(v); setActivePreset(null); }}
            min={50} max={80} unit="%" />
          <Slider label="Compression/Transport" value={overhead} onChange={(v) => { setOverhead(v); setActivePreset(null); }}
            min={5} max={35} unit="% overhead" />
        </div>
      )}

      {/* Key stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Stat value={kWhWithOverhead.toFixed(1)} unit="kWh" label="Electricity per kg H\u2082" color={COLORS.blue} />
        <Stat value={`\u00A3${costPerKgH2.toFixed(2)}`} unit="" label="Cost per kg H\u2082" color={COLORS.accent} />
        <Stat value={`${(costPerkWhH2 * 100).toFixed(1)}p`} unit="" label="Cost per kWh (H\u2082)" color={COLORS.red} />
        <Stat value={`${(dieselCostPerKWh * 100).toFixed(1)}p`} unit="" label="Cost per kWh (diesel)" color={COLORS.textMuted} />
      </div>

      {/* Cost per 100 miles comparison */}
      <div style={{ marginBottom: 8 }}>
        <Label>Fuel cost per 100 miles</Label>
      </div>
      <div style={{ width: "100%", height: 150 }}>
        <ResponsiveContainer>
          <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 50, left: 100, bottom: 5 }}>
            <XAxis type="number" domain={[0, Math.max(200, h2CostPer100Miles + 20)]}
              tick={{ fill: COLORS.textMuted, fontFamily: mono, fontSize: 10 }}
              tickFormatter={(v) => `\u00A3${v.toFixed(0)}`} />
            <YAxis type="category" dataKey="name" width={95}
              tick={{ fill: COLORS.textMuted, fontFamily: mono, fontSize: 11 }} />
            <Tooltip content={({ payload }) => {
              if (!payload?.[0]) return null;
              return (
                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 8 }}>
                  <span style={{ fontFamily: mono, fontSize: 12, color: COLORS.text }}>
                    {payload[0].payload.name}: \u00A3{payload[0].value.toFixed(2)} per 100 miles
                  </span>
                </div>
              );
            }} />
            <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
              {comparisonData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        fontFamily: sans, fontSize: 13, color: COLORS.textDim, marginTop: 16,
        padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5
      }}>
        {isElectrolysis
          ? `At ${electricityRate}p/kWh electricity and ${efficiency}% electrolyser efficiency, green hydrogen costs \u00A3${costPerKgH2.toFixed(2)}/kg. That's ${(costPerkWhH2 / dieselCostPerKWh).toFixed(1)}\u00D7 more expensive than diesel per unit of energy. Per 100 miles, a fuel cell truck costs \u00A3${h2CostPer100Miles.toFixed(0)} vs \u00A3${dieselCostPer100Miles.toFixed(0)} for diesel and \u00A3${bevCostPer100Miles.toFixed(0)} for battery electric.`
          : `${presets[activePreset]?.label || 'This pathway'} produces hydrogen without electrolysis. Grey hydrogen at ~\u00A3${greyH2Cost}/kg is cheapest but emits ~10kg CO\u2082 per kg H\u2082. Blue adds carbon capture at ~\u00A3${blueH2Cost}/kg. Adjust to green hydrogen presets to see the electrolysis economics.`
        }
      </div>
    </div>
  );
}

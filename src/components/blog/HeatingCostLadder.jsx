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

export default function HeatingCostLadder() {
  const [electricityRate, setElectricityRate] = useState(28);

  const electrolysisEff = 0.66;
  const h2CostPerKWh = (electricityRate / electrolysisEff);

  const fuels = [
    { name: "Mains Gas", cost: 7, color: COLORS.green, fixed: true },
    { name: "Diesel (bulk)", cost: 11.5, color: COLORS.textMuted, fixed: true },
    { name: "Bottled LPG", cost: 20, color: COLORS.blue, fixed: true },
    { name: "Direct Electric", cost: electricityRate, color: COLORS.cyan, fixed: false },
    { name: "Hydrogen (electrolysis)", cost: Math.round(h2CostPerKWh), color: COLORS.red, fixed: false },
  ].sort((a, b) => a.cost - b.cost);

  const maxCost = Math.max(...fuels.map(f => f.cost), 50);

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: 24,
      margin: "32px 0",
    }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Electricity Rate
          </span>
          <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.accent }}>
            {electricityRate}p/kWh
          </span>
        </div>
        <input
          type="range" min={5} max={50} step={1} value={electricityRate}
          onChange={(e) => setElectricityRate(Number(e.target.value))}
          style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }}
        />
      </div>

      <div>
        {fuels.map((item) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 12 }}>
            <div style={{
              fontFamily: mono, fontSize: 11, color: COLORS.textMuted,
              width: 170, textAlign: "right", flexShrink: 0,
            }}>
              {item.name}
            </div>
            <div style={{ flex: 1, position: "relative", height: 32 }}>
              <div style={{
                width: `${Math.min(100, (item.cost / maxCost) * 100)}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${item.color}44, ${item.color})`,
                borderRadius: 4,
                transition: "width 0.5s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 8,
                minWidth: 50,
              }}>
                <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                  {item.cost}p/kWh
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        fontFamily: sans, fontSize: 13, color: COLORS.textDim, marginTop: 16,
        padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5,
      }}>
        At {electricityRate}p/kWh, hydrogen via electrolysis costs {Math.round(h2CostPerKWh)}p per kWh of energy, {(h2CostPerKWh / electricityRate).toFixed(1)} times more than using the electricity directly.
        The electrolyser adds a {Math.round((1 / electrolysisEff - 1) * 100)}% markup before you've compressed, transported, or dispensed anything.
      </div>
    </div>
  );
}

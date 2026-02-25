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

const Insight = ({ children, warn }) => (
  <div style={{
    fontFamily: sans, fontSize: 13, marginTop: 16, padding: "12px 16px", borderRadius: 6, lineHeight: 1.5,
    background: warn ? "rgba(239,68,68,0.07)" : COLORS.bg,
    color: warn ? COLORS.red : COLORS.textDim,
    border: warn ? "1px solid rgba(239,68,68,0.2)" : "none",
  }}>
    {children}
  </div>
);

export default function GWPMultiplierVis() {
  const [timeframe, setTimeframe] = useState(100);

  const gases = {
    100: [
      { name: "CO2", gwp: 1, color: COLORS.blue, life: "Centuries", note: "The reference. Persists for hundreds to thousands of years." },
      { name: "CH4 (methane)", gwp: 29.8, color: COLORS.accent, life: "~12 years", note: "Fossil methane incl. oxidation to CO2. Short-lived but 30x more potent." },
      { name: "N2O (nitrous oxide)", gwp: 273, color: COLORS.red, life: "~116 years", note: "From SCR aftertreatment. Almost as persistent as CO2, 273x the punch." },
    ],
    20: [
      { name: "CO2", gwp: 1, color: COLORS.blue, life: "Centuries", note: "Same gas, same reference, any timescale." },
      { name: "CH4 (methane)", gwp: 82.5, color: COLORS.accent, life: "~12 years", note: "Nearly 3x worse on 20-year view. Most warming hits in the first two decades." },
      { name: "N2O (nitrous oxide)", gwp: 273, color: COLORS.red, life: "~116 years", note: "Long-lived, so GWP barely changes between 20 and 100 year timescales." },
    ],
  };

  const data = gases[timeframe];
  const maxGWP = Math.max(...data.map(d => d.gwp));

  return (
    <Card>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          Not All Greenhouse Gases Are Equal
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          1 kg of each gas, expressed in CO2-equivalent warming. Toggle between 100-year and 20-year timescales to see how methane's relative impact changes.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[100, 20].map(t => (
          <button key={t} onClick={() => setTimeframe(t)} style={{
            fontFamily: mono, fontSize: 12, padding: "8px 16px",
            background: timeframe === t ? COLORS.accent : COLORS.bg,
            color: timeframe === t ? "#000" : COLORS.textMuted,
            border: `1px solid ${timeframe === t ? COLORS.accent : COLORS.border}`,
            borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
          }}>GWP{t} ({t}-year)</button>
        ))}
      </div>

      {data.map((gas) => {
        const barWidth = Math.max((gas.gwp / maxGWP) * 100, 0.8);
        return (
          <div key={gas.name} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: gas.color }}>{gas.name}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim }}>{gas.life}</span>
                <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: gas.color }}>
                  {gas.gwp === 1 ? "1" : gas.gwp.toFixed(1)}x
                </span>
              </div>
            </div>
            <div style={{ position: "relative", height: 32, borderRadius: 6, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
              <div style={{
                width: `${barWidth}%`, height: "100%",
                background: `linear-gradient(90deg, ${gas.color}33, ${gas.color})`,
                borderRadius: 5, transition: "width 0.5s ease",
                display: "flex", alignItems: "center", paddingLeft: 10,
              }}>
                {gas.gwp > 10 && (
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#fff", fontWeight: 600 }}>
                    1 kg = {gas.gwp.toFixed(1)} kg CO2e
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontFamily: sans, fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>{gas.note}</div>
          </div>
        );
      })}

      <Insight>
        {timeframe === 100
          ? "At GWP100: 1 kg of methane warms the climate as much as 30 kg of CO2. 1 kg of N2O equals 273 kg. A 2% methane leak from a gas engine can erase the entire CO2 advantage of switching from diesel."
          : "At GWP20: methane's impact nearly triples to 83x CO2. If you're concerned about near-term warming and tipping points, methane from gas trucks looks far worse than the standard 100-year metric suggests. N2O barely changes because it persists for over a century either way."}
      </Insight>
    </Card>
  );
}

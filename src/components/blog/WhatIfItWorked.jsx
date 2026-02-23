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

export default function WhatIfItWorked() {
  const [claimedSaving, setClaimedSaving] = useState(15);

  const voltage = 12;
  const amps = 14;
  const systemKwh = (voltage * amps) / 1000;
  const h2GramsPerHour = (systemKwh / 50) * 1000;
  const h2EnergyKwh = (h2GramsPerHour / 1000) * 33.33;
  const dieselLph = 30;
  const dieselEnergyKwh = dieselLph * 10;

  const savedEnergy = dieselEnergyKwh * (claimedSaving / 100);
  const savedLitres = dieselLph * (claimedSaving / 100);
  const catalyticMultiplier = savedEnergy / h2EnergyKwh;
  const litresPerGramH2 = savedLitres / h2GramsPerHour;

  const getAbsurdityLevel = (mult) => {
    if (mult < 50) return { text: "Unlikely but not physically absurd", color: "#eab308" };
    if (mult < 200) return { text: "More effective than any known industrial catalyst", color: COLORS.accent };
    if (mult < 500) return { text: "Hundreds of times beyond published chemistry", color: COLORS.red };
    return { text: "This would rewrite thermodynamics textbooks", color: COLORS.red };
  };

  const absurdity = getAbsurdityLevel(catalyticMultiplier);

  const comparisons = [
    { label: "Automotive catalytic converter", mult: 1, note: "Precious metals, purpose-built", color: COLORS.green },
    { label: "Industrial Haber-Bosch", mult: 5, note: "Iron catalyst, 400\u00b0C, 200 atm", color: COLORS.green },
    { label: "Best published heterogeneous catalyst", mult: 20, note: "Laboratory conditions", color: COLORS.blue },
    { label: `Required for ${claimedSaving}% HHO claim`, mult: catalyticMultiplier, note: "Zip-tied to chassis rail", color: COLORS.red },
  ];

  return (
    <div style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, padding: 24, margin: "32px 0",
    }}>
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 6 }}>
          "What If It Worked?" Calculator
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Take the claimed fuel saving at face value and work backwards. How powerful would the catalytic effect need to be?
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Claimed Fuel Saving
          </span>
          <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.accent }}>
            {claimedSaving}%
          </span>
        </div>
        <input
          type="range" min={1} max={40} step={1} value={claimedSaving}
          onChange={(e) => setClaimedSaving(Number(e.target.value))}
          style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }}
        />
      </div>

      <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.textDim, marginBottom: 20, textAlign: "center" }}>
        Based on 12V 14A HHO system {"\u00b7"} 30 L/h diesel consumption
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{
          background: COLORS.bg, borderRadius: 8, padding: 16, textAlign: "center",
          border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
            Each gram of H{"\u2082"} must save
          </div>
          <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 700, color: COLORS.accent }}>
            {litresPerGramH2.toFixed(1)}
          </div>
          <div style={{ fontFamily: mono, fontSize: 12, color: COLORS.textMuted }}>litres of diesel per hour</div>
        </div>
        <div style={{
          background: COLORS.bg, borderRadius: 8, padding: 16, textAlign: "center",
          border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
            Required catalytic effect
          </div>
          <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 700, color: COLORS.red }}>
            {catalyticMultiplier.toFixed(0)}x
          </div>
          <div style={{ fontFamily: mono, fontSize: 12, color: COLORS.textMuted }}>energy amplification</div>
        </div>
      </div>

      {/* Comparison ladder */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          How does that compare to real catalysis?
        </span>
        <div style={{ marginTop: 12 }}>
          {comparisons.map((item, i) => {
            const maxMult = Math.max(catalyticMultiplier, 50);
            const w = Math.min(100, (Math.log10(Math.max(1, item.mult)) / Math.log10(maxMult)) * 100);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 12 }}>
                <div style={{
                  fontFamily: mono, fontSize: 10, color: COLORS.textMuted,
                  width: 160, textAlign: "right", flexShrink: 0, lineHeight: 1.3,
                }}>
                  {item.label}
                </div>
                <div style={{ flex: 1, position: "relative", height: 28 }}>
                  <div style={{
                    width: `${Math.max(3, w)}%`, height: "100%",
                    background: `linear-gradient(90deg, ${item.color}44, ${item.color})`,
                    borderRadius: 4, transition: "width 0.5s ease",
                    display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
                  }}>
                    <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                      {item.mult.toFixed(0)}x
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verdict */}
      <div style={{
        padding: "14px 16px", borderRadius: 6,
        background: `${absurdity.color}10`, border: `1px solid ${absurdity.color}30`,
      }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: absurdity.color, textTransform: "uppercase", marginBottom: 4 }}>
          Assessment
        </div>
        <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>
          For a 12V 14A HHO system to deliver <span style={{ color: COLORS.accent, fontWeight: 700 }}>{claimedSaving}%</span> fuel
          savings, each of the {h2GramsPerHour.toFixed(1)} grams of hydrogen produced per hour would need to catalyse the
          improved combustion of {litresPerGramH2.toFixed(1)} litres of diesel — an energy amplification
          of <span style={{ color: COLORS.red, fontWeight: 700 }}>{catalyticMultiplier.toFixed(0)}x</span>.{" "}
          <span style={{ color: absurdity.color }}>{absurdity.text}.</span>
        </div>
      </div>
    </div>
  );
}

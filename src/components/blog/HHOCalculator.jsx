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
  purple: "#a855f7",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

const Slider = ({ label, value, onChange, min, max, step = 1, unit = "", format }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
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

export default function HHOCalculator() {
  const [voltage, setVoltage] = useState(12);
  const [amps, setAmps] = useState(14);
  const [dieselLph, setDieselLph] = useState(30);

  const systemWatts = voltage * amps;
  const systemKwh = systemWatts / 1000;
  const h2GramsPerHour = (systemKwh / 50) * 1000;
  const h2EnergyKwh = (h2GramsPerHour / 1000) * 33.33;
  const dieselEnergyKwh = dieselLph * 10;
  const ratio = dieselEnergyKwh / h2EnergyKwh;
  const pctContribution = (h2EnergyKwh / dieselEnergyKwh) * 100;
  const dieselKwhForElectricity = systemKwh / 0.43 / 0.65;
  const netReturn = h2EnergyKwh / dieselKwhForElectricity * 100;

  return (
    <div style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, padding: 24, margin: "32px 0",
    }}>
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 6 }}>
          HHO System Energy Calculator
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Plug in a hydrogen generator's published specs. See what percentage of the engine's energy it actually contributes, and how much diesel it costs to produce.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Slider label="System Voltage" value={voltage} onChange={setVoltage} min={12} max={24} step={12} unit="V" />
        <Slider label="System Current" value={amps} onChange={setAmps} min={4} max={30} step={1} unit="A" />
        <Slider label="Diesel Flow Rate" value={dieselLph} onChange={setDieselLph} min={10} max={60} step={5} unit=" L/h" />
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { value: systemWatts.toFixed(0), unit: "W", label: "System Draw", color: COLORS.blue },
          { value: h2GramsPerHour.toFixed(1), unit: "g/h", label: "H\u2082 Produced", color: COLORS.purple },
          { value: pctContribution.toFixed(3), unit: "%", label: "Energy Contribution", color: COLORS.red },
          { value: `${ratio.toFixed(0)}:1`, unit: "", label: "Diesel : H\u2082 Ratio", color: COLORS.accent },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {s.value}
              <span style={{ fontSize: 14, color: COLORS.textMuted, marginLeft: 4 }}>{s.unit}</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Visual ratio bar */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Energy contribution to scale: Diesel vs HHO hydrogen
        </span>
        <div style={{
          marginTop: 8, display: "flex", height: 44, borderRadius: 6,
          overflow: "hidden", border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{
            flex: 1,
            background: `linear-gradient(90deg, ${COLORS.textDim}22, ${COLORS.textDim}44)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: mono, fontSize: 12, color: COLORS.text }}>
              Diesel: {dieselEnergyKwh.toFixed(0)} kWh/h
            </span>
          </div>
          <div style={{
            width: Math.max(2, (pctContribution / 100) * 600),
            background: COLORS.accent,
            boxShadow: `0 0 8px ${COLORS.accent}`,
          }} />
        </div>
        <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, marginTop: 6, textAlign: "right" }}>
          {"\u2190"} The orange sliver is the hydrogen. {pctContribution.toFixed(3)}% of total energy.
        </div>
      </div>

      {/* Net energy balance */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
        padding: 16, background: COLORS.bg, borderRadius: 6, marginBottom: 16,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 }}>
            Electricity consumed
          </div>
          <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: COLORS.blue }}>
            {(systemKwh * 1000).toFixed(0)} Wh
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 }}>
            H{"\u2082"} energy produced
          </div>
          <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: COLORS.purple }}>
            {(h2EnergyKwh * 1000).toFixed(0)} Wh
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 }}>
            Net balance
          </div>
          <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: COLORS.red }}>
            -{((systemKwh - h2EnergyKwh) * 1000).toFixed(0)} Wh
          </div>
        </div>
      </div>

      <div style={{
        fontFamily: sans, fontSize: 13, color: COLORS.textDim,
        padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5,
      }}>
        At {voltage}V {amps}A, the system consumes {((systemKwh / h2EnergyKwh - 1) * 100).toFixed(0)}% more electricity
        than the hydrogen contains. Accounting for alternator and engine efficiency, the diesel
        energy cost to run this system is {(dieselKwhForElectricity * 1000).toFixed(0)} Wh — returning
        only {(h2EnergyKwh * 1000).toFixed(0)} Wh as hydrogen. That's {netReturn.toFixed(1)} pence
        back on every pound.
      </div>
    </div>
  );
}

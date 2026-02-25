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
  yellow: "#eab308",
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

const Stat = ({ value, unit, label, color = COLORS.accent }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
      {value}
      <span style={{ fontSize: 14, color: COLORS.textMuted, marginLeft: 4 }}>{unit}</span>
    </div>
    <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </div>
  </div>
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

export default function N2OSurchargeCalc() {
  const [fuelRate, setFuelRate] = useState(30);
  const [n2oRate, setN2oRate] = useState(0.93);
  const [coldPct, setColdPct] = useState(20);

  const fuelKgPerHr = fuelRate * 0.84;
  const n2oGramsPerHr = fuelKgPerHr * n2oRate;

  const coldMultiplier = 4;
  const weightedN2oPerHr = n2oGramsPerHr * (1 + (coldPct / 100) * (coldMultiplier - 1));

  const n2oCO2ePerHr = weightedN2oPerHr * 273;
  const tailpipeCO2PerHr = fuelRate * 2.64 * 1000;
  const surcharge = (n2oCO2ePerHr / tailpipeCO2PerHr) * 100;

  const annualHours = 2000;
  const annualN2oCO2e = (n2oCO2ePerHr * annualHours) / 1e6;

  return (
    <Card>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          The Invisible N2O Surcharge
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          SCR aftertreatment produces nitrous oxide as a side reaction. At 273x the warming of CO2, even small quantities add a measurable surcharge to the fleet's climate impact that nobody reports.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Slider label="Diesel consumption" value={fuelRate} onChange={setFuelRate} min={15} max={50} unit=" L/hr" />
        <Slider label="N2O emission rate" value={n2oRate} onChange={setN2oRate} min={0.2} max={2.5} step={0.01} unit=" g/kg fuel" />
        <Slider label="Time below 250°C" value={coldPct} onChange={setColdPct} min={0} max={60} unit="%" />
      </div>

      <div style={{ background: COLORS.bg, borderRadius: 6, padding: 16, marginBottom: 20, fontFamily: mono, fontSize: 12, lineHeight: 2 }}>
        <div style={{ color: COLORS.textMuted, marginBottom: 8 }}>WORKED CALCULATION (per hour)</div>
        <div style={{ color: COLORS.text }}>
          Fuel mass: {fuelRate} L/hr &times; 0.84 kg/L = <span style={{ color: COLORS.text }}>{fuelKgPerHr.toFixed(1)} kg/hr</span>
        </div>
        <div style={{ color: COLORS.text }}>
          Base N2O: {fuelKgPerHr.toFixed(1)} kg &times; {n2oRate} g/kg = {n2oGramsPerHr.toFixed(1)} g/hr
        </div>
        {coldPct > 0 && (
          <div style={{ color: COLORS.text }}>
            Cold-weighted: +{coldPct}% time below 250°C &times; {coldMultiplier}x rate = <span style={{ color: COLORS.red }}>{weightedN2oPerHr.toFixed(1)} g N2O/hr</span>
          </div>
        )}
        <div style={{ color: COLORS.text }}>
          N2O warming: {weightedN2oPerHr.toFixed(1)}g &times; 273 GWP = <span style={{ color: COLORS.red }}>{(n2oCO2ePerHr / 1000).toFixed(1)} kgCO2e/hr</span>
        </div>
        <div style={{ color: COLORS.text }}>
          Tailpipe CO2: {fuelRate} L &times; 2.64 kg/L = <span style={{ color: COLORS.blue }}>{(tailpipeCO2PerHr / 1000).toFixed(1)} kgCO2/hr</span>
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 8, paddingTop: 8 }}>
          <span style={{ color: COLORS.red, fontWeight: 700 }}>N2O surcharge: {surcharge.toFixed(1)}%</span>
          <span style={{ color: COLORS.textMuted }}> of tailpipe CO2, invisible to fleet reporting</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 8 }}>
        <Stat value={surcharge.toFixed(1)} unit="%" label="Climate impact surcharge" color={COLORS.red} />
        <Stat value={(n2oCO2ePerHr / 1000).toFixed(1)} unit="kgCO2e/hr" label="N2O warming per hour" color={COLORS.accent} />
        <Stat value={annualN2oCO2e.toFixed(1)} unit="t CO2e/yr" label="Per truck annually" color={COLORS.yellow} />
      </div>

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <Label>Climate impact composition (per hour)</Label>
        <div style={{ display: "flex", height: 32, borderRadius: 4, overflow: "hidden", marginTop: 8, border: `1px solid ${COLORS.border}` }}>
          <div style={{
            width: `${(100 / (100 + surcharge)) * 100}%`, height: "100%",
            background: `linear-gradient(90deg, ${COLORS.blue}44, ${COLORS.blue})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: "#fff" }}>CO2: {(tailpipeCO2PerHr / 1000).toFixed(0)} kg</span>
          </div>
          <div style={{
            width: `${(surcharge / (100 + surcharge)) * 100}%`, height: "100%",
            background: `linear-gradient(90deg, ${COLORS.red}88, ${COLORS.red})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            minWidth: surcharge > 2 ? 60 : 4,
          }}>
            {surcharge > 3 && (
              <span style={{ fontFamily: mono, fontSize: 10, color: "#fff" }}>N2O</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.blue }} />
            <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted }}>Tailpipe CO2 (reported)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.red }} />
            <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted }}>N2O warming (unreported)</span>
          </div>
        </div>
      </div>

      <Insight warn={surcharge > 10}>
        {coldPct > 30
          ? `Urban distribution fleets with ${coldPct}% of operating time below SCR light-off see an N2O surcharge of ${surcharge.toFixed(1)}% on top of their reported CO2. That's ${annualN2oCO2e.toFixed(1)} tonnes of invisible CO2-equivalent per truck per year. The fleet's sustainability report doesn't have a row for it.`
          : `At highway cruise with ${coldPct}% cold operation, the N2O surcharge is ${surcharge.toFixed(1)}%. Small, but at 273x the warming potential of CO2, it's not zero. Urban fleets with frequent cold starts see this climb significantly. Increase the cold operation slider to see the effect.`
        }
      </Insight>
    </Card>
  );
}

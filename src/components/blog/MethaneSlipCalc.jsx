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

const Slider = ({ label, value, onChange, min, max, step = 1, unit = "", format }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <Label>{label}</Label>
      <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.accent }}>
        {format ? format(value) : value}{unit}
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

export default function MethaneSlipCalc() {
  const [slipRate, setSlipRate] = useState(2.0);
  const [upstreamLeak, setUpstreamLeak] = useState(1.8);
  const [gwpTime, setGwpTime] = useState(100);

  const gwpCH4 = gwpTime === 100 ? 29.8 : 82.5;

  const ngPer100km = 28;
  const ngPerKm = ngPer100km / 100;

  const dieselWTW = 900;
  const cngTailpipeCO2 = 660;

  const slipPerKm = ngPerKm * (slipRate / 100) * 1000;
  const slipCO2ePerKm = slipPerKm * gwpCH4;

  const upstreamCH4PerKm = ngPerKm * (upstreamLeak / 100) * 1000;
  const upstreamCO2ePerKm = upstreamCH4PerKm * gwpCH4;

  const otherUpstream = 55;

  const cngWTW = cngTailpipeCO2 + slipCO2ePerKm + upstreamCO2ePerKm + otherUpstream;
  const saving = ((dieselWTW - cngWTW) / dieselWTW) * 100;
  const isWorse = saving < 0;

  const findBreakeven = () => {
    for (let s = 0; s <= 10; s += 0.05) {
      const slip = (ngPerKm * (s / 100) * 1000) * gwpCH4;
      const up = (ngPerKm * (upstreamLeak / 100) * 1000) * gwpCH4;
      if (cngTailpipeCO2 + slip + up + otherUpstream >= dieselWTW) return s.toFixed(1);
    }
    return ">10";
  };

  return (
    <Card>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          How Much Methane Ruins It?
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          A CNG truck emits less tailpipe CO2 than diesel. Methane slip from the engine and leakage from the supply chain can erase the advantage entirely. Find the tipping point.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[100, 20].map(t => (
          <button key={t} onClick={() => setGwpTime(t)} style={{
            fontFamily: mono, fontSize: 11, padding: "6px 12px",
            background: gwpTime === t ? COLORS.accent : COLORS.bg,
            color: gwpTime === t ? "#000" : COLORS.textMuted,
            border: `1px solid ${gwpTime === t ? COLORS.accent : COLORS.border}`,
            borderRadius: 4, cursor: "pointer",
          }}>GWP{t}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Slider label="Engine methane slip" value={slipRate} onChange={setSlipRate} min={0} max={6} step={0.1} unit="%" />
        <Slider label="Upstream supply chain leakage" value={upstreamLeak} onChange={setUpstreamLeak} min={0} max={6} step={0.1} unit="%" />
      </div>

      <div style={{ background: COLORS.bg, borderRadius: 6, padding: 16, marginBottom: 20, fontFamily: mono, fontSize: 12, lineHeight: 2 }}>
        <div style={{ color: COLORS.textMuted, marginBottom: 8 }}>WORKED CALCULATION (per km, 40t CNG truck)</div>
        <div style={{ color: COLORS.text }}>
          Fuel: {ngPerKm.toFixed(2)} kg NG/km &times; {slipRate}% slip = <span style={{ color: COLORS.accent }}>{slipPerKm.toFixed(1)}g CH4/km</span>
        </div>
        <div style={{ color: COLORS.text }}>
          Slip warming: {slipPerKm.toFixed(1)}g &times; {gwpCH4} GWP = <span style={{ color: COLORS.accent }}>{slipCO2ePerKm.toFixed(0)} gCO2e/km</span>
        </div>
        <div style={{ color: COLORS.text }}>
          Upstream: {upstreamCH4PerKm.toFixed(1)}g CH4 &times; {gwpCH4} = <span style={{ color: COLORS.yellow }}>{upstreamCO2ePerKm.toFixed(0)} gCO2e/km</span>
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 8, paddingTop: 8, color: COLORS.text }}>
          CNG total WTW: {cngTailpipeCO2} + {slipCO2ePerKm.toFixed(0)} + {upstreamCO2ePerKm.toFixed(0)} + {otherUpstream} = <span style={{ color: isWorse ? COLORS.red : COLORS.green, fontWeight: 700 }}>{cngWTW.toFixed(0)} gCO2e/km</span>
        </div>
        <div style={{ color: COLORS.textMuted }}>
          Diesel WTW: <span style={{ color: COLORS.text }}>{dieselWTW} gCO2e/km</span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        {[
          { name: "Diesel (WTW)", value: dieselWTW, color: "#737373" },
          { name: "CNG (WTW)", value: cngWTW, color: isWorse ? COLORS.red : COLORS.green },
        ].map(row => (
          <div key={row.name} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <Label>{row.name}</Label>
              <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: row.color }}>{row.value.toFixed(0)} gCO2e/km</span>
            </div>
            <div style={{ height: 24, borderRadius: 4, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
              <div style={{
                width: `${Math.min((row.value / 1200) * 100, 100)}%`, height: "100%",
                background: `linear-gradient(90deg, ${row.color}33, ${row.color})`,
                borderRadius: 3, transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 8 }}>
        <Stat
          value={saving > 0 ? `-${saving.toFixed(1)}` : `+${Math.abs(saving).toFixed(1)}`}
          unit="%"
          label={saving > 0 ? "GHG saving vs diesel" : "GHG worse than diesel"}
          color={saving > 0 ? COLORS.green : COLORS.red}
        />
        <Stat value={findBreakeven()} unit="% slip" label="Break-even point" color={COLORS.yellow} />
        <Stat value={(slipCO2ePerKm + upstreamCO2ePerKm).toFixed(0)} unit="gCO2e/km" label="Total methane penalty" color={COLORS.accent} />
      </div>

      <Insight warn={isWorse}>
        {isWorse
          ? `At ${slipRate}% engine slip and ${upstreamLeak}% upstream leakage (GWP${gwpTime}), this CNG truck produces more greenhouse gas per kilometre than the diesel it replaced. The sustainability report would show an 18% CO2 improvement. The atmosphere would see a ${Math.abs(saving).toFixed(1)}% increase in warming impact.`
          : saving < 10
            ? `At ${slipRate}% slip and ${upstreamLeak}% upstream leakage, the CNG advantage is just ${saving.toFixed(1)}%. The break-even is ${findBreakeven()}% engine slip. Any increase from cold running, low-load operation, or higher upstream leakage could flip this negative.`
            : `At these settings, CNG shows a ${saving.toFixed(1)}% WTW advantage over diesel. But the break-even is ${findBreakeven()}% engine slip. Real-world slip rates vary with load, temperature, and engine age.`
        }
      </Insight>
    </Card>
  );
}

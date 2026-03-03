import { useState, useMemo } from "react";

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
  purple: "#a855f7",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

const FUEL_DUTY_PENCE = 52.95;
const REFINING_MARGIN_PENCE = 20;
const DISTRIBUTION_PENCE = 6;
const VAT_RATE = 0.20;
const DUTY_INCREASE_PENCE = 5; // planned +5p by March 2027

function brentToPumpPence(brentUsd, extraDutyPence = 0) {
  const brentGbp = brentUsd / 1.30;
  const crudePence = (brentGbp * 100) / 159;
  const duty = FUEL_DUTY_PENCE + extraDutyPence;
  const subtotal = crudePence + REFINING_MARGIN_PENCE + DISTRIBUTION_PENCE + duty;
  return subtotal * (1 + VAT_RATE);
}

function fleetAnnualLitres(trucks, milesPerYear, mpg) {
  const gallonsPerTruck = milesPerYear / mpg;
  const litresPerTruck = gallonsPerTruck * 4.546;
  return litresPerTruck * trucks;
}

const Slider = ({ label, value, onChange, min, max, step = 1, unit = "", format }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.accent, fontWeight: 600 }}>
        {format ? format(value) : value}{unit}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }}
    />
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim }}>{min}{unit}</span>
      <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim }}>{max}{unit}</span>
    </div>
  </div>
);

export default function FleetFuelScenario() {
  const [trucks, setTrucks] = useState(30);
  const [mpg, setMpg] = useState(8.5);
  const [milesPerYear, setMilesPerYear] = useState(80000);
  const [brent, setBrent] = useState(82);

  const calc = useMemo(() => {
    const litres = fleetAnnualLitres(trucks, milesPerYear, mpg);
    const pumpPence = brentToPumpPence(brent);
    const pumpPenceWithDuty = brentToPumpPence(brent, DUTY_INCREASE_PENCE);
    const baselinePence = brentToPumpPence(73); // Feb 2026 pre-crisis

    const annualCost = litres * (pumpPence / 100);
    const baselineCost = litres * (baselinePence / 100);
    const withDutyCost = litres * (pumpPenceWithDuty / 100);

    const deltaVsBaseline = annualCost - baselineCost;
    const dutyImpact = withDutyCost - annualCost;

    // Efficiency comparison: 5% improvement at current price
    const efficiencySaving = annualCost * 0.05;

    return {
      litres,
      pumpPriceGbp: pumpPence / 100,
      annualCost,
      baselineCost,
      deltaVsBaseline,
      dutyImpact,
      efficiencySaving,
      costPerMile: (annualCost / (trucks * milesPerYear)) * 100, // pence per mile
    };
  }, [trucks, mpg, milesPerYear, brent]);

  const scenarios = [
    { label: "Pre-crisis", brent: 73, color: COLORS.textMuted },
    { label: "Current", brent: 82, color: COLORS.accent },
    { label: "Escalation", brent: 100, color: COLORS.yellow },
    { label: "Hormuz closure", brent: 120, color: COLORS.red },
  ];

  const scenarioData = scenarios.map(s => {
    const pence = brentToPumpPence(s.brent);
    const cost = calc.litres * (pence / 100);
    return { ...s, pumpPence: pence, cost };
  });

  const maxCost = Math.max(...scenarioData.map(s => s.cost), calc.litres * brentToPumpPence(brent, DUTY_INCREASE_PENCE) / 100);

  return (
    <div style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, padding: 24, margin: "32px 0",
    }}>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          Fleet Fuel Cost Scenarios
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Your fleet. Your miles. See what crude oil scenarios actually cost — and how they compare to the planned duty increases and a 5% efficiency improvement.
        </p>
      </div>

      {/* Input sliders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Slider label="Fleet size" value={trucks} onChange={setTrucks} min={1} max={200} step={1} unit=" trucks" />
        <Slider label="Fuel economy" value={mpg} onChange={setMpg} min={6} max={12} step={0.5} unit=" mpg" />
        <Slider label="Miles/truck/year" value={milesPerYear} onChange={setMilesPerYear} min={40000} max={150000} step={5000} unit="" />
        <Slider label="Brent crude" value={brent} onChange={setBrent} min={40} max={140} step={1} unit="" format={(v) => `$${v}/bbl`} />
      </div>

      {/* Main cost readout */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24,
      }}>
        {[
          {
            value: `£${(calc.annualCost / 1000).toFixed(0)}k`,
            label: `Annual fleet fuel at $${brent}/bbl`,
            color: COLORS.text,
          },
          {
            value: `${calc.deltaVsBaseline >= 0 ? "+" : ""}£${(Math.abs(calc.deltaVsBaseline) / 1000).toFixed(0)}k`,
            label: "vs pre-crisis ($73)",
            color: calc.deltaVsBaseline >= 0 ? COLORS.red : COLORS.green,
          },
          {
            value: `${calc.costPerMile.toFixed(1)}p`,
            label: "Fuel cost per mile",
            color: COLORS.accent,
          },
        ].map((stat, i) => (
          <div key={i} style={{
            background: COLORS.bg, border: `1px solid ${COLORS.border}`,
            borderRadius: 6, padding: 14, textAlign: "center",
          }}>
            <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Scenario comparison bars */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          Crude price scenarios
        </div>
        {scenarioData.map((s) => {
          const widthPct = (s.cost / maxCost) * 100;
          const isActive = s.brent === brent;
          return (
            <div key={s.label} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <div style={{ width: 130, fontFamily: mono, fontSize: 11, color: isActive ? COLORS.text : COLORS.textMuted, textAlign: "right", paddingRight: 12, flexShrink: 0 }}>
                {s.label} (${s.brent})
              </div>
              <div style={{ flex: 1, position: "relative", height: 28 }}>
                <div style={{
                  height: "100%", width: `${widthPct}%`, maxWidth: "100%",
                  background: s.color, opacity: isActive ? 0.8 : 0.35,
                  borderRadius: 4, transition: "width 0.2s ease, opacity 0.2s ease",
                  border: isActive ? `1px solid ${s.color}` : "none",
                }} />
                <span style={{
                  position: "absolute", left: `${Math.min(widthPct, 85)}%`,
                  top: "50%", transform: "translate(8px, -50%)",
                  fontFamily: mono, fontSize: 12, fontWeight: 600,
                  color: isActive ? COLORS.text : COLORS.textMuted,
                }}>
                  £{(s.cost / 1000).toFixed(0)}k  ({(s.pumpPence / 100).toFixed(2)}/L)
                </span>
              </div>
            </div>
          );
        })}

        {/* Duty increase row */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 4, paddingTop: 8, borderTop: `1px dashed ${COLORS.border}` }}>
          <div style={{ width: 130, fontFamily: mono, fontSize: 11, color: COLORS.red, textAlign: "right", paddingRight: 12, flexShrink: 0 }}>
            + duty rises (${brent})
          </div>
          <div style={{ flex: 1, position: "relative", height: 28 }}>
            <div style={{
              height: "100%",
              width: `${((calc.litres * brentToPumpPence(brent, DUTY_INCREASE_PENCE) / 100) / maxCost) * 100}%`,
              maxWidth: "100%",
              background: COLORS.red, opacity: 0.5,
              borderRadius: 4, transition: "width 0.2s ease",
              border: `1px dashed ${COLORS.red}`,
            }} />
            <span style={{
              position: "absolute",
              left: `${Math.min(((calc.litres * brentToPumpPence(brent, DUTY_INCREASE_PENCE) / 100) / maxCost) * 100, 85)}%`,
              top: "50%", transform: "translate(8px, -50%)",
              fontFamily: mono, fontSize: 12, fontWeight: 600, color: COLORS.red,
            }}>
              £{((calc.litres * brentToPumpPence(brent, DUTY_INCREASE_PENCE) / 100) / 1000).toFixed(0)}k
            </span>
          </div>
        </div>
      </div>

      {/* The punchline comparison */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
        padding: 16, background: COLORS.bg, borderRadius: 6, marginBottom: 16,
        border: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 6 }}>
            War premium (Hormuz)
          </div>
          <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: COLORS.red }}>
            +£{((calc.litres * (brentToPumpPence(82) - brentToPumpPence(73)) / 100) / 1000).toFixed(0)}k
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim, marginTop: 4 }}>
            $73 → $82/bbl
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 6 }}>
            Planned duty increases
          </div>
          <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: COLORS.red }}>
            +£{((calc.dutyImpact) / 1000).toFixed(0)}k
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim, marginTop: 4 }}>
            +5p/L by Mar 2027
          </div>
        </div>
        <div style={{ textAlign: "center", borderLeft: `1px solid ${COLORS.border}`, paddingLeft: 12 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.green, textTransform: "uppercase", marginBottom: 6 }}>
            5% efficiency gain
          </div>
          <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: COLORS.green }}>
            −£{((calc.efficiencySaving) / 1000).toFixed(0)}k
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim, marginTop: 4 }}>
            Under your control
          </div>
        </div>
      </div>

      <div style={{
        fontFamily: sans, fontSize: 13, color: COLORS.textDim,
        padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.6,
      }}>
        {trucks} trucks × {milesPerYear.toLocaleString()} mi/yr × {mpg} mpg = {(calc.litres / 1000).toFixed(0)}k litres/yr.
        {" "}A 5% efficiency improvement saves £{(calc.efficiencySaving / 1000).toFixed(0)}k — more than the
        current war premium and the planned duty increases combined. You can't control OPEC. You can control your fleet's mpg.
      </div>
    </div>
  );
}

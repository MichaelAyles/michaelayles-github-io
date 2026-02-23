import { useState, useMemo } from "react";

const COLORS = {
  bg: "#0a0a0a",
  surface: "#141414",
  border: "#262626",
  text: "#e5e5e5",
  textMuted: "#737373",
  textDim: "#525252",
  accent: "#f97316",
  green: "#22c55e",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'DM Sans', 'Helvetica Neue', sans-serif";

export default function FleetFuelCalculator() {
  const [trucks, setTrucks] = useState(30);
  const [mpg, setMpg] = useState(8.5);
  const [milesPerYear, setMilesPerYear] = useState(80000);
  const [pricePerLitre, setPricePerLitre] = useState(1.15);
  const [savingPct, setSavingPct] = useState(1);

  const calc = useMemo(() => {
    const gallonsPerTruck = milesPerYear / mpg;
    const litresPerTruck = gallonsPerTruck * 4.546;
    const costPerTruck = litresPerTruck * pricePerLitre;
    const fleetCost = costPerTruck * trucks;
    const saving = fleetCost * (savingPct / 100);
    const co2PerTruck = litresPerTruck * 2.64 / 1000; // tonnes
    const co2Saving = co2PerTruck * trucks * (savingPct / 100);
    return {
      litresPerTruck: Math.round(litresPerTruck).toLocaleString(),
      costPerTruck: Math.round(costPerTruck).toLocaleString(),
      fleetCost: Math.round(fleetCost).toLocaleString(),
      saving: Math.round(saving).toLocaleString(),
      co2Saving: co2Saving.toFixed(0),
    };
  }, [trucks, mpg, milesPerYear, pricePerLitre, savingPct]);

  const SliderRow = ({ label, value, onChange, min, max, step, unit }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ fontFamily: mono, fontSize: 14, color: COLORS.accent, fontWeight: 600 }}>{typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim }}>{min}{unit}</span>
        <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim }}>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: 24,
      margin: "32px 0",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <SliderRow label="Fleet size" value={trucks} onChange={setTrucks} min={1} max={200} step={1} unit=" trucks" />
        <SliderRow label="Fuel economy" value={mpg} onChange={setMpg} min={6} max={12} step={0.5} unit=" mpg" />
        <SliderRow label="Miles per truck/year" value={milesPerYear} onChange={setMilesPerYear} min={40000} max={150000} step={5000} unit="" />
        <SliderRow label="Efficiency gain" value={savingPct} onChange={setSavingPct} min={0.5} max={15} step={0.5} unit="%" />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 16,
      }}>
        {[
          { value: `£${calc.fleetCost}`, label: "Annual fleet fuel cost" },
          { value: `£${calc.saving}`, label: `Annual saving at ${savingPct}%`, color: COLORS.green },
          { value: `${calc.co2Saving} t`, label: "CO₂ saved (tonnes)", color: COLORS.green },
        ].map((stat, i) => (
          <div key={i} style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            padding: 16,
            textAlign: "center",
          }}>
            <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: stat.color || COLORS.text, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: sans, fontSize: 12, color: COLORS.textDim, marginTop: 12, lineHeight: 1.5 }}>
        Diesel at £{pricePerLitre.toFixed(2)}/L. Each truck burns ~{calc.litresPerTruck} L/yr (£{calc.costPerTruck}). CO₂ at 2.64 kg/L diesel.
      </div>
    </div>
  );
}

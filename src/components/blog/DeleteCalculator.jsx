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
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

const Slider = ({ label, value, onChange, min, max, step = 1, unit = "", format }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.accent }}>{format ? format(value) : value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }} />
  </div>
);

export default function DeleteCalculator() {
  const [years, setYears] = useState(5);
  const [annualMiles, setAnnualMiles] = useState(80000);

  const dpfCleanCost = Math.floor(annualMiles / 300000 * 400 * years);
  const adblueCost = years * 1500;
  const sensorReplacement = years * 300;
  const regenFuelPenalty = years * 250;
  const legalTotal = dpfCleanCost + adblueCost + sensorReplacement + regenFuelPenalty;

  const remapCost = 800;
  const fineRisk = 0.15 * years * 2500;
  const insuranceVoid = 0.05 * years * 15000;
  const resaleLoss = 5000;
  const motFailCost = years * 0.3 * 500;
  const engineWear = years * 400;
  const deleteTotal = remapCost + fineRisk + insuranceVoid + resaleLoss + motFailCost + engineWear;

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 24 }}>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          The Delete Decision: Expected Cost
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Compare the real cost of maintaining a legal aftertreatment system against the expected cost of deletion, including probability-weighted fines, insurance risks, and accelerated wear.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Slider label="Time Period" value={years} onChange={setYears} min={1} max={10} unit=" years" />
        <Slider label="Annual Miles" value={annualMiles} onChange={setAnnualMiles} min={20000} max={150000} step={10000} format={(v) => (v / 1000).toFixed(0) + "k"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: COLORS.bg, borderRadius: 8, padding: 16, border: `1px solid ${COLORS.green}33` }}>
          <div style={{ fontFamily: mono, fontSize: 12, color: COLORS.green, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>
            Keep it legal
          </div>
          {[
            { label: "DPF cleaning", cost: dpfCleanCost },
            { label: "AdBlue", cost: adblueCost },
            { label: "Sensor replacements", cost: sensorReplacement },
            { label: "Regen fuel penalty", cost: regenFuelPenalty },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: sans, fontSize: 12, color: COLORS.textMuted }}>{item.label}</span>
              <span style={{ fontFamily: mono, fontSize: 12, color: COLORS.text }}>{"\u00A3"}{item.cost.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.green, fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: mono, fontSize: 18, color: COLORS.green, fontWeight: 700 }}>{"\u00A3"}{legalTotal.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ background: COLORS.bg, borderRadius: 8, padding: 16, border: `1px solid ${COLORS.red}33` }}>
          <div style={{ fontFamily: mono, fontSize: 12, color: COLORS.red, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>
            Delete it
          </div>
          {[
            { label: "Remap/delete service", cost: remapCost, note: null },
            { label: "Expected fines", cost: Math.round(fineRisk), note: "15%/yr chance" },
            { label: "Insurance void risk", cost: Math.round(insuranceVoid), note: "5%/yr of claim" },
            { label: "Resale value loss", cost: resaleLoss, note: null },
            { label: "MOT failure costs", cost: Math.round(motFailCost), note: "30%/yr chance" },
            { label: "Accelerated wear", cost: engineWear, note: "turbo, pistons" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: sans, fontSize: 12, color: COLORS.textMuted }}>
                {item.label}
                {item.note && <span style={{ fontFamily: mono, fontSize: 9, color: COLORS.textDim, marginLeft: 4 }}>({item.note})</span>}
              </span>
              <span style={{ fontFamily: mono, fontSize: 12, color: COLORS.text }}>{"\u00A3"}{item.cost.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.red, fontWeight: 700 }}>Expected total</span>
            <span style={{ fontFamily: mono, fontSize: 18, color: COLORS.red, fontWeight: 700 }}>{"\u00A3"}{Math.round(deleteTotal).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim, marginTop: 8, textAlign: "center" }}>
        * Expected value = probability x cost. Actual outcomes are binary: you either get caught or you don't.
      </div>

      <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.textDim, marginTop: 12, padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5 }}>
        Over {years} years, keeping the aftertreatment legal costs roughly {"\u00A3"}{legalTotal.toLocaleString()}.
        The expected cost of deletion is {"\u00A3"}{Math.round(deleteTotal).toLocaleString()}.
        {deleteTotal > legalTotal
          ? ` That's \u00A3${Math.round(deleteTotal - legalTotal).toLocaleString()} more expensive in expectation, before accounting for the environmental harm or the criminal record.`
          : " The numbers are close, but the delete carries tail risk: a single insurance claim denial could cost tens of thousands."}
      </div>
    </div>
  );
}

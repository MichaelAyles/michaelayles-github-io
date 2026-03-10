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
  purple: "#a855f7",
  yellow: "#eab308",
  cyan: "#06b6d4",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

const FUEL_DUTY = 52.95; // pence, frozen since 2011
const REFINING_MARGIN = 22; // pence per litre (elevated post-2022, further widened by Hormuz)
const DISTRIBUTION_MARGIN = 6; // pence per litre
const VAT_RATE = 0.20;

// Approximate crude cost in pence per litre from $/bbl
// A barrel is 159 litres. Yield losses are captured in the refining margin.
// At $90/bbl ≈ 42p/L crude component.
function crudeToLitrePence(brentUsd, exchangeRate = 1.345) {
  const brentGbp = brentUsd / exchangeRate;
  return (brentGbp * 100) / 159;
}

function buildStack(brentUsd) {
  const crude = crudeToLitrePence(brentUsd);
  const preDutyTotal = crude + REFINING_MARGIN + DISTRIBUTION_MARGIN;
  const subtotal = preDutyTotal + FUEL_DUTY;
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;
  return {
    crude,
    refining: REFINING_MARGIN,
    distribution: DISTRIBUTION_MARGIN,
    duty: FUEL_DUTY,
    vat,
    total,
  };
}

const Slider = ({ label, value, onChange, min, max, step = 1, unit = "", format }) => (
  <div style={{ marginBottom: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontFamily: mono, fontSize: 14, color: COLORS.accent, fontWeight: 700 }}>
        {format ? format(value) : value}{unit}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }}
    />
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim }}>${min}/bbl</span>
      <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim }}>${max}/bbl</span>
    </div>
  </div>
);

export default function DieselPriceWaterfall() {
  const [brent, setBrent] = useState(90);
  const [showDutyIncrease, setShowDutyIncrease] = useState(false);

  const stack = useMemo(() => buildStack(brent), [brent]);
  const baselineStack = useMemo(() => buildStack(73), []); // pre-crisis baseline
  const peak2022Stack = useMemo(() => {
    // 2022 had elevated refining margin too, simulate with ~25p crack spread
    const s = buildStack(123);
    const extraRefining = 13; // additional crack spread in 2022
    const newSubtotal = s.crude + REFINING_MARGIN + extraRefining + DISTRIBUTION_MARGIN + FUEL_DUTY;
    const newVat = newSubtotal * VAT_RATE;
    return { ...s, refining: REFINING_MARGIN + extraRefining, vat: newVat, total: newSubtotal + newVat };
  }, []);

  const dutyIncrease = showDutyIncrease ? 5 : 0; // 5p total by March 2027

  const layers = [
    { key: "crude", label: "Crude oil", color: "#b45309", value: stack.crude },
    { key: "refining", label: "Refining margin", color: COLORS.yellow, value: stack.refining },
    { key: "distribution", label: "Distribution & retail", color: COLORS.blue, value: stack.distribution },
    { key: "duty", label: "Fuel duty", color: COLORS.red, value: stack.duty + dutyIncrease },
    { key: "vat", label: "VAT (20%)", color: COLORS.purple, value: (stack.crude + stack.refining + stack.distribution + stack.duty + dutyIncrease) * VAT_RATE },
  ];

  const totalWithDuty = layers.reduce((s, l) => s + l.value, 0);
  const maxPrice = 220; // pence, scale reference
  const barWidth = 340;
  const barHeight = 32;

  const crudeChangePct = ((brent - 73) / 73 * 100).toFixed(1);
  const pumpChangePct = ((totalWithDuty - baselineStack.total) / baselineStack.total * 100).toFixed(1);

  return (
    <div style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, padding: 24, margin: "32px 0",
    }}>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          Anatomy of a Litre of Diesel
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Drag the Brent crude slider. Watch how little the pump price moves. The fixed tax layers absorb the shock.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Slider
          label="Brent Crude"
          value={brent}
          onChange={setBrent}
          min={40}
          max={140}
          step={1}
          format={(v) => `$${v}`}
          unit="/bbl"
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setShowDutyIncrease(!showDutyIncrease)}
          style={{
            fontFamily: mono, fontSize: 11, padding: "6px 12px",
            background: showDutyIncrease ? COLORS.red + "22" : COLORS.bg,
            color: showDutyIncrease ? COLORS.red : COLORS.textMuted,
            border: `1px solid ${showDutyIncrease ? COLORS.red + "66" : COLORS.border}`,
            borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
          }}
        >
          {showDutyIncrease ? "✓ " : ""}Show planned duty increases (+5p by Mar 2027)
        </button>
      </div>

      {/* Stacked horizontal bar */}
      <div style={{ marginBottom: 24 }}>
        {layers.map((layer) => {
          const widthPct = (layer.value / maxPrice) * 100;
          return (
            <div key={layer.key} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <div style={{ width: 140, fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textAlign: "right", paddingRight: 12, flexShrink: 0 }}>
                {layer.label}
              </div>
              <div style={{ flex: 1, position: "relative", height: barHeight }}>
                <div style={{
                  height: "100%",
                  width: `${widthPct}%`,
                  maxWidth: "100%",
                  background: layer.color,
                  opacity: layer.key === "crude" ? 0.9 : 0.6,
                  borderRadius: 4,
                  transition: "width 0.2s ease",
                }} />
                <span style={{
                  position: "absolute", left: `min(${widthPct}%, calc(100% - 40px))`,
                  top: "50%", transform: "translate(8px, -50%)",
                  fontFamily: mono, fontSize: 13, fontWeight: 700,
                  color: layer.color,
                  textShadow: `0 0 8px ${COLORS.surface}`,
                }}>
                  {layer.value.toFixed(1)}p
                </span>
              </div>
            </div>
          );
        })}

        {/* Total bar */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ width: 140, fontFamily: mono, fontSize: 12, color: COLORS.text, textAlign: "right", paddingRight: 12, fontWeight: 700, flexShrink: 0 }}>
            Pump price
          </div>
          <div style={{ flex: 1, position: "relative", height: barHeight + 4 }}>
            <div style={{
              height: "100%",
              width: `${(totalWithDuty / maxPrice) * 100}%`,
              maxWidth: "100%",
              background: `linear-gradient(90deg, #b45309, ${COLORS.yellow}, ${COLORS.blue}, ${COLORS.red}, ${COLORS.purple})`,
              opacity: 0.75,
              borderRadius: 4,
              transition: "width 0.2s ease",
            }} />
            <span style={{
              position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
              fontFamily: mono, fontSize: 20, fontWeight: 700,
              color: COLORS.text, paddingLeft: 12,
            }}>
              £{(totalWithDuty / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* The punchline: crude change vs pump change */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20,
      }}>
        <div style={{ background: COLORS.bg, borderRadius: 6, padding: 14, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 6 }}>
            Crude vs Feb baseline
          </div>
          <div style={{
            fontFamily: mono, fontSize: 22, fontWeight: 700,
            color: Number(crudeChangePct) > 0 ? COLORS.red : COLORS.green,
          }}>
            {Number(crudeChangePct) > 0 ? "+" : ""}{crudeChangePct}%
          </div>
        </div>
        <div style={{ background: COLORS.bg, borderRadius: 6, padding: 14, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 6 }}>
            Pump price change
          </div>
          <div style={{
            fontFamily: mono, fontSize: 22, fontWeight: 700,
            color: Number(pumpChangePct) > 0 ? COLORS.red : COLORS.green,
          }}>
            {Number(pumpChangePct) > 0 ? "+" : ""}{pumpChangePct}%
          </div>
        </div>
        <div style={{ background: COLORS.bg, borderRadius: 6, padding: 14, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 6 }}>
            Tax share of pump price
          </div>
          <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: COLORS.accent }}>
            {(((stack.duty + dutyIncrease + layers[4].value) / totalWithDuty) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Reference points */}
      <div style={{
        fontFamily: sans, fontSize: 13, color: COLORS.textDim,
        padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.6,
      }}>
        <span style={{ fontFamily: mono, fontWeight: 700, color: COLORS.textMuted }}>Reference points: </span>
        Pre-crisis (Feb 2026, $73) → £{(baselineStack.total / 100).toFixed(2)}/L.
        {" "}Current (~$90) → £{(buildStack(90).total / 100).toFixed(2)}/L.
        {" "}Mar 9 intraday peak ($119.50) → £{(buildStack(119.5).total / 100).toFixed(2)}/L.
        {" "}June 2022 peak ($123 + extreme crack spread) → ~£1.99/L.
        {" "}Fuel duty has been 52.95p since March 2011.
      </div>
    </div>
  );
}

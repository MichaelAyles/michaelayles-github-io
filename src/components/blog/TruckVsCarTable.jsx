import { useState } from "react";

const COLORS = {
  bg: "var(--background)",
  surface: "var(--surface)",
  border: "var(--border)",
  text: "var(--text-primary)",
  textMuted: "var(--text-secondary)",
  textDim: "var(--text-dim)",
  accent: "#f97316",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

const rows = [
  { label: "Gross weight", car: "1,500 kg", truck: "44,000 kg", note: "29× heavier", highlight: true },
  { label: "Motorway speed limit", car: "70 mph", truck: "56 mph", note: "EU limiter (90 km/h)" },
  { label: "Fuel consumption (cruise)", car: "~45 mpg", truck: "~8.5 mpg", note: "5× more per mile" },
  { label: "Fuel burn rate at cruise", car: "~3 L/hr", truck: "~30 L/hr", note: "10× the flow rate", highlight: true },
  { label: "Stopping distance (from limit)", car: "~73 m", truck: "~150+ m", note: "Incl. thinking time" },
  { label: "Annual fuel consumption", car: "~1,300 L", truck: "~43,000 L", note: "33× more", highlight: true },
  { label: "Annual fuel cost", car: "~£1,500", truck: "~£50,000", note: "" },
  { label: "Annual CO₂", car: "~3.4 t", truck: "~113 t", note: "But carries 29t of freight" },
];

export default function TruckVsCarTable() {
  const [revealed, setRevealed] = useState(true);

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: 24,
      margin: "32px 0",
      overflowX: "auto",
    }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: mono,
        fontSize: 13,
      }}>
        <thead>
          <tr>
            <th style={{
              textAlign: "left",
              padding: "10px 12px",
              borderBottom: `2px solid ${COLORS.border}`,
              color: COLORS.textMuted,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 500,
            }}></th>
            <th style={{
              textAlign: "right",
              padding: "10px 12px",
              borderBottom: `2px solid ${COLORS.border}`,
              color: COLORS.textMuted,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 500,
            }}>Family car</th>
            <th style={{
              textAlign: "right",
              padding: "10px 12px",
              borderBottom: `2px solid ${COLORS.border}`,
              color: COLORS.accent,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 500,
            }}>44t Artic</th>
            <th style={{
              textAlign: "left",
              padding: "10px 12px",
              borderBottom: `2px solid ${COLORS.border}`,
              color: COLORS.textDim,
              fontSize: 11,
              fontWeight: 400,
            }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{
              background: row.highlight ? `${COLORS.accent}08` : "transparent",
              transition: "background 0.15s",
            }}>
              <td style={{
                padding: "10px 12px",
                borderBottom: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                fontFamily: sans,
                fontSize: 13,
              }}>{row.label}</td>
              <td style={{
                padding: "10px 12px",
                borderBottom: `1px solid ${COLORS.border}`,
                color: COLORS.textMuted,
                textAlign: "right",
              }}>{row.car}</td>
              <td style={{
                padding: "10px 12px",
                borderBottom: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                textAlign: "right",
                fontWeight: 600,
              }}>{row.truck}</td>
              <td style={{
                padding: "10px 12px",
                borderBottom: `1px solid ${COLORS.border}`,
                color: COLORS.textDim,
                fontSize: 11,
                fontFamily: sans,
              }}>{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{
        fontFamily: sans,
        fontSize: 12,
        color: COLORS.textDim,
        marginTop: 12,
        lineHeight: 1.5,
      }}>
        Car: typical mid-size hatchback, 12,000 mi/yr. Truck: 6-axle artic, 80,000 mi/yr. Diesel at £1.15/L (ex-VAT bulk fleet price). CO₂ at 2.64 kg/L.
      </div>
    </div>
  );
}

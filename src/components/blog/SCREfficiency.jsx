import { useState } from "react";
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend } from "recharts";

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

export default function SCREfficiency() {
  const [showDOCEffect, setShowDOCEffect] = useState(true);

  const generateCurveData = () => {
    const data = [];
    for (let t = 100; t <= 550; t += 10) {
      const standard = Math.min(99, Math.max(0, 100 / (1 + Math.exp(-0.025 * (t - 280)))));
      const fast = Math.min(99, Math.max(0, 100 / (1 + Math.exp(-0.035 * (t - 220)))));
      const slow = Math.min(80, Math.max(0, 80 / (1 + Math.exp(-0.02 * (t - 350)))));

      const noDOC = standard * 0.85 + fast * 0.10 + slow * 0.05;
      const withDOC = standard * 0.45 + fast * 0.45 + slow * 0.10;

      data.push({
        temp: t,
        standard: Math.round(standard * 10) / 10,
        fast: Math.round(fast * 10) / 10,
        slow: Math.round(slow * 10) / 10,
        combined: Math.round((showDOCEffect ? withDOC : noDOC) * 10) / 10,
      });
    }
    return data;
  };

  const data = generateCurveData();

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 24 }}>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          SCR NOx Conversion Efficiency
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Three reaction pathways compete inside the SCR catalyst. The DOC upstream shifts the balance towards the faster reaction by converting NO to NO2.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => setShowDOCEffect(true)}
          style={{
            fontFamily: mono, fontSize: 11, padding: "8px 16px",
            background: showDOCEffect ? COLORS.accent : COLORS.bg,
            color: showDOCEffect ? "#000" : COLORS.textMuted,
            border: `1px solid ${showDOCEffect ? COLORS.accent : COLORS.border}`,
            borderRadius: 6, cursor: "pointer",
          }}
        >
          With DOC (NO2:NOx ~ 0.45)
        </button>
        <button
          onClick={() => setShowDOCEffect(false)}
          style={{
            fontFamily: mono, fontSize: 11, padding: "8px 16px",
            background: !showDOCEffect ? COLORS.accent : COLORS.bg,
            color: !showDOCEffect ? "#000" : COLORS.textMuted,
            border: `1px solid ${!showDOCEffect ? COLORS.accent : COLORS.border}`,
            borderRadius: 6, cursor: "pointer",
          }}
        >
          Without DOC (NO2:NOx ~ 0.10)
        </button>
      </div>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 40, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
            <XAxis
              dataKey="temp"
              tick={{ fill: "var(--text-secondary)", fontFamily: mono, fontSize: 10 }}
              label={{ value: "Catalyst Temperature (\u00B0C)", position: "bottom", offset: 20, fill: "var(--text-secondary)", fontFamily: mono, fontSize: 11 }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "var(--text-secondary)", fontFamily: mono, fontSize: 10 }}
              label={{ value: "NOx Conversion (%)", angle: -90, position: "insideLeft", offset: -35, fill: "var(--text-secondary)", fontFamily: mono, fontSize: 11 }}
            />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload?.length) return null;
                return (
                  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 10 }}>
                    <div style={{ fontFamily: mono, fontSize: 12, color: COLORS.text, marginBottom: 6 }}>{label}\u00B0C</div>
                    {payload.map((p) => (
                      <div key={p.dataKey} style={{ fontFamily: mono, fontSize: 11, color: p.color, marginBottom: 2 }}>
                        {p.name}: {p.value}%
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="standard" name="Standard SCR" stroke={COLORS.blue} strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
            <Line type="monotone" dataKey="fast" name="Fast SCR" stroke={COLORS.green} strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
            <Line type="monotone" dataKey="slow" name="Slow SCR" stroke={COLORS.red} strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
            <Line type="monotone" dataKey="combined" name={showDOCEffect ? "Combined (with DOC)" : "Combined (no DOC)"} stroke={COLORS.accent} strokeWidth={3} dot={false} />
            <ReferenceLine y={95} stroke={COLORS.green} strokeDasharray="3 3" label={{ value: "95% target", position: "right", fill: COLORS.green, fontFamily: mono, fontSize: 9 }} />
            <Legend wrapperStyle={{ fontFamily: mono, fontSize: 10 }} iconType="line" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.textDim, marginTop: 8, padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5 }}>
        {showDOCEffect
          ? "With the DOC converting NO to NO2, the fast SCR pathway dominates at lower temperatures. The combined efficiency reaches 95% by roughly 270\u00B0C. The DOC's most important job isn't removing CO \u2014 it's enabling low-temperature NOx conversion downstream."
          : "Without DOC NO-to-NO2 conversion, the SCR relies on the slower standard reaction. The 95% target isn't reached until roughly 350\u00B0C. Cold starts and urban driving suffer significantly. This is why the DOC must be first in the chain."}
      </div>
    </div>
  );
}

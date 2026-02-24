import { useState, useMemo } from "react";
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea, Legend } from "recharts";

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

const ZONES = [
  { y1: 0, y2: 200, fill: "#3b82f6", opacity: 0.1, label: "SCR inactive" },
  { y1: 200, y2: 250, fill: "#60a5fa", opacity: 0.12, label: "SCR light-off" },
  { y1: 250, y2: 450, fill: "#22c55e", opacity: 0.1, label: "SCR optimal" },
  { y1: 450, y2: 550, fill: "#eab308", opacity: 0.1, label: "DPF passive regen" },
  { y1: 550, y2: 650, fill: "#f97316", opacity: 0.1, label: "DPF active regen" },
  { y1: 650, y2: 750, fill: "#ef4444", opacity: 0.1, label: "Danger zone" },
];

function generateCycle(waypoints, duration) {
  const data = [];
  for (let t = 0; t <= duration; t += 0.5) {
    let i = 0;
    while (i < waypoints.length - 1 && waypoints[i + 1][0] <= t) i++;
    const [t0, v0] = waypoints[i];
    const [t1, v1] = waypoints[Math.min(i + 1, waypoints.length - 1)];
    const frac = t1 > t0 ? (t - t0) / (t1 - t0) : 0;
    const smooth = frac * frac * (3 - 2 * frac);
    const base = v0 + (v1 - v0) * smooth;

    const noise = Math.sin(t * 0.73) * 8 + Math.sin(t * 1.37) * 5 + Math.sin(t * 2.41) * 3;
    const engineOut = Math.round(Math.max(60, base + noise));

    const docActive = engineOut > 170;
    const postDOC = Math.round(Math.max(60, engineOut + (docActive ? 8 + Math.sin(t * 0.5) * 4 : 0)));

    const dpfDrop = 25 + Math.abs(Math.sin(t * 0.3)) * 15 + (engineOut > 350 ? 15 : 0);
    const preSCR = Math.round(Math.max(50, postDOC - dpfDrop));

    data.push({ time: t, engineOut, postDOC, preSCR });
  }
  return data;
}

const CYCLES = {
  mixed: {
    label: "Mixed route",
    duration: 60,
    waypoints: [
      [0, 80], [2, 120], [5, 200],
      [8, 260], [10, 240], [12, 280], [14, 250],
      [18, 340], [22, 380], [25, 400], [28, 410],
      [30, 440], [33, 480], [36, 510], [38, 490],
      [40, 380], [43, 320], [46, 280], [49, 260],
      [52, 220], [55, 190], [58, 170], [60, 160],
    ],
    insight: "The mixed route shows the full challenge: the system spends its first 5 minutes essentially offline (below 200\u00B0C), operates efficiently on the highway, then loses temperature again in urban running. Only the highway and hill-climb segments keep the SCR in its optimal window. Urban delivery trucks may never reach the green zone during an entire shift.",
  },
  highway: {
    label: "Highway cruise",
    duration: 40,
    waypoints: [
      [0, 200], [3, 280], [6, 350], [10, 385],
      [15, 395], [20, 390], [25, 400], [30, 385],
      [35, 395], [40, 390],
    ],
    insight: "Highway cruise is the aftertreatment\u2019s happy place. Within 10 minutes the SCR reaches optimal temperature and stays there. Passive DPF regeneration occurs continuously. NOx conversion exceeds 95%. This is what the system was designed for \u2014 and what the type-approval test cycle mostly represents.",
  },
  urban: {
    label: "Urban delivery",
    duration: 60,
    waypoints: [
      [0, 80], [3, 140], [6, 190], [8, 210],
      [10, 230], [12, 200], [14, 240], [16, 210],
      [18, 250], [20, 220], [22, 190], [24, 230],
      [26, 260], [28, 220], [30, 180], [32, 210],
      [34, 250], [36, 230], [38, 200], [40, 240],
      [42, 210], [44, 180], [46, 220], [48, 250],
      [50, 210], [52, 190], [54, 230], [56, 200],
      [58, 180], [60, 170],
    ],
    insight: "Urban delivery is the worst case. Temperatures hover around the SCR light-off zone, dipping in and out of effectiveness. The DPF gets no passive regeneration, so soot accumulates until the ECU triggers a fuel-burning active regen. NOx conversion averages 40\u201360% instead of 95%+. This is why Euro 7\u2019s cold-start sub-limit is the most consequential change: it forces manufacturers to solve this exact problem.",
  },
};

export default function EGTOperatingMap() {
  const [cycle, setCycle] = useState("mixed");

  const data = useMemo(
    () => generateCycle(CYCLES[cycle].waypoints, CYCLES[cycle].duration),
    [cycle]
  );

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 24 }}>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          EGT Operating Map
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Exhaust gas temperatures across a drive cycle. The coloured bands show what each temperature range means for the aftertreatment.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(CYCLES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setCycle(key)}
            style={{
              fontFamily: mono, fontSize: 11, padding: "8px 16px",
              background: cycle === key ? COLORS.accent : COLORS.bg,
              color: cycle === key ? "#000" : COLORS.textMuted,
              border: `1px solid ${cycle === key ? COLORS.accent : COLORS.border}`,
              borderRadius: 6, cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {ZONES.map((zone) => (
          <div key={zone.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: zone.fill, opacity: 0.7 }} />
            <span style={{ fontFamily: mono, fontSize: 9, color: COLORS.textDim }}>{zone.label}</span>
          </div>
        ))}
      </div>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 40, left: 50 }}>
            {ZONES.map((zone) => (
              <ReferenceArea
                key={zone.label}
                y1={zone.y1}
                y2={zone.y2}
                fill={zone.fill}
                fillOpacity={zone.opacity}
              />
            ))}
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
            <XAxis
              dataKey="time"
              type="number"
              domain={[0, CYCLES[cycle].duration]}
              tick={{ fill: "var(--text-secondary)", fontFamily: mono, fontSize: 10 }}
              label={{ value: "Time (minutes)", position: "bottom", offset: 20, fill: "var(--text-secondary)", fontFamily: mono, fontSize: 11 }}
            />
            <YAxis
              domain={[0, 700]}
              ticks={[0, 100, 200, 300, 400, 500, 600, 700]}
              tick={{ fill: "var(--text-secondary)", fontFamily: mono, fontSize: 10 }}
              label={{ value: "Temperature (\u00B0C)", angle: -90, position: "insideLeft", offset: -35, fill: "var(--text-secondary)", fontFamily: mono, fontSize: 11 }}
            />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload?.length) return null;
                return (
                  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 10 }}>
                    <div style={{ fontFamily: mono, fontSize: 12, color: COLORS.text, marginBottom: 6 }}>{label} min</div>
                    {payload.map((p) => (
                      <div key={p.dataKey} style={{ fontFamily: mono, fontSize: 11, color: p.color, marginBottom: 2 }}>
                        {p.name}: {p.value}\u00B0C
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="engineOut" name="Engine-out" stroke={COLORS.red} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="postDOC" name="Post-DOC" stroke={COLORS.accent} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="preSCR" name="Pre-SCR" stroke={COLORS.blue} strokeWidth={2} dot={false} />
            <Legend wrapperStyle={{ fontFamily: mono, fontSize: 10 }} iconType="line" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.textDim, marginTop: 8, padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5 }}>
        {CYCLES[cycle].insight}
      </div>
    </div>
  );
}

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

// Simplified historical data: monthly Brent ($/bbl) and UK diesel (p/L)
// Representative data points for key periods
const historicalData = [
  // Pre-COVID 2019
  { date: "2019-01", brent: 60, diesel: 131, label: null },
  { date: "2019-06", brent: 65, diesel: 133, label: null },
  { date: "2019-12", brent: 66, diesel: 131, label: null },
  // COVID crash
  { date: "2020-01", brent: 64, diesel: 130, label: null },
  { date: "2020-03", brent: 33, diesel: 124, label: null },
  { date: "2020-04", brent: 18, diesel: 113, label: "COVID crash" },
  { date: "2020-06", brent: 41, diesel: 112, label: null },
  { date: "2020-09", brent: 42, diesel: 114, label: null },
  { date: "2020-12", brent: 50, diesel: 118, label: null },
  // Recovery
  { date: "2021-03", brent: 65, diesel: 126, label: null },
  { date: "2021-06", brent: 75, diesel: 133, label: null },
  { date: "2021-09", brent: 75, diesel: 136, label: null },
  { date: "2021-12", brent: 74, diesel: 149, label: null },
  // Ukraine invasion
  { date: "2022-01", brent: 88, diesel: 151, label: null },
  { date: "2022-02", brent: 97, diesel: 155, label: "Ukraine invasion" },
  { date: "2022-03", brent: 118, diesel: 179, label: null },
  { date: "2022-05", brent: 113, diesel: 186, label: null },
  { date: "2022-06", brent: 123, diesel: 199, label: "Peak: £1.99" },
  { date: "2022-08", brent: 100, diesel: 188, label: null },
  { date: "2022-10", brent: 93, diesel: 181, label: null },
  { date: "2022-12", brent: 81, diesel: 175, label: null },
  // Slow decline
  { date: "2023-03", brent: 79, diesel: 162, label: null },
  { date: "2023-06", brent: 75, diesel: 148, label: null },
  { date: "2023-09", brent: 94, diesel: 156, label: null },
  { date: "2023-12", brent: 78, diesel: 152, label: null },
  // 2024
  { date: "2024-03", brent: 83, diesel: 153, label: null },
  { date: "2024-06", brent: 82, diesel: 150, label: null },
  { date: "2024-09", brent: 73, diesel: 145, label: null },
  { date: "2024-12", brent: 74, diesel: 144, label: null },
  // 2025-2026
  { date: "2025-03", brent: 72, diesel: 142, label: null },
  { date: "2025-06", brent: 68, diesel: 140, label: null },
  { date: "2025-09", brent: 70, diesel: 139, label: null },
  { date: "2025-12", brent: 74, diesel: 143, label: null },
  { date: "2026-01", brent: 73, diesel: 136, label: null },
  { date: "2026-02", brent: 73, diesel: 138, label: null },
  { date: "2026-03-03", brent: 82, diesel: 142, label: null },
  { date: "2026-03-09", brent: 99, diesel: 153, label: "Peak: $119.50 intraday" },
  { date: "2026-03-10", brent: 90, diesel: 153, label: "Hormuz crisis" },
];

const events = [
  {
    key: "covid",
    label: "COVID crash (2020)",
    description: "Crude collapsed 72% in 10 weeks. Diesel fell just 13% — then took 5 months to bottom out.",
    startIdx: 3,
    endIdx: 9,
    rocketDays: "10 weeks down",
    featherDays: "5 months to bottom",
  },
  {
    key: "ukraine",
    label: "Ukraine invasion (2022)",
    description: "Crude surged 60% in 8 weeks. Diesel followed within days. Crude fell back to $80 by December. Diesel was still 175p — 18% above where it started.",
    startIdx: 12,
    endIdx: 21,
    rocketDays: "8 weeks to peak",
    featherDays: "10+ months to normalise",
  },
  {
    key: "hormuz",
    label: "Hormuz crisis (2026)",
    description: "Israel struck 30 Iranian oil depots. Brent hit $119.50 intraday on Mar 9, then crashed 15% in hours after a false US Navy report. Diesel at the pump moved from 138p to 153p and hasn't come back down. The crude round-tripped. The pump price didn't. Classic rockets and feathers, compressed into 48 hours.",
    startIdx: 33,
    endIdx: 37,
    rocketDays: "Hours",
    featherDays: "TBD",
  },
];

export default function RocketsAndFeathers() {
  const [selectedEvent, setSelectedEvent] = useState("ukraine");

  const event = events.find(e => e.key === selectedEvent);

  const viewData = useMemo(() => {
    if (!event) return historicalData;
    // Show slightly wider context around the event
    const start = Math.max(0, event.startIdx - 2);
    const end = Math.min(historicalData.length - 1, event.endIdx + 2);
    return historicalData.slice(start, end + 1);
  }, [event]);

  // Chart dimensions
  const W = 700, H = 300;
  const padL = 50, padR = 20, padT = 20, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const brentMin = Math.min(...viewData.map(d => d.brent)) * 0.85;
  const brentMax = Math.max(...viewData.map(d => d.brent)) * 1.1;
  const dieselMin = Math.min(...viewData.map(d => d.diesel)) * 0.95;
  const dieselMax = Math.max(...viewData.map(d => d.diesel)) * 1.05;

  const xScale = (i) => padL + (i / (viewData.length - 1)) * chartW;
  const brentY = (v) => padT + chartH - ((v - brentMin) / (brentMax - brentMin)) * chartH;
  const dieselY = (v) => padT + chartH - ((v - dieselMin) / (dieselMax - dieselMin)) * chartH;

  const brentPath = viewData.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${brentY(d.brent)}`).join(" ");
  const dieselPath = viewData.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${dieselY(d.diesel)}`).join(" ");

  // Compute asymmetry stats for the selected event
  const eventSlice = event ? historicalData.slice(event.startIdx, event.endIdx + 1) : [];
  const brentPeak = eventSlice.length ? Math.max(...eventSlice.map(d => d.brent)) : 0;
  const brentTrough = eventSlice.length ? Math.min(...eventSlice.map(d => d.brent)) : 0;
  const dieselPeak = eventSlice.length ? Math.max(...eventSlice.map(d => d.diesel)) : 0;
  const dieselTrough = eventSlice.length ? Math.min(...eventSlice.map(d => d.diesel)) : 0;
  const brentSwing = brentPeak > 0 ? (((brentPeak - brentTrough) / brentTrough) * 100).toFixed(0) : 0;
  const dieselSwing = dieselPeak > 0 ? (((dieselPeak - dieselTrough) / dieselTrough) * 100).toFixed(0) : 0;

  return (
    <div style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, padding: 24, margin: "32px 0",
    }}>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          Rockets and Feathers
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Fuel prices rocket up on bad news and float down like feathers when it passes. Click an event to see the asymmetry.
        </p>
      </div>

      {/* Event selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {events.map(e => (
          <button
            key={e.key}
            onClick={() => setSelectedEvent(e.key)}
            style={{
              fontFamily: mono, fontSize: 11, padding: "8px 14px",
              background: selectedEvent === e.key ? COLORS.accent : COLORS.bg,
              color: selectedEvent === e.key ? "#000" : COLORS.textMuted,
              border: `1px solid ${selectedEvent === e.key ? COLORS.accent : COLORS.border}`,
              borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ width: "100%", overflowX: "auto", marginBottom: 16 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", margin: "0 auto" }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(frac => (
            <line
              key={frac}
              x1={padL} y1={padT + chartH * (1 - frac)}
              x2={W - padR} y2={padT + chartH * (1 - frac)}
              stroke={COLORS.border} strokeWidth={0.5} strokeDasharray="4 4"
            />
          ))}

          {/* Brent line */}
          <path d={brentPath} fill="none" stroke={COLORS.blue} strokeWidth={2.5} strokeLinejoin="round" />
          {/* Diesel line */}
          <path d={dieselPath} fill="none" stroke={COLORS.accent} strokeWidth={2.5} strokeLinejoin="round" />

          {/* Data points */}
          {viewData.map((d, i) => (
            <g key={i}>
              <circle cx={xScale(i)} cy={brentY(d.brent)} r={3} fill={COLORS.blue} />
              <circle cx={xScale(i)} cy={dieselY(d.diesel)} r={3} fill={COLORS.accent} />
            </g>
          ))}

          {/* Labels on notable points */}
          {viewData.map((d, i) => d.label ? (
            <g key={`label-${i}`}>
              <line x1={xScale(i)} y1={padT} x2={xScale(i)} y2={padT + chartH}
                stroke={COLORS.textDim} strokeWidth={0.5} strokeDasharray="3 3" />
              <text
                x={xScale(i)} y={padT - 4}
                textAnchor={i < viewData.length / 2 ? "start" : "end"}
                fill={COLORS.textMuted} fontFamily={mono} fontSize={9}
              >
                {d.label}
              </text>
            </g>
          ) : null)}

          {/* X axis labels */}
          {viewData.filter((_, i) => i % Math.max(1, Math.floor(viewData.length / 6)) === 0 || i === viewData.length - 1).map((d, _, arr) => {
            const idx = viewData.indexOf(d);
            return (
              <text
                key={d.date}
                x={xScale(idx)} y={H - 8}
                textAnchor="middle"
                fill={COLORS.textDim} fontFamily={mono} fontSize={9}
              >
                {d.date}
              </text>
            );
          })}

          {/* Y axis labels - left (Brent) */}
          <text x={padL - 8} y={padT + 4} textAnchor="end" fill={COLORS.blue} fontFamily={mono} fontSize={9}>
            ${Math.round(brentMax)}
          </text>
          <text x={padL - 8} y={padT + chartH} textAnchor="end" fill={COLORS.blue} fontFamily={mono} fontSize={9}>
            ${Math.round(brentMin)}
          </text>

          {/* Y axis labels - right (Diesel) */}
          <text x={W - padR + 4} y={padT + 4} textAnchor="start" fill={COLORS.accent} fontFamily={mono} fontSize={9}>
            {Math.round(dieselMax)}p
          </text>
          <text x={W - padR + 4} y={padT + chartH} textAnchor="start" fill={COLORS.accent} fontFamily={mono} fontSize={9}>
            {Math.round(dieselMin)}p
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, justifyContent: "center" }}>
        {[
          { color: COLORS.blue, label: "Brent crude ($/bbl)" },
          { color: COLORS.accent, label: "UK diesel (p/L)" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 16, height: 3, borderRadius: 2, background: l.color }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Event detail card */}
      {event && (
        <div style={{
          background: COLORS.bg, border: `1px solid ${COLORS.border}`,
          borderRadius: 6, padding: 16, marginBottom: 16,
        }}>
          <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
            {event.label}
          </div>
          <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
            {event.description}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Crude swing</div>
              <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: COLORS.blue }}>{brentSwing}%</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Diesel swing</div>
              <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: COLORS.accent }}>{dieselSwing}%</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Time to peak</div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: COLORS.red }}>{event.rocketDays}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Time to recover</div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: COLORS.green }}>{event.featherDays}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{
        fontFamily: sans, fontSize: 13, color: COLORS.textDim,
        padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5,
      }}>
        Data is representative monthly averages for illustration. Actual daily prices show even sharper spikes and slower recoveries.
        The asymmetry is structural: replacement cost pricing on the way up, inventory cost pricing on the way down.
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";

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
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

const stations = [
  {
    label: "Diesel/Petrol Filling Stations",
    count: 8380,
    color: COLORS.textMuted,
    note: "Mature network, any truck can refuel anywhere",
    source: "UKPIA",
  },
  {
    label: "EV Charging Devices",
    count: 88500,
    color: COLORS.green,
    note: "Growing by ~14,000 per year. 18,000+ rapid/ultra-rapid.",
    source: "Zapmap, Jan 2026",
  },
  {
    label: "Public Hydrogen Stations",
    count: 11,
    color: COLORS.purple,
    note: "Down from ~16 peak. Several prototype stations closed.",
    source: "Various, early 2026",
  },
];

export default function InfrastructureGap() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const maxCount = Math.max(...stations.map(s => s.count));

  // For the proportional circles view
  const maxRadius = 120;
  const getRadius = (count) => Math.sqrt(count / maxCount) * maxRadius;

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: 24,
      margin: "32px 0",
    }}>
      {/* Proportional circles */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 40,
        minHeight: maxRadius * 2 + 60,
        marginBottom: 24,
        padding: "20px 0",
      }}>
        {stations.map((s) => {
          const radius = animated ? getRadius(s.count) : 0;
          return (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: Math.max(radius * 2, 6),
                height: Math.max(radius * 2, 6),
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${s.color}cc, ${s.color}44)`,
                border: `2px solid ${s.color}`,
                boxShadow: `0 0 ${Math.max(radius / 2, 4)}px ${s.color}44`,
                transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {radius > 30 && (
                  <span style={{ fontFamily: mono, fontSize: Math.max(12, radius / 4), fontWeight: 700, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                    {s.count.toLocaleString()}
                  </span>
                )}
              </div>
              <div style={{ textAlign: "center", maxWidth: 140 }}>
                {radius <= 30 && (
                  <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: s.color }}>
                    {s.count.toLocaleString()}
                  </div>
                )}
                <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, lineHeight: 1.3 }}>
                  {s.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail bars */}
      <div style={{ marginTop: 8 }}>
        {stations.map((s) => (
          <div key={s.label} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted }}>{s.label}</span>
              <span style={{ fontFamily: mono, fontSize: 11, color: s.color, fontWeight: 700 }}>{s.count.toLocaleString()}</span>
            </div>
            <div style={{ height: 8, background: COLORS.bg, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: animated ? `${Math.max(0.5, (s.count / maxCount) * 100)}%` : "0%",
                background: `linear-gradient(90deg, ${s.color}66, ${s.color})`,
                borderRadius: 4,
                transition: "width 1s ease",
              }} />
            </div>
            <div style={{ fontFamily: sans, fontSize: 11, color: COLORS.textDim, marginTop: 3 }}>
              {s.note} <span style={{ color: COLORS.textDim }}> · {s.source}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ratio callouts */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginTop: 16,
      }}>
        <div style={{
          background: COLORS.bg, borderRadius: 6, padding: 12, textAlign: "center",
          border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: COLORS.green }}>
            8,045:1
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginTop: 4 }}>
            EV chargers per hydrogen station
          </div>
        </div>
        <div style={{
          background: COLORS.bg, borderRadius: 6, padding: 12, textAlign: "center",
          border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: COLORS.accent }}>
            762:1
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginTop: 4 }}>
            Diesel stations per hydrogen station
          </div>
        </div>
      </div>

      <div style={{
        fontFamily: sans, fontSize: 13, color: COLORS.textDim, marginTop: 16,
        padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5,
      }}>
        The UK added roughly 14,000 EV charging devices in 2025 alone, more than a thousand times the total number of hydrogen stations in the country. Electric charging doesn't face a chicken-and-egg problem because the grid is already everywhere.
      </div>
    </div>
  );
}

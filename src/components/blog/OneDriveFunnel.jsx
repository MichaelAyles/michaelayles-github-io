import { useState, useEffect } from "react";

// Tracks whether the viewport is below a breakpoint. SSR-safe (defaults false).
function useIsMobile(bp = 560) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [bp]);
  return mobile;
}

// Funnel stages (millions of devs). Edit these and the chart re-derives.
const STAGES = [
  { name: "Professional devs", sub: "worldwide", value: 30 },
  { name: "On Windows", sub: "47%", value: 14, drop: "Mac / Linux" },
  { name: "OneDrive KFM on", sub: "35%", value: 4.9, drop: "No KFM" },
  { name: "Code in those folders", sub: "40%", value: 2.0, drop: "Code elsewhere" },
  { name: "Over the 300k limit", sub: "60%", value: 1.2, drop: "Under the limit", cooked: true },
];

const MONO = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const SANS = "'Inter', sans-serif";
const ACCENT = "#f97316"; // house orange
const RED = "#ef4444";
const SAFE = "#94a3b8";

const fmt = (m) => (m >= 1 ? `${m % 1 === 0 ? m : m.toFixed(1)}M` : `${Math.round(m * 1000)}k`);
const TOTAL = STAGES[0].value;

export default function OneDriveFunnel() {
  const [hover, setHover] = useState(null);
  const isMobile = useIsMobile();
  const cooked = STAGES[STAGES.length - 1].value;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: isMobile ? 16 : 24, margin: "32px 0" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: isMobile ? 6 : 10, flexWrap: "wrap", marginBottom: isMobile ? 14 : 18 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-secondary)", letterSpacing: 0.3 }}>FUNNEL</span>
        <span style={{ fontFamily: MONO, fontSize: isMobile ? 20 : 22, fontWeight: 700, color: RED }}>~{fmt(cooked)}</span>
        <span style={{ fontFamily: SANS, fontSize: isMobile ? 13 : 14, color: "var(--text-primary)" }}>devs over the 300k limit, silently not backed up</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-dim)" }}>0.3M to 3M range</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 14 }}>
        {STAGES.map((s, i) => {
          const pct = (s.value / TOTAL) * 100;
          const prev = i === 0 ? null : STAGES[i - 1];
          const dropped = prev ? prev.value - s.value : 0;
          const isHover = hover === i;

          const labelBlock = (
            <div style={{ textAlign: isMobile ? "left" : "right", minWidth: 0 }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, lineHeight: 1.2,
                color: s.cooked ? RED : "var(--text-primary)" }}>{s.name}</div>
              {s.sub && <div style={{ fontFamily: MONO, fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{s.sub}{i > 0 ? " kept" : ""}</div>}
            </div>
          );

          const bar = (
            <div style={{ flex: 1, height: isMobile ? 26 : 30, borderRadius: 5, background: "var(--background)",
              border: "1px solid var(--border)", overflow: "hidden", position: "relative" }}>
              <div style={{ width: `${Math.max(pct, 1.5)}%`, height: "100%",
                background: s.cooked ? RED : ACCENT,
                opacity: hover === null || isHover ? 0.92 : 0.6,
                transition: "width .5s ease, opacity .15s ease",
                borderRadius: "4px 0 0 4px" }} />
            </div>
          );

          const value = (
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, whiteSpace: "nowrap",
              color: s.cooked ? RED : "var(--text-primary)", width: 48, textAlign: "right" }}>{fmt(s.value)}</div>
          );

          const drop = (
            <div style={{ fontFamily: MONO, fontSize: 10, color: SAFE, whiteSpace: "nowrap",
              opacity: dropped > 0 ? 1 : 0 }}>
              {dropped > 0 ? `−${fmt(dropped)} ${s.drop}` : ""}
            </div>
          );

          // Mobile: stack label over a full-width bar row, drop note sits under the label.
          if (isMobile) {
            return (
              <div key={s.name}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  {labelBlock}
                  {drop}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {bar}
                  {value}
                </div>
              </div>
            );
          }

          // Desktop: label | bar value drop on one row.
          return (
            <div key={s.name}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{ display: "grid", gridTemplateColumns: "minmax(120px, 168px) 1fr", gap: 14, alignItems: "center" }}>
              {labelBlock}
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                {bar}
                {value}
                <div style={{ width: 150 }}>{drop}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontFamily: SANS, fontSize: 12, color: "var(--text-dim)", marginTop: 18, lineHeight: 1.5 }}>
        Each bar is the share of the 30M starting pool still in the trap; the grey figure is who peels off safe at that step.
        Fractions are Fermi guesses with wide error bars but a solid direction. Mac and Linux OneDrive users hit the same
        300k trap, just at lower default adoption rates.
      </div>
    </div>
  );
}

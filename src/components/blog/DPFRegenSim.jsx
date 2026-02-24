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
  yellow: "#eab308",
  blue: "#3b82f6",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

const Stat = ({ value, unit, label, color = COLORS.accent }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
      {value}
      <span style={{ fontSize: 14, color: COLORS.textMuted, marginLeft: 4 }}>{unit}</span>
    </div>
    <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </div>
  </div>
);

export default function DPFRegenSim() {
  const [sootLoad, setSootLoad] = useState(30);
  const [mode, setMode] = useState("accumulating");

  useEffect(() => {
    const interval = setInterval(() => {
      setSootLoad((prev) => {
        if (mode === "accumulating") {
          const newLoad = prev + 0.3;
          if (newLoad >= 100) { setMode("limp"); return 100; }
          return Math.min(100, newLoad);
        }
        if (mode === "passive") {
          return Math.max(5, prev - 0.15);
        }
        if (mode === "active") {
          const newLoad = prev - 1.5;
          if (newLoad <= 5) { setMode("accumulating"); return 5; }
          return Math.max(5, newLoad);
        }
        return prev;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [mode]);

  const sootColor = sootLoad < 40 ? COLORS.green : sootLoad < 70 ? COLORS.yellow : sootLoad < 90 ? COLORS.accent : COLORS.red;
  const activeRegenTemp = mode === "active" ? 590 : mode === "passive" ? 380 : 250;

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 24 }}>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          DPF Regeneration Simulator
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Watch soot accumulate, then trigger regeneration. Passive regen works slowly at highway temps. Active regen burns soot fast but costs fuel. Let it fill up and the truck enters limp mode.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "accumulating", label: "City Driving (soot accumulates)", color: COLORS.red },
          { key: "passive", label: "Highway (passive regen)", color: COLORS.yellow },
          { key: "active", label: "Active Regen (550\u00B0C+)", color: COLORS.accent },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setMode(btn.key)}
            style={{
              fontFamily: mono, fontSize: 11, padding: "8px 14px",
              background: mode === btn.key ? btn.color + "22" : COLORS.bg,
              color: mode === btn.key ? btn.color : COLORS.textMuted,
              border: `1px solid ${mode === btn.key ? btn.color : COLORS.border}`,
              borderRadius: 6, cursor: "pointer",
            }}
          >
            {btn.label}
          </button>
        ))}
        <button
          onClick={() => { setSootLoad(30); setMode("accumulating"); }}
          style={{
            fontFamily: mono, fontSize: 11, padding: "8px 14px",
            background: COLORS.bg, color: COLORS.textMuted,
            border: `1px solid ${COLORS.border}`, borderRadius: 6, cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Stat value={sootLoad.toFixed(0)} unit="%" label="Soot Loading" color={sootColor} />
        <Stat value={activeRegenTemp} unit={"\u00B0C"} label="DPF Temperature" color={
          activeRegenTemp < 300 ? COLORS.blue : activeRegenTemp < 450 ? COLORS.yellow : COLORS.red
        } />
        <Stat value={mode === "active" ? "2\u20134%" : "0%"} unit="" label="Fuel Penalty" color={mode === "active" ? COLORS.red : COLORS.green} />
      </div>

      {/* Soot loading bar */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          DPF Soot Loading
        </span>
        <div style={{
          marginTop: 8, height: 40, background: COLORS.bg, borderRadius: 6,
          border: `1px solid ${COLORS.border}`, overflow: "hidden", position: "relative",
        }}>
          <div style={{
            width: `${sootLoad}%`, height: "100%",
            background: `linear-gradient(90deg, ${sootColor}66, ${sootColor})`,
            borderRadius: 4, transition: "width 0.2s ease, background 0.3s ease",
          }} />
          <div style={{ position: "absolute", left: "70%", top: 0, bottom: 0, borderLeft: `1px dashed ${COLORS.yellow}`, opacity: 0.6 }} />
          <div style={{ position: "absolute", left: "90%", top: 0, bottom: 0, borderLeft: `1px dashed ${COLORS.red}`, opacity: 0.6 }} />
          <div style={{ position: "absolute", left: "70%", top: 2, fontFamily: mono, fontSize: 8, color: COLORS.yellow }}>Regen trigger</div>
          <div style={{ position: "absolute", left: "90%", top: 2, fontFamily: mono, fontSize: 8, color: COLORS.red }}>Limp mode</div>
        </div>
      </div>

      {/* DPF channel visualisation */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          DPF Channel Cross-Section
        </span>
        <div style={{
          marginTop: 8, display: "grid", gridTemplateColumns: "repeat(20, 1fr)", gap: 2,
          padding: 8, background: COLORS.bg, borderRadius: 6,
        }}>
          {Array.from({ length: 80 }).map((_, i) => {
            const isInlet = i % 2 === 0;
            const sootOpacity = isInlet ? Math.min(0.9, sootLoad / 100) : 0;
            const isGlowing = mode === "active" && isInlet && sootLoad > 10;
            return (
              <div
                key={i}
                style={{
                  aspectRatio: "1", borderRadius: 1,
                  background: isInlet
                    ? `rgba(${isGlowing ? "249,115,22" : "120,120,120"}, ${0.1 + sootOpacity * 0.8})`
                    : "rgba(100,100,100,0.07)",
                  boxShadow: isGlowing ? `0 0 4px ${COLORS.accent}66` : "none",
                  transition: "all 0.3s ease",
                }}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, background: "rgba(120,120,120,0.5)", borderRadius: 1 }} />
            <span style={{ fontFamily: mono, fontSize: 9, color: COLORS.textDim }}>Inlet channels (soot trapping)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, background: "rgba(100,100,100,0.07)", borderRadius: 1 }} />
            <span style={{ fontFamily: mono, fontSize: 9, color: COLORS.textDim }}>Outlet channels (clean gas)</span>
          </div>
        </div>
      </div>

      {mode === "limp" && (
        <div style={{
          background: COLORS.red + "22", border: `1px solid ${COLORS.red}44`,
          borderRadius: 6, padding: 16, textAlign: "center",
          fontFamily: mono, fontSize: 14, color: COLORS.red, fontWeight: 700,
        }}>
          ENGINE DERATE: DPF soot loading critical. Power reduced. Visit workshop.
        </div>
      )}

      <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.textDim, marginTop: 16, padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5 }}>
        {mode === "accumulating" && "City driving: low exhaust temperatures mean no passive regeneration. Soot accumulates steadily. If the ECU can't find a suitable window for active regen (sustained load), loading continues towards the critical threshold."}
        {mode === "passive" && "Highway driving: exhaust temperatures above 350\u00B0C allow NO2-assisted soot oxidation. Soot burns slowly and continuously. This is the preferred mode \u2014 no fuel penalty. The DPF cleans itself."}
        {mode === "active" && "Active regeneration: extra diesel is injected upstream of the DOC, generating a 550\u2013620\u00B0C exotherm. Soot burns rapidly via thermal oxidation (C + O2 \u2192 CO2). Costs 2\u20134% additional fuel during the event, typically lasting 15\u201330 minutes."}
        {mode === "limp" && "Critical soot loading. The ECU has derated the engine to prevent uncontrolled regeneration, which could crack the DPF substrate or damage downstream catalysts. Professional intervention required. This is what happens when too many short trips prevent regeneration."}
      </div>
    </div>
  );
}

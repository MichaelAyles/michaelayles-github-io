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
  blue: "#3b82f6",
  yellow: "#eab308",
  purple: "#a855f7",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

export default function AftertreatmentToggle() {
  const [egrOn, setEgrOn] = useState(true);
  const [docOn, setDocOn] = useState(true);
  const [dpfOn, setDpfOn] = useState(true);
  const [scrOn, setScrOn] = useState(true);

  const raw = { nox: 12, co: 3.5, hc: 0.8, pm: 0.08 };

  const postEGR = {
    nox: egrOn ? raw.nox * 0.40 : raw.nox,
    co: egrOn ? raw.co * 1.05 : raw.co,
    hc: egrOn ? raw.hc * 1.08 : raw.hc,
    pm: egrOn ? raw.pm * 1.80 : raw.pm,
  };

  const postDOC = {
    nox: postEGR.nox,
    co: docOn ? postEGR.co * 0.05 : postEGR.co,
    hc: docOn ? postEGR.hc * 0.10 : postEGR.hc,
    pm: postEGR.pm,
  };

  const postDPF = {
    nox: postDOC.nox,
    co: postDOC.co,
    hc: postDOC.hc,
    pm: dpfOn ? postDOC.pm * 0.01 : postDOC.pm,
  };

  const scrEfficiency = scrOn ? (docOn ? 0.96 : 0.80) : 0;
  const tailpipe = {
    nox: postDPF.nox * (1 - scrEfficiency),
    co: postDPF.co,
    hc: postDPF.hc,
    pm: postDPF.pm,
  };

  const euroVI = { nox: 0.4, co: 1.5, hc: 0.13, pm: 0.01 };

  const pollutants = [
    { key: "nox", label: "NOx", color: COLORS.green, limit: euroVI.nox, unit: "g/kWh" },
    { key: "co", label: "CO", color: COLORS.yellow, limit: euroVI.co, unit: "g/kWh" },
    { key: "hc", label: "HC", color: COLORS.blue, limit: euroVI.hc, unit: "g/kWh" },
    { key: "pm", label: "PM", color: COLORS.red, limit: euroVI.pm, unit: "g/kWh" },
  ];

  const stages = [
    { label: "Raw engine", data: raw },
    { label: "Post-EGR", data: postEGR },
    { label: "Post-DOC", data: postDOC },
    { label: "Post-DPF", data: postDPF },
    { label: "Tailpipe", data: tailpipe },
  ];

  const toggles = [
    { label: "EGR", on: egrOn, set: setEgrOn, color: COLORS.purple, desc: "Lowers combustion temp, cuts NOx" },
    { label: "DOC", on: docOn, set: setDocOn, color: COLORS.yellow, desc: "Oxidises CO + HC, enables fast SCR" },
    { label: "DPF", on: dpfOn, set: setDpfOn, color: COLORS.red, desc: "Traps 99%+ of soot particles" },
    { label: "SCR", on: scrOn, set: setScrOn, color: COLORS.green, desc: "Converts NOx to N2 + H2O" },
  ];

  const allOn = egrOn && docOn && dpfOn && scrOn;
  const allOff = !egrOn && !docOn && !dpfOn && !scrOn;

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 24 }}>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          What Does Each Component Actually Do?
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Toggle each aftertreatment stage on and off. Watch how pollutant levels change at each point in the chain. Euro VI WHSC limits shown as reference. Try turning them off one at a time.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
        {toggles.map((t) => (
          <button key={t.label} onClick={() => t.set(!t.on)}
            style={{
              fontFamily: mono, fontSize: 12, padding: "12px 8px",
              background: t.on ? t.color + "18" : COLORS.bg,
              color: t.on ? t.color : COLORS.textDim,
              border: `1px solid ${t.on ? t.color + "66" : COLORS.border}`,
              borderRadius: 6, cursor: "pointer", transition: "all 0.2s", textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{t.label}</div>
            <div style={{ fontSize: 9, opacity: 0.7 }}>{t.on ? "ON" : "OFF"}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => { setEgrOn(true); setDocOn(true); setDpfOn(true); setScrOn(true); }}
          style={{ fontFamily: mono, fontSize: 10, padding: "4px 10px", background: allOn ? COLORS.accent : COLORS.bg, color: allOn ? "#000" : COLORS.textMuted, border: `1px solid ${allOn ? COLORS.accent : COLORS.border}`, borderRadius: 4, cursor: "pointer" }}>
          All on (Euro VI)
        </button>
        <button onClick={() => { setEgrOn(false); setDocOn(false); setDpfOn(false); setScrOn(false); }}
          style={{ fontFamily: mono, fontSize: 10, padding: "4px 10px", background: allOff ? COLORS.accent : COLORS.bg, color: allOff ? "#000" : COLORS.textMuted, border: `1px solid ${allOff ? COLORS.accent : COLORS.border}`, borderRadius: 4, cursor: "pointer" }}>
          All off (uncontrolled)
        </button>
        <button onClick={() => { setEgrOn(true); setDocOn(false); setDpfOn(false); setScrOn(false); }}
          style={{ fontFamily: mono, fontSize: 10, padding: "4px 10px", background: COLORS.bg, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 4, cursor: "pointer" }}>
          EGR only (~Euro II)
        </button>
        <button onClick={() => { setEgrOn(false); setDocOn(true); setDpfOn(false); setScrOn(true); }}
          style={{ fontFamily: mono, fontSize: 10, padding: "4px 10px", background: COLORS.bg, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 4, cursor: "pointer" }}>
          SCR only (no DPF)
        </button>
      </div>

      {pollutants.map((p) => {
        const values = stages.map((s) => s.data[p.key]);
        const maxVal = Math.max(...values, p.limit * 1.2);
        const passes = tailpipe[p.key] <= p.limit;

        return (
          <div key={p.key} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: p.color, fontWeight: 700 }}>
                  {tailpipe[p.key] < 0.01 ? tailpipe[p.key].toFixed(4) : tailpipe[p.key].toFixed(2)} {p.unit}
                </span>
                <span style={{
                  fontFamily: mono, fontSize: 9, padding: "2px 6px", borderRadius: 3,
                  background: passes ? COLORS.green + "22" : COLORS.red + "22",
                  color: passes ? COLORS.green : COLORS.red,
                }}>
                  {passes ? "PASS" : "FAIL"} (limit: {p.limit})
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 3, height: 32 }}>
              {stages.map((s, i) => {
                const val = s.data[p.key];
                const barWidth = Math.max(2, (val / maxVal) * 100);
                const isReduction = i > 0 && val < stages[i - 1].data[p.key];
                const isIncrease = i > 0 && val > stages[i - 1].data[p.key];
                return (
                  <div key={s.label} style={{ flex: 1, position: "relative" }}>
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      height: `${barWidth}%`, minHeight: 2,
                      background: isReduction
                        ? `linear-gradient(180deg, ${p.color}88, ${p.color})`
                        : isIncrease
                        ? `linear-gradient(180deg, ${COLORS.red}88, ${COLORS.red})`
                        : "rgba(100,100,100,0.15)",
                      borderRadius: "3px 3px 0 0", transition: "all 0.4s ease",
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {stages.map((s) => (
                <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ fontFamily: mono, fontSize: 8, color: COLORS.textDim }}>
                    {s.data[p.key] < 0.01 ? s.data[p.key].toFixed(3) : s.data[p.key].toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 3, marginTop: 4, marginBottom: 16 }}>
        {stages.map((s, i) => (
          <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: i === stages.length - 1 ? COLORS.accent : COLORS.textDim }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.textDim, padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5 }}>
        {allOn && "With the full Euro VI aftertreatment chain active, all four pollutants are well within the WHSC steady-state limits. Turn components off one at a time to see what each one contributes."}
        {allOff && "With no emissions control, every pollutant fails the Euro VI limits by 10\u201330x. This is approximately what a pre-regulation engine looked like."}
        {!allOn && !allOff && (() => {
          const fails = pollutants.filter(p => tailpipe[p.key] > euroVI[p.key]);
          if (fails.length === 0) return "All pollutants within Euro VI limits with this configuration.";
          return `Failing on: ${fails.map(f => f.label).join(", ")}. ${!scrOn && !egrOn ? "Without both EGR and SCR, NOx is completely uncontrolled." : ""} ${!dpfOn ? "Without the DPF, soot goes straight to atmosphere." : ""} ${!docOn && scrOn ? "Without the DOC, the SCR drops from ~96% to ~80% efficiency because it loses the fast SCR pathway (no NO2)." : ""}`;
        })()}
      </div>
    </div>
  );
}

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
  yellow: "#eab308",
  purple: "#a855f7",
  cyan: "#06b6d4",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

export default function AftertreatmentFlow() {
  const [operatingMode, setOperatingMode] = useState("highway");
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((p) => (p + 1) % 100);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const modes = {
    highway: {
      label: "Highway Cruise",
      egt: { engineOut: 420, postDOC: 435, postDPF: 410, postSCR: 380 },
      pollutants: {
        engineOut: { nox: 800, co: 200, hc: 80, pm: 0.08 },
        postDOC: { nox: 800, co: 10, hc: 8, pm: 0.08 },
        postDPF: { nox: 800, co: 10, hc: 8, pm: 0.001 },
        postSCR: { nox: 32, co: 10, hc: 8, pm: 0.001 },
      },
    },
    urban: {
      label: "Urban Delivery",
      egt: { engineOut: 220, postDOC: 225, postDPF: 210, postSCR: 195 },
      pollutants: {
        engineOut: { nox: 500, co: 400, hc: 150, pm: 0.15 },
        postDOC: { nox: 500, co: 40, hc: 30, pm: 0.15 },
        postDPF: { nox: 500, co: 40, hc: 30, pm: 0.002 },
        postSCR: { nox: 100, co: 40, hc: 30, pm: 0.002 },
      },
    },
    coldStart: {
      label: "Cold Start",
      egt: { engineOut: 120, postDOC: 115, postDPF: 100, postSCR: 90 },
      pollutants: {
        engineOut: { nox: 600, co: 800, hc: 300, pm: 0.12 },
        postDOC: { nox: 600, co: 600, hc: 250, pm: 0.12 },
        postDPF: { nox: 600, co: 600, hc: 250, pm: 0.002 },
        postSCR: { nox: 480, co: 600, hc: 250, pm: 0.002 },
      },
    },
    regen: {
      label: "DPF Active Regen",
      egt: { engineOut: 380, postDOC: 580, postDPF: 600, postSCR: 520 },
      pollutants: {
        engineOut: { nox: 700, co: 150, hc: 60, pm: 0.10 },
        postDOC: { nox: 700, co: 5, hc: 3, pm: 0.10 },
        postDPF: { nox: 700, co: 5, hc: 3, pm: 0.0005 },
        postSCR: { nox: 56, co: 5, hc: 3, pm: 0.0005 },
      },
    },
  };

  const mode = modes[operatingMode];

  const components = [
    { id: "egr", label: "EGR", x: 60, color: COLORS.purple, chemistry: "Recirculates 10\u201330% of exhaust. CO2 and H2O replace O2, lowering peak combustion temp by 200\u2013300\u00B0C. Cuts NOx formation by 50\u201370%.", reaction: "Thermal suppression of Zeldovich mechanism" },
    { id: "doc", label: "DOC", x: 195, color: COLORS.yellow, chemistry: "Platinum/palladium on ceramic honeycomb. Oxidises CO and HC to CO2 + H2O. Converts NO to NO2 for downstream DPF and SCR.", reaction: "2CO + O2 \u2192 2CO2\n2NO + O2 \u2192 2NO2" },
    { id: "dpf", label: "DPF", x: 330, color: COLORS.red, chemistry: "Silicon carbide wall-flow filter. Traps >99% of soot particles. Passive regen via NO2 at 250\u2013400\u00B0C. Active regen burns soot at 550\u2013620\u00B0C.", reaction: "C + 2NO2 \u2192 CO2 + 2NO (passive)\nC + O2 \u2192 CO2 (active at 550\u00B0C+)" },
    { id: "scr", label: "SCR", x: 510, color: COLORS.green, chemistry: "Copper-zeolite catalyst. AdBlue decomposes to NH3, which reacts with NOx to form harmless N2 and H2O. >95% NOx conversion at 250\u2013450\u00B0C.", reaction: "4NH3 + 4NO + O2 \u2192 4N2 + 6H2O\n4NH3 + 2NO + 2NO2 \u2192 4N2 + 6H2O" },
    { id: "asc", label: "ASC", x: 640, color: COLORS.cyan, chemistry: "Ammonia Slip Catalyst. Oxidises any excess NH3 that passes through the SCR. Ensures tailpipe NH3 stays below 10 ppm.", reaction: "4NH3 + 3O2 \u2192 2N2 + 6H2O" },
  ];

  const tempColor = (t) => {
    if (t < 200) return COLORS.blue;
    if (t < 300) return COLORS.yellow;
    if (t < 500) return COLORS.accent;
    return COLORS.red;
  };

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 24 }}>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          The Aftertreatment Chain
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Exhaust gas flows through five stages of chemical processing. Select an operating mode to see how temperatures and pollutant concentrations change. Click any component for its chemistry.
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(modes).map(([k, v]) => (
          <button
            key={k}
            onClick={() => { setOperatingMode(k); setSelectedComponent(null); }}
            style={{
              fontFamily: mono, fontSize: 11, padding: "8px 14px",
              background: operatingMode === k ? COLORS.accent : COLORS.bg,
              color: operatingMode === k ? "#000" : COLORS.textMuted,
              border: `1px solid ${operatingMode === k ? COLORS.accent : COLORS.border}`,
              borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Flow diagram */}
      <div style={{ position: "relative", height: 200, marginBottom: 16, overflow: "hidden" }}>
        <svg width="100%" height="200" viewBox="0 0 750 200">
          <line x1="30" y1="90" x2="720" y2="90" stroke="rgba(128,128,128,0.3)" strokeWidth="24" strokeLinecap="round" />

          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const offset = ((animationPhase * 8 + i * 90) % 720);
            const opacity = offset < 50 || offset > 680 ? 0.2 : 0.6;
            return <circle key={i} cx={30 + offset} cy={90} r={3} fill="rgba(128,128,128,0.5)" opacity={opacity} />;
          })}

          <line x1="465" y1="35" x2="465" y2="75" stroke={COLORS.blue} strokeWidth="2" strokeDasharray="4 3" />
          <polygon points="461,75 465,83 469,75" fill={COLORS.blue} />
          <text x="465" y="25" textAnchor="middle" fill={COLORS.blue} fontFamily={mono} fontSize="9">AdBlue</text>

          {components.map((c) => {
            const isSelected = selectedComponent === c.id;
            return (
              <g key={c.id} onClick={() => setSelectedComponent(isSelected ? null : c.id)} style={{ cursor: "pointer" }}>
                <rect x={c.x} y={60} width={60} height={60} rx={6}
                  fill={isSelected ? c.color + "33" : "var(--background)"}
                  stroke={c.color} strokeWidth={isSelected ? 2 : 1.5} />
                <text x={c.x + 30} y={95} textAnchor="middle" fill={c.color} fontFamily={mono} fontSize="12" fontWeight="700">
                  {c.label}
                </text>
              </g>
            );
          })}

          {[
            { x: 150, t: mode.egt.engineOut, label: "Engine out" },
            { x: 270, t: mode.egt.postDOC, label: "Post-DOC" },
            { x: 430, t: mode.egt.postDPF, label: "Post-DPF" },
            { x: 600, t: mode.egt.postSCR, label: "Post-SCR" },
          ].map((tp) => (
            <g key={tp.label}>
              <text x={tp.x} y={155} textAnchor="middle" fill={tempColor(tp.t)} fontFamily={mono} fontSize="14" fontWeight="700">
                {tp.t}{"\u00B0C"}
              </text>
              <text x={tp.x} y={170} textAnchor="middle" fill="rgba(128,128,128,0.5)" fontFamily={mono} fontSize="8">
                {tp.label}
              </text>
            </g>
          ))}

          <text x="30" y="70" textAnchor="middle" fill="rgba(128,128,128,0.5)" fontFamily={mono} fontSize="8">Engine</text>
          <text x="720" y="70" textAnchor="middle" fill="rgba(128,128,128,0.5)" fontFamily={mono} fontSize="8">Tailpipe</text>
        </svg>
      </div>

      {selectedComponent && (() => {
        const comp = components.find((c) => c.id === selectedComponent);
        return (
          <div style={{ background: COLORS.bg, border: `1px solid ${comp.color}44`, borderRadius: 6, padding: 16, marginBottom: 16 }}>
            <div style={{ fontFamily: sans, fontWeight: 700, color: comp.color, marginBottom: 6 }}>{comp.label}</div>
            <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.text, lineHeight: 1.5, marginBottom: 8 }}>{comp.chemistry}</div>
            <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, background: COLORS.surface, padding: 8, borderRadius: 4, whiteSpace: "pre-line" }}>
              {comp.reaction}
            </div>
          </div>
        );
      })()}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "NOx", engineOut: mode.pollutants.engineOut.nox, tailpipe: mode.pollutants.postSCR.nox, unit: "ppm", color: COLORS.green },
          { label: "CO", engineOut: mode.pollutants.engineOut.co, tailpipe: mode.pollutants.postSCR.co, unit: "ppm", color: COLORS.yellow },
          { label: "HC", engineOut: mode.pollutants.engineOut.hc, tailpipe: mode.pollutants.postSCR.hc, unit: "ppm", color: COLORS.blue },
          { label: "PM", engineOut: mode.pollutants.engineOut.pm, tailpipe: mode.pollutants.postSCR.pm, unit: "g/kWh", color: COLORS.red },
        ].map((p) => {
          const reduction = ((1 - p.tailpipe / p.engineOut) * 100).toFixed(1);
          return (
            <div key={p.label} style={{ background: COLORS.bg, borderRadius: 6, padding: 12, textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 6 }}>{p.label}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.textDim }}>
                {p.engineOut} <span style={{ color: COLORS.textDim }}>{"\u2192"}</span> <span style={{ color: p.color, fontWeight: 700 }}>{p.tailpipe}</span>
                <span style={{ fontSize: 9, color: COLORS.textDim }}> {p.unit}</span>
              </div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: p.color, marginTop: 4 }}>
                -{reduction}%
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.textDim, marginTop: 16, padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5 }}>
        {operatingMode === "coldStart"
          ? "At cold start, the DOC and SCR are below their light-off temperatures. CO and HC pass through nearly untreated, and NOx conversion is minimal. This 10\u201315 minute window is the aftertreatment system's biggest weakness, and the primary target of Euro 7 regulation."
          : operatingMode === "regen"
          ? "During active DPF regeneration, extra diesel is injected and oxidised in the DOC, spiking temperatures to 580\u00B0C+. The DPF burns off accumulated soot. The SCR still operates but at reduced efficiency due to the elevated temperature. This costs roughly 1\u20133% of fuel during the regen event."
          : operatingMode === "urban"
          ? "Urban driving produces lower exhaust temperatures, reducing DOC and SCR efficiency. Soot accumulates in the DPF without passive regeneration. This duty cycle requires more frequent active regens and achieves lower overall NOx conversion."
          : "At highway cruise, the aftertreatment system operates in its sweet spot. The DOC is fully active, passive DPF regeneration keeps soot in check, and the SCR achieves >95% NOx conversion. This is the operating mode the system was designed around."}
      </div>
    </div>
  );
}

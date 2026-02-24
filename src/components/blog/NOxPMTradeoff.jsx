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
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

const Slider = ({ label, value, onChange, min, max, step = 1, unit = "" }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.accent }}>{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }} />
  </div>
);

export default function NOxPMTradeoff() {
  const [egrRate, setEgrRate] = useState(15);
  const [showAftertreatment, setShowAftertreatment] = useState(false);

  const baseNOx = 12;
  const basePM = 0.02;

  const nox = baseNOx * Math.exp(-0.04 * egrRate);
  const pm = basePM * (1 + 0.08 * egrRate + 0.002 * egrRate * egrRate);

  const aftertreatmentNOx = nox * 0.04;
  const aftertreatmentPM = pm * 0.01;

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 24 }}>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          The NOx/PM Tradeoff
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Increase EGR rate to reduce NOx, but watch PM rise. Toggle aftertreatment to see how the DPF and SCR break the tradeoff entirely.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Slider label="EGR Rate" value={egrRate} onChange={setEgrRate} min={0} max={40} unit="%" />
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 16 }}>
          <button
            onClick={() => setShowAftertreatment(!showAftertreatment)}
            style={{
              fontFamily: mono, fontSize: 11, padding: "8px 16px",
              background: showAftertreatment ? COLORS.green + "22" : COLORS.bg,
              color: showAftertreatment ? COLORS.green : COLORS.textMuted,
              border: `1px solid ${showAftertreatment ? COLORS.green : COLORS.border}`,
              borderRadius: 6, cursor: "pointer", width: "100%",
            }}
          >
            {showAftertreatment ? "DPF + SCR: ON" : "DPF + SCR: OFF (engine-out only)"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ textAlign: "center", padding: 16, background: COLORS.bg, borderRadius: 6 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 }}>
            {showAftertreatment ? "Tailpipe NOx" : "Engine-out NOx"}
          </div>
          <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 700, color: COLORS.green }}>
            {(showAftertreatment ? aftertreatmentNOx : nox).toFixed(2)}
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.textDim }}>g/kWh</div>
          {showAftertreatment && (
            <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.green, marginTop: 4 }}>
              Euro VI limit: 0.4 g/kWh {aftertreatmentNOx < 0.4 ? "\u2713 PASS" : "\u2717 FAIL"}
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", padding: 16, background: COLORS.bg, borderRadius: 6 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 }}>
            {showAftertreatment ? "Tailpipe PM" : "Engine-out PM"}
          </div>
          <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 700, color: COLORS.red }}>
            {(showAftertreatment ? aftertreatmentPM : pm).toFixed(showAftertreatment ? 4 : 3)}
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.textDim }}>g/kWh</div>
          {showAftertreatment && (
            <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.green, marginTop: 4 }}>
              Euro VI limit: 0.01 g/kWh {aftertreatmentPM < 0.01 ? "\u2713 PASS" : "\u2717 FAIL"}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Engine-out emissions at {egrRate}% EGR
        </span>
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 6, gap: 8 }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, width: 40 }}>NOx</span>
            <div style={{ flex: 1, height: 20, background: COLORS.bg, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${(nox / baseNOx) * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${COLORS.green}44, ${COLORS.green})`,
                borderRadius: 4,
                transition: "width 0.3s ease",
              }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, width: 70, textAlign: "right" }}>{nox.toFixed(1)} g/kWh</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, width: 40 }}>PM</span>
            <div style={{ flex: 1, height: 20, background: COLORS.bg, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${Math.min(100, (pm / 0.15) * 100)}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${COLORS.red}44, ${COLORS.red})`,
                borderRadius: 4,
                transition: "width 0.3s ease",
              }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, width: 70, textAlign: "right" }}>{pm.toFixed(3)} g/kWh</span>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.textDim, padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5 }}>
        {showAftertreatment
          ? `With the DPF and SCR active, the engine can run at ${egrRate}% EGR without worrying about the PM increase. The DPF catches 99%+ of soot regardless, and the SCR removes 96% of NOx. The aftertreatment breaks the tradeoff: the engine calibrator optimises for efficiency, not emissions.`
          : `At ${egrRate}% EGR, engine-out NOx is ${nox.toFixed(1)} g/kWh but PM has risen to ${pm.toFixed(3)} g/kWh. Without aftertreatment, you can't have both low. Toggle "DPF + SCR" to see how aftertreatment breaks this constraint.`}
      </div>
    </div>
  );
}

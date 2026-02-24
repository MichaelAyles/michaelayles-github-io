import { useState, useEffect, useRef, useMemo } from "react";
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

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

export default function EGRCombustion() {
  const [egrRate, setEgrRate] = useState(0);

  const ambientO2 = 20.9;
  const exhaustO2 = 6;
  const exhaustCO2 = 14;

  const freshAirFraction = 1 - egrRate / 100;
  const intakeO2 = ambientO2 * freshAirFraction + exhaustO2 * (egrRate / 100);
  const intakeCO2 = 0.04 * freshAirFraction + exhaustCO2 * (egrRate / 100);
  const intakeN2 = 100 - intakeO2 - intakeCO2;

  const basePeakTemp = 2200;
  const tempReduction = egrRate * 8.5 + egrRate * egrRate * 0.03;
  const peakTemp = Math.max(1400, basePeakTemp - tempReduction);

  const noxBase = 12;
  const noxFormation = noxBase * Math.exp(-0.038 * egrRate - 0.0004 * egrRate * egrRate);

  const pmBase = 0.04;
  const pmFormation = pmBase * (1 + 0.06 * egrRate + 0.003 * egrRate * egrRate);

  const curveData = useMemo(() => {
    const data = [];
    for (let egr = 0; egr <= 40; egr += 1) {
      const pTemp = Math.max(1400, basePeakTemp - egr * 8.5 - egr * egr * 0.03);
      const nox = noxBase * Math.exp(-0.038 * egr - 0.0004 * egr * egr);
      data.push({ egr, peakTemp: Math.round(pTemp), nox: Math.round(nox * 100) / 100 });
    }
    return data;
  }, []);

  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const PARTICLE_R = 2;
  const PARTICLE_N = 500;

  // Initialise canvas particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const r = PARTICLE_R;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = 150 * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = "150px";
    };
    resize();

    const w = parseFloat(canvas.style.width) || 300;
    const h = 150;
    const particles = [];
    for (let i = 0; i < PARTICLE_N; i++) {
      const speed = 0.2 + Math.random() * 0.3;
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x: r + Math.random() * (w - 2 * r),
        y: r + Math.random() * (h - 2 * r),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: "n2",
      });
    }
    particlesRef.current = particles;

    const animate = () => {
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      for (const p of particlesRef.current) {
        // Brownian nudge
        p.vx += (Math.random() - 0.5) * 0.04;
        p.vy += (Math.random() - 0.5) * 0.04;
        const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (sp > 0.7) { p.vx *= 0.7 / sp; p.vy *= 0.7 / sp; }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < r) { p.x = r; p.vx = Math.abs(p.vx); }
        if (p.x > cw - r) { p.x = cw - r; p.vx = -Math.abs(p.vx); }
        if (p.y < r) { p.y = r; p.vy = Math.abs(p.vy); }
        if (p.y > ch - r) { p.y = ch - r; p.vy = -Math.abs(p.vy); }

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);

        if (p.type === "co2") {
          ctx.shadowColor = "rgba(168,85,247,0.4)";
          ctx.shadowBlur = 6;
          ctx.fillStyle = "rgba(168,85,247,0.9)";
        } else if (p.type === "o2") {
          ctx.fillStyle = "rgba(59,130,246,0.85)";
        } else {
          ctx.fillStyle = "rgba(128,128,128,0.2)";
        }
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
    };
  }, []);

  // Reassign particle types when gas composition changes
  useEffect(() => {
    const particles = particlesRef.current;
    if (!particles.length) return;
    const total = particles.length;
    const o2Count = Math.round((intakeO2 / 100) * total);
    const co2Count = egrRate > 0 ? Math.max(1, Math.round((intakeCO2 / 100) * total)) : 0;
    const n2Count = total - o2Count - co2Count;
    const types = [];
    for (let i = 0; i < n2Count; i++) types.push("n2");
    for (let i = 0; i < o2Count; i++) types.push("o2");
    for (let i = 0; i < co2Count; i++) types.push("co2");
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    particles.forEach((p, i) => { p.type = types[i] || "n2"; });
  }, [egrRate]);

  const tempColor = peakTemp > 2000 ? COLORS.red : peakTemp > 1800 ? COLORS.accent : peakTemp > 1600 ? "#eab308" : COLORS.blue;

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 24 }}>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          Inside the Cylinder: How EGR Reduces NOx
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          EGR feeds inert exhaust gas back into the intake, displacing oxygen. Less O2 means a less intense burn. Lower peak flame temperature means exponentially less NOx. Drag the slider to see the effect.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>EGR Rate</span>
          <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.accent }}>{egrRate}%</span>
        </div>
        <input type="range" min={0} max={40} value={egrRate}
          onChange={(e) => setEgrRate(Number(e.target.value))}
          style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Gas composition */}
        <div>
          <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Cylinder charge composition
          </span>
          <div style={{ marginTop: 8, background: COLORS.bg, borderRadius: 8, padding: 12, border: `1px solid ${COLORS.border}` }}>
            <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: 150, borderRadius: 4, marginBottom: 12 }} />

            <div style={{ display: "flex", gap: 4, height: 24, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: `${intakeN2}%`, background: "rgba(128,128,128,0.2)", transition: "width 0.3s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: mono, fontSize: 9, color: COLORS.textMuted }}>N2 {intakeN2.toFixed(0)}%</span>
              </div>
              <div style={{ width: `${intakeO2}%`, background: COLORS.blue + "66", transition: "width 0.3s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: mono, fontSize: 9, color: COLORS.blue }}>{intakeO2.toFixed(1)}% O2</span>
              </div>
              <div style={{ width: `${Math.max(1, intakeCO2)}%`, background: COLORS.purple + "88", transition: "width 0.3s", display: "flex", alignItems: "center", justifyContent: "center", minWidth: intakeCO2 > 2 ? 40 : 0 }}>
                {intakeCO2 > 2 && <span style={{ fontFamily: mono, fontSize: 9, color: COLORS.purple }}>{intakeCO2.toFixed(1)}%</span>}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              {[
                { color: "rgba(128,128,128,0.3)", label: "N2 (inert)", textColor: COLORS.textDim },
                { color: COLORS.blue, label: "O2 (oxidiser)", textColor: COLORS.blue },
                { color: COLORS.purple, label: "CO2 from EGR", textColor: COLORS.purple },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                  <span style={{ fontFamily: mono, fontSize: 9, color: item.textColor }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Combustion result */}
        <div>
          <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Combustion result
          </span>
          <div style={{ marginTop: 8, background: COLORS.bg, borderRadius: 8, padding: 12, border: `1px solid ${COLORS.border}` }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted }}>Peak flame temperature</span>
                <span style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: tempColor }}>{peakTemp.toFixed(0)}{"\u00B0C"}</span>
              </div>
              <div style={{ height: 16, background: COLORS.surface, borderRadius: 8, overflow: "hidden", position: "relative" }}>
                <div style={{
                  width: `${((peakTemp - 1400) / (2200 - 1400)) * 100}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${COLORS.blue}, #eab308, ${COLORS.accent}, ${COLORS.red})`,
                  borderRadius: 8, transition: "width 0.3s ease",
                }} />
                <div style={{
                  position: "absolute", left: `${((1800 - 1400) / (2200 - 1400)) * 100}%`,
                  top: -2, bottom: -2, borderLeft: "2px dashed rgba(200,200,200,0.3)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontFamily: mono, fontSize: 8, color: COLORS.textDim }}>1400{"\u00B0C"}</span>
                <span style={{ fontFamily: mono, fontSize: 8, color: COLORS.textDim }}>NOx threshold ~1800{"\u00B0C"}</span>
                <span style={{ fontFamily: mono, fontSize: 8, color: COLORS.textDim }}>2200{"\u00B0C"}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ textAlign: "center", padding: 10, background: COLORS.surface, borderRadius: 6 }}>
                <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: COLORS.green }}>{noxFormation.toFixed(1)}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: COLORS.textMuted }}>NOx (g/kWh)</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.green, marginTop: 2 }}>
                  {egrRate > 0 ? `-${((1 - noxFormation / noxBase) * 100).toFixed(0)}%` : "baseline"}
                </div>
              </div>
              <div style={{ textAlign: "center", padding: 10, background: COLORS.surface, borderRadius: 6 }}>
                <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: COLORS.red }}>{pmFormation.toFixed(3)}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: COLORS.textMuted }}>PM (g/kWh)</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.red, marginTop: 2 }}>
                  {egrRate > 0 ? `+${(((pmFormation / pmBase) - 1) * 100).toFixed(0)}%` : "baseline"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          NOx formation vs EGR rate
        </span>
        <div style={{ width: "100%", height: 240, marginTop: 8 }}>
          <ResponsiveContainer>
            <ComposedChart data={curveData} margin={{ top: 10, right: 50, bottom: 30, left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
              <XAxis dataKey="egr"
                tick={{ fill: "var(--text-secondary)", fontFamily: mono, fontSize: 10 }}
                label={{ value: "EGR Rate (%)", position: "bottom", offset: 15, fill: "var(--text-secondary)", fontFamily: mono, fontSize: 10 }} />
              <YAxis yAxisId="nox" orientation="left"
                tick={{ fill: COLORS.green, fontFamily: mono, fontSize: 10 }}
                label={{ value: "NOx (g/kWh)", angle: -90, position: "insideLeft", offset: -35, fill: COLORS.green, fontFamily: mono, fontSize: 10 }}
                domain={[0, 14]} />
              <YAxis yAxisId="temp" orientation="right"
                tick={{ fill: COLORS.accent, fontFamily: mono, fontSize: 10 }}
                label={{ value: "Peak Temp (\u00B0C)", angle: 90, position: "insideRight", offset: -30, fill: COLORS.accent, fontFamily: mono, fontSize: 10 }}
                domain={[1400, 2300]} />
              <Tooltip content={({ payload, label }) => {
                if (!payload?.length) return null;
                return (
                  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 10 }}>
                    <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.text, marginBottom: 4 }}>{label}% EGR</div>
                    {payload.map(p => (
                      <div key={p.dataKey} style={{ fontFamily: mono, fontSize: 10, color: p.color }}>
                        {p.name}: {p.value}{p.dataKey === "peakTemp" ? "\u00B0C" : " g/kWh"}
                      </div>
                    ))}
                  </div>
                );
              }} />
              <Area yAxisId="nox" type="monotone" dataKey="nox" name="NOx" stroke={COLORS.green} fill={COLORS.green + "22"} strokeWidth={2} />
              <Line yAxisId="temp" type="monotone" dataKey="peakTemp" name="Peak Temp" stroke={COLORS.accent} strokeWidth={2} dot={false} strokeDasharray="6 3" />
              <ReferenceLine yAxisId="temp" y={1800} stroke="rgba(128,128,128,0.4)" strokeDasharray="3 3" label={{ value: "~1800\u00B0C: NOx accelerates", position: "top", fill: "var(--text-dim)", fontFamily: mono, fontSize: 8 }} />
              <ReferenceLine x={egrRate} stroke={COLORS.accent} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mechanism */}
      <div style={{ background: COLORS.bg, borderRadius: 6, padding: 16, marginBottom: 12, border: `1px solid ${COLORS.border}` }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.accent, marginBottom: 8, textTransform: "uppercase" }}>
          The mechanism (Zeldovich, 1946)
        </div>
        <div style={{ fontFamily: mono, fontSize: 12, color: COLORS.text, lineHeight: 2, marginBottom: 8 }}>
          <span style={{ color: COLORS.textDim }}>1.</span> N2 + O {"\u2192"} NO + N <span style={{ color: COLORS.textDim, fontSize: 10 }}>(rate-limiting, needs &gt;1800{"\u00B0C"})</span><br/>
          <span style={{ color: COLORS.textDim }}>2.</span> N + O2 {"\u2192"} NO + O<br/>
          <span style={{ color: COLORS.textDim }}>3.</span> N + OH {"\u2192"} NO + H
        </div>
        <div style={{ fontFamily: sans, fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5 }}>
          Reaction 1 is the bottleneck. It has an extremely high activation energy: the rate is negligible below ~1800{"\u00B0C"} but increases exponentially above it, doubling roughly every 90{"\u00B0C"}. EGR attacks this by displacing O2 with CO2 and H2O, which have higher heat capacities (37 J/mol{"\u00B7"}K vs 29 for N2). The same combustion energy heats the charge less per degree. Lower peak temperature means exponentially less NOx.
        </div>
      </div>

      <div style={{ fontFamily: sans, fontSize: 13, color: COLORS.textDim, padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5 }}>
        {egrRate === 0
          ? "At 0% EGR, the cylinder charge is normal air: 20.9% O2. Peak combustion temperature reaches ~2200\u00B0C. NOx formation is at its maximum because the Zeldovich reactions are running hard above their 1800\u00B0C threshold."
          : egrRate <= 15
          ? `At ${egrRate}% EGR, intake O2 has dropped to ${intakeO2.toFixed(1)}% and CO2 has risen to ${intakeCO2.toFixed(1)}%. Peak temperature is down to ${peakTemp.toFixed(0)}\u00B0C. NOx has fallen ${((1 - noxFormation / noxBase) * 100).toFixed(0)}%. The tradeoff: PM has increased ${(((pmFormation / pmBase) - 1) * 100).toFixed(0)}% because less O2 means less complete soot oxidation. This is why you need a DPF.`
          : `At ${egrRate}% EGR, intake O2 is down to ${intakeO2.toFixed(1)}%. Peak temperature has dropped to ${peakTemp.toFixed(0)}\u00B0C, cutting NOx by ${((1 - noxFormation / noxBase) * 100).toFixed(0)}%. But PM has risen ${(((pmFormation / pmBase) - 1) * 100).toFixed(0)}%. At this EGR rate, the engine is deliberately making more soot in exchange for less NOx, relying entirely on the DPF to catch it.`}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";

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
  yellow: "#eab308",
};

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const sans = "'Inter', sans-serif";

export default function HHOEnergyChain() {
  const [animPhase, setAnimPhase] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const hasPlayed = useRef(false);

  const steps = [
    { label: "Diesel\nBurned", energy: 1.0, eff: null, color: COLORS.accent, loss: null },
    { label: "Crankshaft\nWork", energy: 0.43, eff: "43%", color: COLORS.yellow, loss: 0.57 },
    { label: "Alternator\nOutput", energy: 0.28, eff: "65%", color: COLORS.blue, loss: 0.15 },
    { label: "Electrolysis\nH\u2082 Energy", energy: 0.184, eff: "66%", color: COLORS.purple, loss: 0.096 },
    { label: "H\u2082 \u2192 Work\nat Engine", energy: 0.079, eff: "43%", color: COLORS.green, loss: 0.105 },
  ];

  const runAnimation = useCallback(() => {
    setAnimPhase(0);
    setIsRunning(true);
    let phase = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      phase++;
      if (phase > steps.length) {
        clearInterval(timerRef.current);
        setIsRunning(false);
      }
      setAnimPhase(phase);
    }, 700);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !hasPlayed.current) {
          hasPlayed.current = true;
          runAnimation();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => { obs.disconnect(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [runAnimation]);

  const maxBarH = 160;
  const barWidth = 56;

  return (
    <div ref={containerRef} style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, padding: 24, margin: "32px 0",
    }}>
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 6 }}>
          The Closed-Loop Energy Chain
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Trace the energy through the HHO loop. Each conversion step loses energy as heat. The hydrogen that returns to the engine is a fraction of the diesel that started the journey. Click to replay.
        </p>
      </div>

      <div
        onClick={runAnimation}
        style={{ cursor: "pointer", position: "relative", overflowX: "auto", paddingBottom: 16 }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 0, minHeight: maxBarH + 100, paddingTop: 40 }}>
          {steps.map((step, i) => {
            const visible = animPhase > i;
            const barH = step.energy * maxBarH;

            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: barWidth + 24, position: "relative" }}>
                  {step.eff && (
                    <div style={{
                      fontFamily: mono, fontSize: 10, color: COLORS.textMuted,
                      marginBottom: 4, opacity: visible ? 1 : 0, transition: "opacity 0.5s ease",
                    }}>
                      x{step.eff}
                    </div>
                  )}

                  {step.loss && (
                    <div style={{
                      position: "absolute",
                      top: -30,
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(10px)",
                      transition: "all 0.5s ease 0.3s",
                    }}>
                      <div style={{
                        fontFamily: mono, fontSize: 9, color: COLORS.red,
                        background: `${COLORS.red}15`, border: `1px solid ${COLORS.red}30`,
                        borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap",
                      }}>
                        -{(step.loss * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}

                  <div style={{
                    width: barWidth,
                    height: visible ? barH : 0,
                    background: `linear-gradient(to top, ${step.color}44, ${step.color})`,
                    borderRadius: "6px 6px 0 0",
                    transition: "height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: visible ? `0 0 20px ${step.color}33` : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", position: "relative",
                  }}>
                    <div style={{
                      fontFamily: mono, fontSize: barH > 40 ? 16 : 11, fontWeight: 700, color: "#fff",
                      opacity: visible ? 1 : 0, transition: "opacity 0.3s ease 0.4s",
                    }}>
                      {(step.energy * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div style={{
                    fontFamily: mono, fontSize: 9, color: COLORS.textMuted,
                    textAlign: "center", marginTop: 6, lineHeight: 1.3,
                    whiteSpace: "pre-line", minHeight: 28,
                    opacity: visible ? 1 : 0.3, transition: "opacity 0.3s ease",
                  }}>
                    {step.label}
                  </div>
                </div>

                {i < steps.length - 1 && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 24, marginBottom: 34, color: COLORS.textDim,
                    fontFamily: mono, fontSize: 16,
                    opacity: animPhase > i + 1 ? 1 : 0.2,
                    transition: "opacity 0.3s ease",
                  }}>
                    {"\u2192"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          display: "flex", justifyContent: "center", gap: 32, marginTop: 20,
          opacity: animPhase > steps.length - 1 ? 1 : 0, transition: "opacity 0.5s ease 0.3s",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: COLORS.accent }}>100%</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase" }}>Diesel energy in</div>
          </div>
          <div style={{ fontFamily: mono, fontSize: 24, color: COLORS.textDim, alignSelf: "center" }}>{"\u2192"}</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: COLORS.red }}>7.9%</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase" }}>Returns as work via H{"\u2082"}</div>
          </div>
          <div style={{ fontFamily: mono, fontSize: 24, color: COLORS.textDim, alignSelf: "center" }}>=</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: COLORS.red }}>92.1%</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase" }}>Lost as heat</div>
          </div>
        </div>
      </div>

      <div style={{
        fontFamily: sans, fontSize: 13, color: COLORS.textDim, marginTop: 16,
        padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5,
      }}>
        For every unit of diesel energy diverted through the hydrogen loop, 92% is lost as heat across four conversion steps.
        The 8% that returns as useful work would have been better spent as diesel energy in the first place — where it converts at 40-45%, not 8%.
        This isn't an efficiency problem. It's an architecture problem. The loop always loses.
      </div>
    </div>
  );
}

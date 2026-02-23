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

export default function AddingVsRecycling() {
  const lpgEnergy = 20;
  const hhoEnergy = 0.037;

  return (
    <div style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, padding: 24, margin: "32px 0",
    }}>
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 6 }}>
          Adding Energy vs Recycling Energy
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          The fundamental difference between a dual-fuel system (adding a second fuel source) and an HHO generator (recycling the engine's own output through lossy conversions).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Dual fuel */}
        <div style={{
          background: COLORS.bg, borderRadius: 8, padding: 16,
          border: `1px solid ${COLORS.green}30`,
        }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.green, textTransform: "uppercase", marginBottom: 12 }}>
            Dual-Fuel (e.g. Diesel + LPG)
          </div>
          <div style={{ display: "flex", gap: 4, height: 120, alignItems: "flex-end" }}>
            <div style={{ flex: 80, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{
                height: "100%",
                background: `linear-gradient(to top, ${COLORS.textDim}22, ${COLORS.textDim}55)`,
                borderRadius: "4px 4px 0 0",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: COLORS.text }}>Diesel 80%</span>
              </div>
            </div>
            <div style={{ flex: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{
                height: `${lpgEnergy * 5}%`,
                background: `linear-gradient(to top, ${COLORS.green}44, ${COLORS.green})`,
                borderRadius: "4px 4px 0 0",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 12px ${COLORS.green}33`,
                minHeight: 60,
              }}>
                <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: "#fff", writingMode: "vertical-rl" }}>LPG 20%</span>
              </div>
            </div>
          </div>
          <div style={{
            fontFamily: sans, fontSize: 12, color: COLORS.textMuted,
            marginTop: 12, lineHeight: 1.4, textAlign: "center",
          }}>
            External fuel. Own energy content.
            <br />
            <span style={{ color: COLORS.green }}>Adds</span> energy to the cycle.
          </div>
        </div>

        {/* HHO */}
        <div style={{
          background: COLORS.bg, borderRadius: 8, padding: 16,
          border: `1px solid ${COLORS.red}30`,
        }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: COLORS.red, textTransform: "uppercase", marginBottom: 12 }}>
            On-Vehicle HHO
          </div>
          <div style={{ display: "flex", gap: 4, height: 120, alignItems: "flex-end" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{
                height: "100%",
                background: `linear-gradient(to top, ${COLORS.textDim}22, ${COLORS.textDim}55)`,
                borderRadius: "4px 4px 0 0",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: COLORS.text }}>Diesel ~100%</span>
              </div>
            </div>
            <div style={{
              width: 3, background: COLORS.red, borderRadius: 2,
              boxShadow: `0 0 8px ${COLORS.red}`,
              alignSelf: "stretch",
            }} />
          </div>
          <div style={{
            fontFamily: sans, fontSize: 12, color: COLORS.textMuted,
            marginTop: 12, lineHeight: 1.4, textAlign: "center",
          }}>
            Generated from engine's own output.
            <br />
            <span style={{ color: COLORS.red }}>Recycles</span> energy at a net loss.
          </div>
          <div style={{
            fontFamily: mono, fontSize: 10, color: COLORS.red, textAlign: "center", marginTop: 8,
          }}>
            The red line is the hydrogen. 0.037% of total energy.
          </div>
        </div>
      </div>

      <div style={{
        fontFamily: sans, fontSize: 13, color: COLORS.textDim, marginTop: 16,
        padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.5,
      }}>
        A dual-fuel system injects LPG — an external fuel with 46 MJ/kg of its own chemical energy.
        It adds 15-20% of total fuel energy from a second source. An HHO system generates hydrogen using the
        engine's own alternator, recycling diesel energy through four lossy conversions. One is fuel substitution.
        The other is a perpetual motion claim with extra steps.
      </div>
    </div>
  );
}

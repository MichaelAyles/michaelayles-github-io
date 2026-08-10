import { useState } from "react";
import { C, HAND, MONO, Caption } from "./excali.jsx";

// The speed ladder as an interactive chart, replacing the dense progress.png.
// Every rung from fabric/progress.py in the kev-gpt repo, grouped into the four
// acts of the project. Horizontal bars on a log scale so the 27 labels never
// overlap; tap/click a rung to see what that step removed.
//
// Data is a hand-synced copy of fabric/progress.py LADDER (single source of truth
// over there; keep the numbers identical). All rungs MEASURED on silicon except
// the one SIM rung, exactly as tagged upstream.

const MIN = 0.04; // left edge of the log scale
const MAX = 1e6; // right edge (headroom so end labels never clip)
const LOG_SPAN = Math.log10(MAX / MIN);
const pct = (v) => ((Math.log10(v / MIN)) / LOG_SPAN) * 100;

const TICKS = [0.1, 1, 10, 100, 1000, 10000, 100000];
const tickLabel = (v) => (v >= 1000 ? `${v / 1000}k` : `${v}`);

// reference baselines: same model, B=1 greedy decode, all MEASURED
const REFS = [
  { v: 11, label: "A53 chat", color: C.teal },
  { v: 356, label: "XPS15 torch CPU", color: C.violet },
  { v: 719, label: "RTX 3050 Ti", color: C.orange },
  { v: 1273, label: "XPS15 ORT CPU", color: C.red },
];

const ERAS = [
  {
    title: "Act I: the CPU in the loop",
    note:
      "Each rung deletes overhead, and the ladder asymptotes to the A53's own ~11 " +
      "tok/s. Once the matmul is offloaded, the Arm core running the rest of the " +
      "forward is the wall.",
    rungs: [
      {
        name: "Re-stream weights every token",
        sub: "Python AXI, O(T²) recompute",
        tps: 0.07,
        tag: "MEASURED",
        removed:
          "Nothing yet: this is the first on-fabric generation. Every rung after " +
          "this one is named for what it removed.",
      },
      {
        name: "Resident weights in URAM",
        sub: "load once at boot",
        tps: 0.22,
        tag: "MEASURED",
        removed: "Per-token weight movement over AXI (~83% of the time).",
      },
      {
        name: "KV cache",
        sub: "incremental decode",
        tps: 2.71,
        tag: "MEASURED",
        removed:
          "The O(T²) full-context recompute: only the new position is processed.",
      },
      {
        name: "C MMIO driver",
        sub: "compiled AXI inner loop",
        tps: 10.35,
        tag: "MEASURED",
        removed:
          "Python per-poke overhead; the matmul leaves the critical path. This lands " +
          "at ~11 tok/s, the A53's own speed: CPU-in-the-loop cannot beat the CPU.",
      },
    ],
  },
  {
    title: "Act II: the sequencer (CPU out of the loop)",
    note:
      "The architectural jump. One stream, the whole forward in fabric; from here " +
      "the game is cycles and clock.",
    rungs: [
      {
        name: "HW sequencer @ 40 MHz",
        sub: "the jump that beats the CPU",
        tps: 44.32,
        tag: "MEASURED",
        removed:
          "The A53 doing the non-matmul forward (attention, softmax, norm, GELU, " +
          "sampling) in Python: the ~11 tok/s wall.",
      },
      {
        name: "Resident-read GEMV",
        sub: "no per-matmul reload",
        tps: 75.8,
        tag: "SIM",
        removed:
          "Re-streaming each matmul's weights (~42% of cycles). RTL bit-exact in " +
          "simulation against the reference; superseded before it got a bitstream.",
      },
      {
        name: "PE = 256 wide lanes",
        sub: "256 MACs per cycle",
        tps: 231.0,
        tag: "MEASURED",
        removed: "The GEMV run phase: 16x fewer group passes.",
      },
      {
        name: "GELU stream + LN pipeline",
        sub: "PE=128 @ 125 MHz silicon",
        tps: 751.78,
        tag: "MEASURED",
        removed:
          "The GELU per-element stall and the LayerNorm DSP cascade; Fmax 50 to 125 MHz.",
      },
      {
        name: "Wide P-lane datapath",
        sub: "P=4 non-linears @ 100 MHz",
        tps: 1882.7,
        tag: "MEASURED",
        removed:
          "The 1-element/cycle serial loops, made P-wide (53,116 cyc/tok). First " +
          "rung past the laptop's best CPU number.",
      },
      {
        name: "BRAM sync-read scratch",
        sub: "P=8 @ 125 MHz",
        tps: 2483.9,
        tag: "MEASURED",
        removed: "The LUTRAM datapath, moved to BRAM (50,324 cyc/tok).",
      },
      {
        name: "P-wide GEMV boundary",
        sub: "act-feed + readback P/cycle",
        tps: 3511.6,
        tag: "MEASURED",
        removed:
          "The 1-element/cycle GEMV activation and readback loops (35,596 cyc/tok).",
      },
      {
        name: "LANES = 256",
        sub: "72-bit URAM banks",
        tps: 5448.8,
        tag: "MEASURED",
        removed: "Half the GEMV passes (22,941 cyc/tok).",
      },
      {
        name: "Cycle-floor cut + deep pipeline",
        sub: "fused RB+DQ+GELU @ 166.7 MHz",
        tps: 9295.4,
        tag: "MEASURED",
        removed:
          "The attention scalar load, the dequant round-trip, and Fmax 85 to 131 " +
          "in STA (17,930 cyc/tok).",
      },
      {
        name: "3-stage act-quant, 200 MHz",
        sub: "the last sub-8ns path",
        tps: 11143.9,
        tag: "MEASURED",
        removed:
          "The BRAM-to-mux-to-DSP path that capped the clock; silicon clean at 200 MHz.",
      },
    ],
  },
  {
    title: "Act III: many streams (aggregate, T=1)",
    note:
      "4 to 16 parallel streams share each weight pass, decoding with an attention " +
      "window of 1. Real silicon, bit-exact, honestly degenerate text: these are " +
      "aggregate tokens, not one conversation.",
    rungs: [
      {
        name: "Batch GEMM N=4",
        sub: "4 streams, one weight pass",
        tps: 16969.3,
        tag: "MEASURED",
        removed: "Per-stream weight reads: 47,144 cycles now serve 4 tokens.",
      },
      {
        name: "Ping-pong N=8",
        sub: "NL engine overlaps GEMM",
        tps: 17740.6,
        tag: "MEASURED",
        removed: "Non-linear bubbles: the NL engine works while the GEMM streams.",
      },
      {
        name: "Single-pass merge N=8",
        sub: "both groups, one pass",
        tps: 19275.6,
        tag: "MEASURED",
        removed: "The second weight pass (69,172 cycles / 8 tokens).",
      },
      {
        name: "N=16, DSP-packed banks",
        sub: "shared LN/attn, 106.5k LUT",
        tps: 24134.0,
        tag: "MEASURED",
        removed: "Per-stream MAC fabric: 12 DSP-packed banks feed 16 streams.",
      },
      {
        name: "Softmax latency cut",
        sub: "103,582 cyc on silicon",
        tps: 25744.5,
        tag: "MEASURED",
        removed: "Dead wait-states between exp, sum, and reciprocal.",
      },
      {
        name: "Split-brain N=14",
        sub: "two cohorts, dual-port URAM",
        tps: 36970.7,
        tag: "MEASURED",
        removed: "The single weight read port: both URAM ports now stream weights.",
      },
      {
        name: "N=16 @ 200 MHz",
        sub: "LN un-retimed + AQ range-proof",
        tps: 46604.4,
        tag: "MEASURED",
        removed: "The LayerNorm qsh/output timing paths and the DSP famine.",
      },
      {
        name: "Schedule pipelining",
        sub: "AQ/RUN overlap, per-stream NL",
        tps: 56262.7,
        tag: "MEASURED",
        removed: "The GEMM/NL ping-pong and the per-call attention overhead.",
      },
      {
        name: "TMAX=16 + per-cohort attention",
        sub: "N=16 wave @ 200 MHz",
        tps: 59965.5,
        tag: "MEASURED",
        badge: "the aggregate record",
        removed:
          "The shared-attention wall and the LayerNorm critical path " +
          "(53,364 cycles / 16 tokens @ 200 MHz, 16/16 bit-exact, 3/3 runs).",
      },
    ],
  },
  {
    title: "Act IV: Kevin remembers (faithful, N=1)",
    note:
      "A different metric, not a regression: one stream with the full on-chip KV " +
      "window, so every token attends to the whole conversation. These are tok/s " +
      "that spell real messages.",
    metricBreak: true,
    rungs: [
      {
        name: "Faithful N=1, T=128 window",
        sub: "on-chip KV @ 142.9 MHz",
        tps: 11343.2,
        tag: "MEASURED",
        removed:
          "The T=1 degenerate attention. A 119-token real message at 12,594 " +
          "cyc/tok average, 3/3 bit-exact.",
      },
      {
        name: "R5 cone ladder, 166.7 MHz",
        sub: "7 timing paths pipelined",
        tps: 13162.3,
        tag: "MEASURED",
        removed:
          "The kv-quantise, attention-dot, min-max and act-quant timing cones " +
          "(12,662 cyc/tok).",
      },
      {
        name: "Schedule trims + MAC stage",
        sub: "KVW/RB/LN overlap",
        tps: 16087.5,
        tag: "MEASURED",
        removed:
          "About 2.2k cycles of schedule slack: AQ/RUN overlap, groupwise " +
          "readback, the KV feeder (10,360 cyc/tok @ 166.7 MHz).",
      },
      {
        name: "LN wide-word cut, 200 MHz",
        sub: "the route-congestion kill",
        tps: 19242.0,
        tag: "MEASURED",
        badge: "the faithful record",
        removed:
          "The congestion wall that capped the clock at 166.7: the LayerNorm " +
          "flip-flop arrays became wide-word LUTRAM, timing closed, and silicon " +
          "runs bit-exact at 200 MHz (10,394 cyc/tok). 250 MHz is a hard wall.",
      },
    ],
  },
];

const fmtTps = (v) =>
  v >= 100 ? Math.round(v).toLocaleString("en-US") : v >= 10 ? v.toFixed(0) : v.toFixed(2);

const fmtMult = (m) => {
  if (m == null) return null;
  if (m >= 1.95) return `×${Math.round(m)}`;
  if (m >= 1.15) return `×${m.toFixed(1)}`;
  return `+${Math.round((m - 1) * 100)}%`;
};

// one thin vertical line as a gradient layer, so it repeats per-row and reads
// as a dashed guide across the whole ladder
const vline = (p, color, w) =>
  `linear-gradient(90deg, transparent calc(${p}% - ${w}px), ${color} calc(${p}% - ${w}px), ` +
  `${color} calc(${p}% + ${w}px), transparent calc(${p}% + ${w}px))`;

const TRACK_BG = [
  ...REFS.map((r) => vline(pct(r.v), r.color, 0.8)),
  ...TICKS.map((t) => vline(pct(t), "var(--border)", 0.5)),
].join(",");

const SIM_STRIPES =
  `repeating-linear-gradient(45deg, ${C.blue} 0px, ${C.blue} 2px, ` +
  `rgba(66,99,235,0.25) 2px, rgba(66,99,235,0.25) 6px)`;

const CSS = `
.sl-grid { display: grid; grid-template-columns: 220px 1fr; column-gap: 12px; align-items: center; }
.sl-rung { border: 0; background: none; width: 100%; padding: 2px 0; margin: 0;
  cursor: pointer; font: inherit; color: inherit; text-align: left; border-radius: 6px; }
.sl-rung:hover { background: var(--hover-bg); }
.sl-label { line-height: 1.25; padding: 2px 0 2px 6px; }
.sl-name { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); }
.sl-sub { font-size: 0.68rem; color: var(--text-dim); }
.sl-detail { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5;
  padding: 2px 6px 8px 6px; }
@media (max-width: 620px) {
  .sl-grid { grid-template-columns: 1fr; row-gap: 2px; }
  .sl-label { padding-left: 2px; }
  .sl-hide-narrow { display: none; }
}
`;

function TickRow() {
  return (
    <div className="sl-grid" aria-hidden="true">
      <span className="sl-hide-narrow" />
      <div style={{ position: "relative", height: 16 }}>
        {TICKS.map((t) => (
          <span
            key={t}
            style={{
              position: "absolute",
              left: `${pct(t)}%`,
              transform: "translateX(-50%)",
              fontFamily: MONO,
              fontSize: 10,
              color: "var(--text-dim)",
            }}
          >
            {tickLabel(t)}
          </span>
        ))}
      </div>
    </div>
  );
}

function Rung({ rung, mult, open, onToggle }) {
  const w = pct(rung.tps);
  const sim = rung.tag === "SIM";
  return (
    <div>
      <button
        type="button"
        className="sl-rung"
        aria-expanded={open}
        onClick={onToggle}
      >
        <div className="sl-grid">
          <span className="sl-label">
            <span className="sl-name">{rung.name}</span>
            <br />
            <span className="sl-sub">{rung.sub}</span>
          </span>
          <span
            style={{
              position: "relative",
              height: 24,
              backgroundImage: TRACK_BG,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 5,
                height: 14,
                width: `${w}%`,
                borderRadius: "0 4px 4px 0",
                background: sim ? SIM_STRIPES : C.green,
              }}
            />
            <span
              style={{
                position: "absolute",
                left: `calc(${w}% + 7px)`,
                top: 4,
                whiteSpace: "nowrap",
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {fmtTps(rung.tps)}
              {mult != null && (
                <span style={{ color: "var(--accent)", marginLeft: 6, fontWeight: 600 }}>
                  {fmtMult(mult)}
                </span>
              )}
              {rung.badge && (
                <span
                  style={{
                    marginLeft: 6,
                    fontWeight: 600,
                    fontSize: 10,
                    color: C.green,
                  }}
                >
                  {"★"} {rung.badge}
                </span>
              )}
            </span>
          </span>
        </div>
      </button>
      {open && (
        <div className="sl-grid">
          <span className="sl-hide-narrow" />
          <div className="sl-detail">
            <strong style={{ color: "var(--text-primary)" }}>
              {fmtTps(rung.tps)} tok/s
            </strong>{" "}
            ({rung.tag === "SIM" ? "SIM: bit-exact vs reference, no bitstream" : "MEASURED on silicon"}
            ). Removed: {rung.removed}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpeedLadder() {
  const [open, setOpen] = useState(null);

  // multiplier vs the previous rung, reset at the Act IV metric change
  let prev = null;
  const eras = ERAS.map((era) => {
    if (era.metricBreak) prev = null;
    const rungs = era.rungs.map((r) => {
      const mult = prev ? r.tps / prev : null;
      prev = r.tps;
      return { ...r, mult };
    });
    return { ...era, rungs };
  });

  const swatch = (bg) => ({
    display: "inline-block",
    width: 12,
    height: 12,
    borderRadius: 3,
    background: bg,
    marginRight: 5,
    verticalAlign: -1,
  });
  const dash = (color) => ({
    display: "inline-block",
    width: 14,
    borderTop: `2px dashed ${color}`,
    marginRight: 5,
    verticalAlign: 3,
  });

  return (
    <figure style={{ margin: "2rem 0" }}>
      <style>{CSS}</style>
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "14px 14px 10px",
          background: "var(--background)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 18px",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span style={{ fontFamily: HAND, fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
            the speed ladder, every rung named for what it removed
          </span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: "var(--text-dim)" }}>
            tokens / second, log scale
          </span>
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: 2 }}>
          <span style={swatch(C.green)} />
          MEASURED on silicon (3/3 runs, token stream bit-exact)
          <span style={{ margin: "0 7px" }} />
          <span style={swatch(SIM_STRIPES)} />
          SIM (RTL bit-exact vs reference; no bitstream)
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: 6 }}>
          {REFS.map((r) => (
            <span key={r.label} style={{ marginRight: 14, whiteSpace: "nowrap" }}>
              <span style={dash(r.color)} />
              {r.label} {fmtTps(r.v)}
            </span>
          ))}
        </div>

        <TickRow />

        {eras.map((era, ei) => (
          <section key={era.title} style={{ marginTop: ei === 0 ? 2 : 14 }}>
            <div
              style={{
                borderTop: era.metricBreak
                  ? `2px dashed ${C.violet}`
                  : "1px solid var(--border)",
                paddingTop: 8,
              }}
            >
              <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>
                {era.title}
              </div>
              <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)", lineHeight: 1.45, maxWidth: 640, marginBottom: 6 }}>
                {era.note}
              </div>
            </div>
            {era.rungs.map((r) => {
              const key = `${ei}-${r.name}`;
              return (
                <Rung
                  key={key}
                  rung={r}
                  mult={r.mult}
                  open={open === key}
                  onToggle={() => setOpen(open === key ? null : key)}
                />
              );
            })}
          </section>
        ))}
      </div>
      <Caption>
        The full ladder from the repo's <code>fabric/progress.py</code>, 27 rungs. Tap or
        click a rung for what that step removed. Acts I to III count aggregate tokens
        across parallel streams; Act IV is the faithful single-stream metric with full
        context, ending at the current record of 19,242 tok/s at 200 MHz.
      </Caption>
    </figure>
  );
}

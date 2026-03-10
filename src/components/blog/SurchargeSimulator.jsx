import { useState, useMemo, useCallback } from "react";

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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKLY_LITRES = 24500; // approximate weekly fleet consumption (30 trucks, 80k mi/yr, 8.5 mpg)

const presets = {
  stable: { label: "Stable market", values: [138, 138, 139, 139, 138, 138, 137, 138, 139, 138, 138, 138] },
  spike: { label: "Sudden spike", values: [138, 138, 162, 170, 168, 160, 155, 150, 148, 145, 143, 141] },
  gradual: { label: "Gradual rise", values: [138, 140, 142, 144, 146, 148, 150, 152, 154, 155, 155, 155] },
  crash: { label: "Price crash", values: [165, 160, 148, 140, 135, 132, 130, 130, 131, 132, 132, 133] },
  hormuz: { label: "Hormuz crisis (actual)", values: [138, 138, 153, 165, 170, 168, 160, 155, 150, 148, 145, 143] },
};

export default function SurchargeSimulator() {
  const [scenario, setScenario] = useState("hormuz");
  const [dieselPrices, setDieselPrices] = useState(presets.hormuz.values);
  const [surchargeDelay, setSurchargeDelay] = useState(4); // weeks lag
  const [dragging, setDragging] = useState(false);

  // Surcharge resets monthly, based on the average diesel price of the previous month
  // with an additional delay
  const surchargeRecovery = useMemo(() => {
    const weeklyPrices = [];
    // Expand monthly to weekly (4 weeks per month)
    dieselPrices.forEach(p => {
      for (let w = 0; w < 4; w++) weeklyPrices.push(p);
    });

    // Surcharge recovery: uses the average of the previous month, delayed by surchargeDelay weeks
    const recovery = weeklyPrices.map((_, weekIdx) => {
      const delayedWeek = weekIdx - surchargeDelay;
      if (delayedWeek < 0) return dieselPrices[0]; // use baseline before data starts

      // Find which month the delayed week falls in, take previous month's average
      const delayedMonth = Math.floor(delayedWeek / 4);
      const prevMonth = delayedMonth - 1;

      if (prevMonth < 0) return dieselPrices[0];
      return dieselPrices[prevMonth];
    });

    return recovery;
  }, [dieselPrices, surchargeDelay]);

  // Calculate gap (positive = operator underwater)
  const weeklyData = useMemo(() => {
    const data = [];
    dieselPrices.forEach((price, monthIdx) => {
      for (let w = 0; w < 4; w++) {
        const weekIdx = monthIdx * 4 + w;
        const recovery = surchargeRecovery[weekIdx] || price;
        const gap = price - recovery; // positive = operator pays more than recovered
        const weeklyCost = gap * WEEKLY_LITRES / 100; // in £
        data.push({ week: weekIdx, month: monthIdx, price, recovery, gap, weeklyCost });
      }
    });
    return data;
  }, [dieselPrices, surchargeRecovery]);

  const totalGap = weeklyData.reduce((sum, d) => sum + d.weeklyCost, 0);

  // Chart dimensions
  const W = 700, H = 280;
  const padL = 50, padR = 20, padT = 30, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const priceMin = Math.min(...dieselPrices, ...surchargeRecovery) - 5;
  const priceMax = Math.max(...dieselPrices, ...surchargeRecovery) + 5;

  const xScale = (weekIdx) => padL + (weekIdx / 47) * chartW;
  const yScale = (price) => padT + chartH - ((price - priceMin) / (priceMax - priceMin)) * chartH;

  // Build paths
  const pricePath = weeklyData.map((d, i) =>
    `${i === 0 ? "M" : "L"} ${xScale(d.week)} ${yScale(d.price)}`
  ).join(" ");

  const recoveryPath = weeklyData.map((d, i) =>
    `${i === 0 ? "M" : "L"} ${xScale(d.week)} ${yScale(d.recovery)}`
  ).join(" ");

  // Gap fill area
  const gapPath = weeklyData.map((d, i) =>
    `${i === 0 ? "M" : "L"} ${xScale(d.week)} ${yScale(d.price)}`
  ).join(" ") + " " + [...weeklyData].reverse().map((d, i) =>
    `${i === 0 ? "L" : "L"} ${xScale(d.week)} ${yScale(d.recovery)}`
  ).join(" ") + " Z";

  const handlePreset = (key) => {
    setScenario(key);
    setDieselPrices([...presets[key].values]);
  };

  // Handle drag to edit prices
  const handleChartInteraction = useCallback((e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const svgY = ((e.clientY - rect.top) / rect.height) * H;

    const monthIdx = Math.round(((svgX - padL) / chartW) * 11);
    if (monthIdx < 0 || monthIdx > 11) return;

    const price = priceMin + ((padT + chartH - svgY) / chartH) * (priceMax - priceMin);
    const clampedPrice = Math.max(110, Math.min(200, Math.round(price)));

    setDieselPrices(prev => {
      const next = [...prev];
      next[monthIdx] = clampedPrice;
      return next;
    });
    setScenario("custom");
  }, [priceMin, priceMax]);

  return (
    <div style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, padding: 24, margin: "32px 0",
    }}>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 4 }}>
          Fuel Surcharge Simulator
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
          Fuel surcharges lag real prices. Click a scenario or drag on the chart to draw your own price curve. The red shading is money the operator never recovers.
        </p>
      </div>

      {/* Presets and controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {Object.entries(presets).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => handlePreset(key)}
            style={{
              fontFamily: mono, fontSize: 11, padding: "6px 12px",
              background: scenario === key ? COLORS.accent : COLORS.bg,
              color: scenario === key ? "#000" : COLORS.textMuted,
              border: `1px solid ${scenario === key ? COLORS.accent : COLORS.border}`,
              borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {preset.label}
          </button>
        ))}
        {scenario === "custom" && (
          <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.accent, marginLeft: 8 }}>
            Custom (drag to edit)
          </span>
        )}
      </div>

      {/* Surcharge delay slider */}
      <div style={{ marginBottom: 20, maxWidth: 300 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Surcharge reset delay
          </span>
          <span style={{ fontFamily: mono, fontSize: 13, color: COLORS.accent, fontWeight: 600 }}>
            {surchargeDelay} weeks
          </span>
        </div>
        <input
          type="range" min={1} max={8} step={1} value={surchargeDelay}
          onChange={(e) => setSurchargeDelay(Number(e.target.value))}
          style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }}
        />
      </div>

      {/* Chart */}
      <div style={{ width: "100%", overflowX: "auto", marginBottom: 16 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: W, display: "block", margin: "0 auto", cursor: "crosshair" }}
          onMouseDown={(e) => { setDragging(true); handleChartInteraction(e); }}
          onMouseMove={(e) => { if (dragging) handleChartInteraction(e); }}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
        >
          {/* Grid */}
          {[0.25, 0.5, 0.75].map(frac => (
            <line key={frac}
              x1={padL} y1={padT + chartH * (1 - frac)}
              x2={W - padR} y2={padT + chartH * (1 - frac)}
              stroke={COLORS.border} strokeWidth={0.5} strokeDasharray="4 4"
            />
          ))}

          {/* Gap fill */}
          <path d={gapPath} fill={COLORS.red} opacity={0.12} />

          {/* Lines */}
          <path d={pricePath} fill="none" stroke={COLORS.accent} strokeWidth={2.5} strokeLinejoin="round" />
          <path d={recoveryPath} fill="none" stroke={COLORS.green} strokeWidth={2} strokeLinejoin="round" strokeDasharray="6 3" />

          {/* Month control points (draggable) */}
          {dieselPrices.map((price, i) => (
            <circle
              key={i}
              cx={xScale(i * 4)}
              cy={yScale(price)}
              r={5}
              fill={COLORS.accent}
              stroke={COLORS.surface}
              strokeWidth={2}
              style={{ cursor: "ns-resize" }}
            />
          ))}

          {/* Month labels */}
          {MONTHS.map((m, i) => (
            <text
              key={m}
              x={xScale(i * 4)} y={H - 8}
              textAnchor="middle"
              fill={COLORS.textDim} fontFamily={mono} fontSize={9}
            >
              {m}
            </text>
          ))}

          {/* Y axis */}
          {[priceMin, priceMin + (priceMax - priceMin) / 2, priceMax].map((v, i) => (
            <text key={i} x={padL - 8} y={yScale(v) + 4} textAnchor="end" fill={COLORS.textDim} fontFamily={mono} fontSize={9}>
              {Math.round(v)}p
            </text>
          ))}

          {/* Label for the gap */}
          {weeklyData.some(d => d.gap > 2) && (() => {
            const maxGapWeek = weeklyData.reduce((max, d) => d.gap > max.gap ? d : max, weeklyData[0]);
            const midY = (yScale(maxGapWeek.price) + yScale(maxGapWeek.recovery)) / 2;
            return (
              <text
                x={xScale(maxGapWeek.week) + 10} y={midY}
                fill={COLORS.red} fontFamily={mono} fontSize={10} fontWeight={600}
              >
                Gap: {maxGapWeek.gap.toFixed(0)}p/L
              </text>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, justifyContent: "center" }}>
        {[
          { color: COLORS.accent, label: "Actual diesel price", dash: false },
          { color: COLORS.green, label: "Surcharge recovery rate", dash: true },
          { color: COLORS.red, label: "Unrecovered cost", dash: false, isArea: true },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {l.isArea ? (
              <div style={{ width: 16, height: 12, borderRadius: 2, background: l.color, opacity: 0.25 }} />
            ) : (
              <div style={{
                width: 16, height: 3, borderRadius: 2, background: l.color,
                borderTop: l.dash ? `2px dashed ${l.color}` : "none",
              }} />
            )}
            <span style={{ fontFamily: mono, fontSize: 11, color: COLORS.textMuted }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
        marginBottom: 16,
      }}>
        <div style={{ background: COLORS.bg, borderRadius: 6, padding: 14, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 6 }}>
            Total unrecovered cost
          </div>
          <div style={{
            fontFamily: mono, fontSize: 22, fontWeight: 700,
            color: totalGap > 0 ? COLORS.red : COLORS.green,
          }}>
            {totalGap > 0 ? "−" : "+"}£{Math.abs(totalGap).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim, marginTop: 4 }}>
            Over 12 months
          </div>
        </div>
        <div style={{ background: COLORS.bg, borderRadius: 6, padding: 14, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 6 }}>
            Worst weekly gap
          </div>
          <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: COLORS.accent }}>
            {Math.max(...weeklyData.map(d => d.gap)).toFixed(0)}p/L
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim, marginTop: 4 }}>
            Price vs recovery
          </div>
        </div>
        <div style={{ background: COLORS.bg, borderRadius: 6, padding: 14, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 6 }}>
            Fleet weekly volume
          </div>
          <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: COLORS.text }}>
            {(WEEKLY_LITRES / 1000).toFixed(0)}k L
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: COLORS.textDim, marginTop: 4 }}>
            ~30 trucks
          </div>
        </div>
      </div>

      <div style={{
        fontFamily: sans, fontSize: 13, color: COLORS.textDim,
        padding: "12px 16px", background: COLORS.bg, borderRadius: 6, lineHeight: 1.6,
      }}>
        Surcharge mechanisms typically reset monthly against a published index, with {surchargeDelay}-week lag.
        During a spike, the operator absorbs the gap. During a crash, the operator over-recovers briefly — but
        customers demand faster reductions than operators can achieve increases. The asymmetry is baked into the contract structure.
      </div>
    </div>
  );
}

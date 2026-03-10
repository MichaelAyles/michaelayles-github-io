const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";

export default function CL1Architecture() {
  const w = 720;
  const h = 200;
  const boxH = 56;
  const boxR = 6;
  const y = (h - boxH) / 2;

  const boxes = [
    { x: 20, w: 130, label: "DOOM pixels", sub: "(simplified)", accent: "#3b82f6" },
    { x: 180, w: 130, label: "PPO encoder", sub: "silicon", accent: "#3b82f6" },
    { x: 340, w: 140, label: "200k neurons", sub: "biological", accent: "#ef4444" },
    { x: 510, w: 130, label: "CNN decoder", sub: "silicon", accent: "#3b82f6" },
    { x: 670, w: 40, label: "Act", sub: "", accent: "#22c55e" },
  ];

  const arrows = [
    [150, 180],
    [310, 340],
    [480, 510],
    [640, 670],
  ];

  return (
    <figure style={{ margin: "2rem 0", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        style={{ maxWidth: w, display: "block", margin: "0 auto" }}
      >
        {boxes.map((b, i) => (
          <g key={i}>
            <rect
              x={b.x} y={y} width={b.w} height={boxH} rx={boxR}
              fill="var(--surface)" stroke={b.accent} strokeWidth={1} opacity={0.9}
            />
            <text
              x={b.x + b.w / 2} y={y + 24} textAnchor="middle"
              fill="var(--text-primary)" fontSize={12} fontFamily={mono}
            >
              {b.label}
            </text>
            {b.sub && (
              <text
                x={b.x + b.w / 2} y={y + 42} textAnchor="middle"
                fill="var(--text-secondary)" fontSize={10} fontFamily={mono}
              >
                {b.sub}
              </text>
            )}
          </g>
        ))}
        {arrows.map(([x1, x2], i) => (
          <g key={`a${i}`}>
            <line
              x1={x1} y1={h / 2} x2={x2 - 6} y2={h / 2}
              stroke="var(--border)" strokeWidth={1.5}
            />
            <polygon
              points={`${x2},${h / 2} ${x2 - 8},${h / 2 - 4} ${x2 - 8},${h / 2 + 4}`}
              fill="var(--border)"
            />
          </g>
        ))}
        <text
          x={245} y={y - 10} textAnchor="middle"
          fill="var(--text-dim)" fontSize={9} fontFamily={mono}
        >
          silicon
        </text>
        <text
          x={575} y={y - 10} textAnchor="middle"
          fill="var(--text-dim)" fontSize={9} fontFamily={mono}
        >
          silicon
        </text>
        <text
          x={410} y={y + boxH + 20} textAnchor="middle"
          fill="#ef4444" fontSize={10} fontFamily={mono}
        >
          the "playing DOOM" part
        </text>
      </svg>
      <figcaption
        style={{
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          marginTop: 8,
          textAlign: "center",
        }}
      >
        The CL1 architecture. The biological neurons sit between two conventional ML systems.
      </figcaption>
    </figure>
  );
}

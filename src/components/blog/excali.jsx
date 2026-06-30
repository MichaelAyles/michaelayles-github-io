// Shared "excalidraw-style" SVG primitives for the Kevin-on-Kria diagrams.
//
// The hand-drawn wobble is a single SVG turbulence + displacement filter applied
// to every stroke. The font is a handwriting stack. Boxes use the excalidraw pastel
// palette but text uses the blog theme vars so it reads in light and dark mode.

export const HAND =
  "'Comic Sans MS', 'Segoe Print', 'Bradley Hand', 'Chalkboard SE', cursive";
export const MONO = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";

// excalidraw-ish accents (work on both light and dark backgrounds)
export const C = {
  blue: "#4263eb",
  blueFill: "rgba(66,99,235,0.12)",
  green: "#2f9e44",
  greenFill: "rgba(47,158,68,0.12)",
  orange: "#e8590c",
  orangeFill: "rgba(232,89,12,0.12)",
  red: "#e03131",
  redFill: "rgba(224,49,49,0.12)",
  violet: "#7048e8",
  violetFill: "rgba(112,72,232,0.12)",
  teal: "#0c8599",
  tealFill: "rgba(12,133,153,0.12)",
  gray: "#868e96",
  grayFill: "rgba(134,142,150,0.10)",
};

// A reusable roughening filter. Render one per <svg> with a unique id.
export function Roughen({ id, scale = 1.6 }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.013"
        numOctaves="2"
        seed="7"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={scale}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  );
}

// A rounded "hand-drawn" box with a title and optional sub lines.
export function Box({
  x,
  y,
  w,
  h,
  title,
  sub = [],
  stroke = C.blue,
  fill = C.blueFill,
  titleSize = 13,
  subSize = 10.5,
}) {
  const cx = x + w / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        ry={10}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
      <text
        x={cx}
        y={y + (sub.length ? 20 : h / 2 + 4)}
        textAnchor="middle"
        fontFamily={HAND}
        fontSize={titleSize}
        fontWeight="700"
        fill="var(--text-primary)"
      >
        {title}
      </text>
      {sub.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={y + 38 + i * (subSize + 4)}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={subSize}
          fill="var(--text-secondary)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

// An arrow between two points with an optional label.
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = C.gray,
  label,
  dashed = false,
  markerId,
  labelDy = -6,
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={2}
        strokeDasharray={dashed ? "6 5" : undefined}
        markerEnd={`url(#${markerId})`}
      />
      {label && (
        <text
          x={mx}
          y={my + labelDy}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={9.5}
          fill="var(--text-secondary)"
        >
          {label}
        </text>
      )}
    </g>
  );
}

export function ArrowHead({ id, color = C.gray }) {
  return (
    <marker
      id={id}
      markerWidth="10"
      markerHeight="10"
      refX="7"
      refY="3"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M0,0 L7,3 L0,6 Z" fill={color} />
    </marker>
  );
}

export function Caption({ children }) {
  return (
    <figcaption
      style={{
        fontSize: "0.8rem",
        color: "var(--text-secondary)",
        marginTop: 8,
        textAlign: "center",
      }}
    >
      {children}
    </figcaption>
  );
}

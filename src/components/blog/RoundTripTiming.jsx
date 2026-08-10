import { Roughen, Caption, C, HAND, MONO } from "./excali.jsx";

// Where a reply's latency actually goes. The fabric decode (~6.6 ms) is a sliver;
// the round trip a user feels is dominated by the host loop and the network.
// Four bars, same time axis, so the fabric slice stays the same width throughout
// and everything else is the tax stacked on top of it.
export default function RoundTripTiming() {
  const w = 940;
  const h = 300;
  const f = "rgh-rtt";

  // geometry
  const x0 = 190;          // left edge of the bars
  const xMax = 910;        // right edge of the axis
  const msMax = 105;       // ms at the right edge
  const px = (ms) => x0 + (ms / msMax) * (xMax - x0);
  const barH = 30;
  const gap = 22;
  const y0 = 74;

  // fabric decode is the same ~6.6 ms sliver in every bar
  const FAB = 6.6;

  // rows: label, [segments], each segment {ms, color, fill, tag}
  const rows = [
    {
      label: "before the fix",
      note: "~1,000 tok/s felt",
      segs: [
        { ms: FAB, color: C.red, fill: C.redFill, tag: "fabric 6.6" },
        { ms: 93.4, color: C.gray, fill: C.grayFill, tag: "193 logit read-backs / token  (58% of the reply)" },
      ],
    },
    {
      label: "after Gumbel, localhost",
      note: "~5,600 tok/s",
      segs: [
        { ms: FAB, color: C.red, fill: C.redFill, tag: "fabric 6.6" },
        { ms: 16, color: C.teal, fill: C.tealFill, tag: "host loop + 1 seed write" },
      ],
    },
    {
      label: "public, Cloudflare tunnel",
      note: "~1,658 tok/s",
      segs: [
        { ms: FAB, color: C.red, fill: C.redFill, tag: "fabric 6.6" },
        { ms: 16, color: C.teal, fill: C.tealFill, tag: "host" },
        { ms: 54, color: C.orange, fill: C.orangeFill, tag: "WAN + tunnel RTT  (honest network distance)" },
      ],
    },
    {
      label: "blit on Enter",
      note: "answered while you typed",
      segs: [
        { ms: 16, color: C.green, fill: C.greenFill, tag: "one 60 Hz frame, zero inference on the keypress" },
      ],
    },
  ];

  return (
    <figure style={{ margin: "2rem 0", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w, display: "block", margin: "0 auto" }}>
        <defs>
          <Roughen id={f} />
        </defs>

        <text x={w / 2} y={26} textAnchor="middle" fontFamily={HAND} fontSize={17} fontWeight="700" fill="var(--text-primary)">
          fabric time is a sliver of round-trip time
        </text>
        <text x={w / 2} y={46} textAnchor="middle" fontFamily={MONO} fontSize={10.5} fill="var(--text-secondary)">
          same time axis on every bar: the red 6.6 ms is the only part that is actually the chip
        </text>

        <g filter={`url(#${f})`}>
          {/* ms gridlines */}
          {[0, 25, 50, 75, 100].map((ms) => (
            <g key={ms}>
              <line x1={px(ms)} y1={y0 - 8} x2={px(ms)} y2={y0 + rows.length * (barH + gap) - gap + 8}
                stroke={C.gray} strokeWidth={1} strokeDasharray="2 6" opacity={0.5} />
              <text x={px(ms)} y={y0 + rows.length * (barH + gap) - gap + 24} textAnchor="middle"
                fontFamily={MONO} fontSize={9} fill="var(--text-dim)">{ms} ms</text>
            </g>
          ))}

          {rows.map((row, ri) => {
            const y = y0 + ri * (barH + gap);
            let cursor = x0;
            return (
              <g key={ri}>
                {/* row label */}
                <text x={x0 - 12} y={y + barH / 2 - 2} textAnchor="end" fontFamily={HAND} fontSize={12.5}
                  fontWeight="700" fill="var(--text-primary)">{row.label}</text>
                <text x={x0 - 12} y={y + barH / 2 + 12} textAnchor="end" fontFamily={MONO} fontSize={9}
                  fill="var(--text-secondary)">{row.note}</text>

                {row.segs.map((s, si) => {
                  const wSeg = (s.ms / msMax) * (xMax - x0);
                  const rx = cursor;
                  cursor += wSeg;
                  return (
                    <g key={si}>
                      <rect x={rx} y={y} width={Math.max(wSeg, 2)} height={barH} rx={5} ry={5}
                        fill={s.fill} stroke={s.color} strokeWidth={2} />
                      {wSeg > 60 && (
                        <text x={rx + wSeg / 2} y={y + barH / 2 + 3.5} textAnchor="middle"
                          fontFamily={MONO} fontSize={9} fill="var(--text-secondary)">{s.tag}</text>
                      )}
                    </g>
                  );
                })}
                {/* tag for narrow segments, dropped to the right */}
                {row.segs.map((s, si) => {
                  const wSeg = (s.ms / msMax) * (xMax - x0);
                  return wSeg <= 60 && si > 0 ? (
                    <text key={`t${si}`} x={cursor + 8} y={y + barH / 2 + 3.5} textAnchor="start"
                      fontFamily={MONO} fontSize={9} fill="var(--text-secondary)">{s.tag}</text>
                  ) : null;
                })}
              </g>
            );
          })}
        </g>
      </svg>
      <Caption>
        The chip decodes a whole reply in ~6.6 ms (red). Everything else is tax the
        fabric never sees: before the Gumbel-max fix, 193 logit read-backs per token ate
        ~58% of every reply; after it, the localhost round trip is mostly the host loop;
        in public it is honest network distance through the tunnel. The blit path skips
        the round trip entirely, because the answer was already computed while you typed.
      </Caption>
    </figure>
  );
}

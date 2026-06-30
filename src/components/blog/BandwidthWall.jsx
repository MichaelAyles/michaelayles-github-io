import { Box, ArrowHead, Roughen, Caption, C, HAND, MONO } from "./excali.jsx";

// The founding insight: a DDR-resident model puts the A53 and the fabric behind the same
// ~20 GB/s wall, so the fabric buys nothing. Keeping the model on-chip is the only escape.
export default function BandwidthWall() {
  const w = 920;
  const h = 400;
  const f = "rgh-bw";
  const head = "ah-bw";

  return (
    <figure style={{ margin: "2rem 0", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w, display: "block", margin: "0 auto" }}>
        <defs>
          <Roughen id={f} />
          <ArrowHead id={head} color={C.gray} />
        </defs>

        <g filter={`url(#${f})`}>
          {/* divider */}
          <line x1={460} y1={50} x2={460} y2={360} stroke={C.gray} strokeWidth={1.5} strokeDasharray="4 6" />

          {/* LEFT: the wall */}
          <text x={230} y={36} textAnchor="middle" fontFamily={HAND} fontSize={16} fontWeight="700" fill={C.red}>
            DDR-resident: no escape
          </text>
          <Box x={40} y={70} w={150} h={56} stroke={C.gray} fill={C.grayFill} title="Arm A53" />
          <Box x={270} y={70} w={150} h={56} stroke={C.blue} fill={C.blueFill} title="PL fabric" />

          {/* thin shared pipe to DDR */}
          <Box x={150} y={250} w={160} h={64} stroke={C.red} fill={C.redFill}
            title="DDR" sub={["~20 GB/s, shared"]} />
          <line x1={115} y1={126} x2={210} y2={248} stroke={C.red} strokeWidth={2.5} markerEnd={`url(#${head})`} />
          <line x1={345} y1={126} x2={250} y2={248} stroke={C.red} strokeWidth={2.5} markerEnd={`url(#${head})`} />
          <text x={230} y={200} textAnchor="middle" fontFamily={MONO} fontSize={10} fill={C.red}>
            one controller,
          </text>
          <text x={230} y={214} textAnchor="middle" fontFamily={MONO} fontSize={10} fill={C.red}>
            one straw
          </text>
          <text x={230} y={344} textAnchor="middle" fontFamily={MONO} fontSize={10} fill="var(--text-dim)">
            fabric buys nothing: ~11 tok/s
          </text>

          {/* RIGHT: the escape */}
          <text x={690} y={36} textAnchor="middle" fontFamily={HAND} fontSize={16} fontWeight="700" fill={C.green}>
            on-chip: the only escape
          </text>
          <Box x={615} y={70} w={150} h={56} stroke={C.blue} fill={C.blueFill} title="PL fabric" />

          {/* fat pipe to on-chip */}
          <Box x={590} y={230} w={200} h={84} stroke={C.green} fill={C.greenFill}
            title="URAM + BRAM" sub={["hundreds of GB/s", "to TB/s", "model fits in ~3 MB"]} />
          <line x1={690} y1={126} x2={690} y2={228} stroke={C.green} strokeWidth={9} markerEnd={`url(#${head})`} />
          <text x={730} y={185} textAnchor="start" fontFamily={MONO} fontSize={10} fill={C.green}>
            firehose
          </text>
          <text x={690} y={344} textAnchor="middle" fontFamily={MONO} fontSize={10} fill="var(--text-dim)">
            INT4, 1.5 MB resident: up to 59,965 tok/s
          </text>
        </g>

        <text x={w / 2} y={h - 6} textAnchor="middle" fontFamily={HAND} fontSize={13} fontWeight="700" fill="var(--text-primary)">
          being small enough to live on-chip is the entire trick
        </text>
      </svg>
      <Caption>
        Single-stream decode is memory-bandwidth bound, not compute bound. If the weights
        live in DDR, the Arm cores and the fabric share one ~20 GB/s controller and the
        fabric is no faster than the CPU. The only way to win is to make the model small
        enough that all of it fits in on-chip SRAM, where bandwidth is hundreds of GB/s to
        TB/s. Everything else in this project follows from that one sentence.
      </Caption>
    </figure>
  );
}

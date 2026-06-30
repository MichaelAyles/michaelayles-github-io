import { Box, Arrow, ArrowHead, Roughen, Caption, C, HAND, MONO } from "./excali.jsx";

// What actually lives in the FPGA fabric: the split-brain stream layout, the resident
// weight image, the on-chip memories, the non-linear bricks, and the host interface.
export default function PLBlock() {
  const w = 960;
  const h = 600;
  const f = "rgh-pl";
  const head = "ah-pl";
  const headT = "ah-pl-teal";

  return (
    <figure style={{ margin: "2rem 0", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w, display: "block", margin: "0 auto" }}>
        <defs>
          <Roughen id={f} />
          <ArrowHead id={head} color={C.gray} />
          <ArrowHead id={headT} color={C.teal} />
        </defs>

        <text x={w / 2} y={26} textAnchor="middle" fontFamily={HAND} fontSize={17} fontWeight="700" fill="var(--text-primary)">
          inside the chip: 16 streams, zero DRAM
        </text>

        <g filter={`url(#${f})`}>
          {/* Host */}
          <Box x={370} y={44} w={220} h={62} stroke={C.green} fill={C.greenFill}
            title="Arm A53 host" sub={["/dev/mem MMIO", "writes 1 seed reg per request"]} />

          {/* PL boundary */}
          <rect x={24} y={128} width={912} height={452} rx={14} fill="none" stroke={C.gray} strokeWidth={2} strokeDasharray="9 6" />
          <text x={40} y={150} fontFamily={MONO} fontSize={11} fill="var(--text-dim)">
            Programmable Logic (PL)
          </text>

          {/* Sequencer FSM spanning */}
          <Box x={44} y={162} w={872} h={44} stroke={C.violet} fill={C.violetFill}
            title="sequencer FSM - embed to blocks to head to sample to append-KV, then loop. CPU never in the loop."
            titleSize={12} />

          {/* URAM weight image */}
          <Box x={44} y={236} w={150} h={170} stroke={C.orange} fill={C.orangeFill}
            title="URAM" sub={["weight image", "~12.6 Mbit", "INT4 resident", "true dual-port"]} />

          {/* Two cohorts */}
          <Box x={236} y={236} w={300} h={70} stroke={C.blue} fill={C.blueFill}
            title="cohort A - 8 streams" sub={["GEMV wide-word, LANES=128", "weights transposed, 2 MAC/DSP"]} />
          <Box x={236} y={336} w={300} h={70} stroke={C.blue} fill={C.blueFill}
            title="cohort B - 8 streams" sub={["independent URAM port", "stream-desync dissolves"]} />
          <text x={386} y={326} textAnchor="middle" fontFamily={HAND} fontSize={12} fontWeight="700" fill={C.blue}>
            N = 16 split-brain
          </text>

          {/* Non-linear bricks */}
          <Box x={576} y={236} w={180} h={170} stroke={C.teal} fill={C.tealFill}
            title="non-linear bricks" sub={["LayerNorm (rsqrt)", "softmax (running max)", "GELU (LUT + interp)", "dequant per-channel", "P-wide, arbitrated"]} />

          {/* Sampler */}
          <Box x={788} y={236} w={128} h={170} stroke={C.red} fill={C.redFill}
            title="head + sampler" sub={["argmax", "+ Gumbel noise", "seed=0 -> greedy", "1 token out"]} />

          {/* BRAM */}
          <Box x={236} y={436} w={520} h={70} stroke={C.green} fill={C.greenFill}
            title="BRAM - on-chip working memory"
            sub={["activations + per-stream scratch    |    KV cache (on-chip window)"]} />

          {/* arrows: host -> PL */}
          <Arrow x1={440} y1={106} x2={300} y2={234} markerId={head} color={C.gray} label="AXI-Lite regs" labelDy={-4} />
          <Arrow x1={520} y1={106} x2={120} y2={234} markerId={head} color={C.gray} label="AXI-DMA boot weights" labelDy={14} />

          {/* URAM dual port -> cohorts */}
          <Arrow x1={194} y1={266} x2={234} y2={266} markerId={head} color={C.orange} label="port 1" labelDy={-4} />
          <Arrow x1={194} y1={372} x2={234} y2={372} markerId={head} color={C.orange} label="port 2" labelDy={14} />

          {/* cohorts -> non-linear */}
          <Arrow x1={536} y1={271} x2={574} y2={300} markerId={headT} color={C.teal} />
          <Arrow x1={536} y1={371} x2={574} y2={340} markerId={headT} color={C.teal} />

          {/* non-linear -> sampler */}
          <Arrow x1={756} y1={321} x2={786} y2={321} markerId={head} color={C.gray} />

          {/* sampler -> token out (up to host) */}
          <Arrow x1={852} y1={234} x2={852} y2={120} markerId={head} color={C.red} />
          <text x={862} y={180} fontFamily={MONO} fontSize={9.5} fill="var(--text-secondary)">token</text>

          {/* BRAM <-> cohorts (KV read/write) */}
          <line x1={386} y1={406} x2={386} y2={434} stroke={C.green} strokeWidth={2} />
          <Arrow x1={420} y1={434} x2={420} y2={408} markerId={head} color={C.green} label="KV" labelDy={-2} />
        </g>

        <text x={w / 2} y={h - 10} textAnchor="middle" fontFamily={MONO} fontSize={10} fill="var(--text-dim)">
          clock set by PS PLL via --fclk (snaps to 1000/N MHz: 125, 142.9, 166.7, 200...)   |   record build runs at 200 MHz
        </text>
      </svg>
      <Caption>
        The whole model lives here. One resident INT4 weight image in UltraRAM is read
        through two independent ports by two 8-stream cohorts (the split-brain layout that
        gets to N=16), activations and the KV cache sit in BRAM, and a sequencer FSM drives
        the entire per-token forward with the CPU completely out of the loop. The only thing
        the host does per request is write a single random seed.
      </Caption>
    </figure>
  );
}

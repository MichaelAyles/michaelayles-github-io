import { Box, Arrow, ArrowHead, Roughen, Caption, C, HAND, MONO } from "./excali.jsx";

// Why the served speed was 1k while the fabric ran at 16k: sampling read 193 logits per
// token back to the host. Gumbel-max moves the draw on-chip; the host writes one seed.
export default function GumbelTax() {
  const w = 920;
  const h = 360;
  const f = "rgh-gum";
  const head = "ah-gum";
  const headR = "ah-gum-r";

  return (
    <figure style={{ margin: "2rem 0", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w, display: "block", margin: "0 auto" }}>
        <defs>
          <Roughen id={f} />
          <ArrowHead id={head} color={C.gray} />
          <ArrowHead id={headR} color={C.red} />
        </defs>

        <g filter={`url(#${f})`}>
          {/* BEFORE */}
          <text x={230} y={32} textAnchor="middle" fontFamily={HAND} fontSize={15} fontWeight="700" fill={C.red}>
            before: sample on the host
          </text>
          <Box x={40} y={60} w={150} h={70} stroke={C.blue} fill={C.blueFill} title="PL fabric" sub={["produces 193", "head logits"]} />
          <Box x={300} y={60} w={160} h={70} stroke={C.gray} fill={C.grayFill} title="A53 host" sub={["softmax + top-k", "draw on CPU"]} />
          {/* 193 reads */}
          <line x1={190} y1={85} x2={298} y2={85} stroke={C.red} strokeWidth={2.5} markerEnd={`url(#${headR})`} />
          <text x={244} y={78} textAnchor="middle" fontFamily={MONO} fontSize={9.5} fill={C.red}>193 reads</text>
          <text x={244} y={108} textAnchor="middle" fontFamily={MONO} fontSize={9.5} fill={C.red}>every token</text>
          <text x={230} y={168} textAnchor="middle" fontFamily={HAND} fontSize={13} fontWeight="700" fill={C.red}>
            ~58% of a reply, ~1,000 tok/s
          </text>

          {/* AFTER */}
          <text x={690} y={32} textAnchor="middle" fontFamily={HAND} fontSize={15} fontWeight="700" fill={C.green}>
            after: sample on the chip
          </text>
          <Box x={500} y={60} w={170} h={70} stroke={C.gray} fill={C.grayFill} title="A53 host" sub={["writes 1 seed", "per request"]} />
          <Box x={760} y={60} w={150} h={70} stroke={C.green} fill={C.greenFill} title="PL fabric" sub={["argmax + Gumbel", "noise on-chip"]} />
          <Arrow x1={670} y1={95} x2={758} y2={95} markerId={head} color={C.green} label="1 seed" labelDy={-6} />
          <text x={705} y={168} textAnchor="middle" fontFamily={HAND} fontSize={13} fontWeight="700" fill={C.green}>
            ~5,600 tok/s localhost (5.6x)
          </text>

          {/* identity box */}
          <rect x={140} y={210} width={640} height={96} rx={12} fill={C.violetFill} stroke={C.violet} strokeWidth={2} />
          <text x={460} y={238} textAnchor="middle" fontFamily={HAND} fontSize={13} fontWeight="700" fill="var(--text-primary)">
            the identity that kills the readback
          </text>
          <text x={460} y={266} textAnchor="middle" fontFamily={MONO} fontSize={12} fill="var(--text-primary)">
            sample softmax(logit / T)  ==  argmax( logit + T * g ),   g ~ Gumbel
          </text>
          <text x={460} y={290} textAnchor="middle" fontFamily={MONO} fontSize={10} fill="var(--text-secondary)">
            the fabric already has an argmax. seed = 0 zeroes the noise, so greedy is bit-exact.
          </text>
        </g>

        <text x={w / 2} y={h - 6} textAnchor="middle" fontFamily={MONO} fontSize={10} fill="var(--text-dim)">
          the fabric record never moved; only the straw around it got wider
        </text>
      </svg>
      <Caption>
        The fabric decoded in 7 ms but the reply landed in 100 ms, and almost all of the gap
        was one unmeasured loop: to sample with temperature the host pulled all 193 head
        logits back over /dev/mem every single token. The Gumbel-max trick turns sampling
        into the argmax the fabric already computes, so the host writes one seed per request
        instead. Round-trip went up about 5.6x with the fabric record untouched.
      </Caption>
    </figure>
  );
}

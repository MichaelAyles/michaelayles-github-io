import { Roughen, Caption, C, HAND, MONO } from "./excali.jsx";

// The trick that makes the reply appear the instant you press Enter: each keystroke
// appends one token to the KV cache and fires a speculative completion in the gap
// before the next keystroke. By Enter, the answer is already computed and buffered;
// the keypress is pure rendering, one frame, zero inference.
export default function SpeculativeTyping() {
  const w = 940;
  const h = 320;
  const f = "rgh-spec";

  const x0 = 40;
  const xEnd = 792;
  const laneY = { type: 96, fabric: 168, buffer: 232 };

  // five keystrokes of "once " roughly 90 ms apart, then Enter
  const keys = ["o", "n", "c", "e", "␣"];
  const kx = keys.map((_, i) => x0 + 70 + i * 110);
  const enterX = kx[kx.length - 1] + 150;

  return (
    <figure style={{ margin: "2rem 0", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w, display: "block", margin: "0 auto" }}>
        <defs>
          <Roughen id={f} />
        </defs>

        <text x={w / 2} y={26} textAnchor="middle" fontFamily={HAND} fontSize={17} fontWeight="700" fill="var(--text-primary)">
          the reply is finished before you press Enter
        </text>
        <text x={w / 2} y={46} textAnchor="middle" fontFamily={MONO} fontSize={10.5} fill="var(--text-secondary)">
          every keystroke appends one token and speculatively decodes the answer in the gap before the next key
        </text>

        <g filter={`url(#${f})`}>
          {/* lane labels */}
          <text x={x0} y={laneY.type - 26} fontFamily={HAND} fontSize={12.5} fontWeight="700" fill="var(--text-primary)">you type</text>
          <text x={x0} y={laneY.fabric - 22} fontFamily={HAND} fontSize={12.5} fontWeight="700" fill="var(--text-primary)">fabric</text>
          <text x={x0} y={laneY.buffer - 20} fontFamily={HAND} fontSize={12.5} fontWeight="700" fill="var(--text-primary)">client buffer</text>

          {/* timeline baselines */}
          {Object.values(laneY).map((y, i) => (
            <line key={i} x1={x0} y1={y} x2={xEnd} y2={y} stroke={C.gray} strokeWidth={1.5} opacity={0.55} />
          ))}

          {/* keystrokes + the speculative inference each one triggers */}
          {kx.map((x, i) => {
            const gapEnd = i < kx.length - 1 ? kx[i + 1] : enterX;
            const specW = 26; // fabric sliver: one append + a short completion, well inside the gap
            return (
              <g key={i}>
                {/* keystroke tick */}
                <line x1={x} y1={laneY.type - 16} x2={x} y2={laneY.type + 16} stroke={C.blue} strokeWidth={2.5} />
                <circle cx={x} cy={laneY.type} r={6} fill={C.blueFill} stroke={C.blue} strokeWidth={2} />
                <text x={x} y={laneY.type - 24} textAnchor="middle" fontFamily={MONO} fontSize={11} fill="var(--text-secondary)">{keys[i]}</text>

                {/* debounce -> speculative decode, drawn as a small block just after the key */}
                <rect x={x + 8} y={laneY.fabric - 12} width={specW} height={24} rx={4} ry={4}
                  fill={C.tealFill} stroke={C.teal} strokeWidth={2} />
                {/* it finishes well before the next keystroke: idle gap after it */}
                <line x1={x + 8 + specW} y1={laneY.fabric} x2={gapEnd - 6} y2={laneY.fabric}
                  stroke={C.gray} strokeWidth={1} strokeDasharray="3 5" opacity={0.6} />

                {/* buffer updates to "caught up to the cursor" */}
                <circle cx={x + 8 + specW + 4} cy={laneY.buffer} r={5} fill={C.greenFill} stroke={C.green} strokeWidth={2} />
              </g>
            );
          })}

          {/* the "gap" annotation between two keys */}
          <line x1={kx[1]} y1={laneY.type + 30} x2={kx[2]} y2={laneY.type + 30} stroke={C.gray} strokeWidth={1} />
          <text x={(kx[1] + kx[2]) / 2} y={laneY.type + 44} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="var(--text-dim)">
            ~90 ms between keys
          </text>
          <text x={kx[1] + 30} y={laneY.fabric + 30} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="var(--text-dim)">
            ~6.6 ms of work
          </text>

          {/* Enter + the blit */}
          <line x1={enterX} y1={68} x2={enterX} y2={laneY.buffer + 34} stroke={C.green} strokeWidth={2.5} strokeDasharray="5 4" />
          <text x={enterX} y={62} textAnchor="middle" fontFamily={HAND} fontSize={13} fontWeight="700" fill={C.green}>Enter</text>

          {/* blit box */}
          <rect x={enterX + 14} y={laneY.buffer - 22} width={120} height={44} rx={8} ry={8}
            fill={C.greenFill} stroke={C.green} strokeWidth={2} />
          <text x={enterX + 74} y={laneY.buffer - 3} textAnchor="middle" fontFamily={HAND} fontSize={12} fontWeight="700" fill="var(--text-primary)">blit</text>
          <text x={enterX + 74} y={laneY.buffer + 13} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="var(--text-secondary)">1 frame, 0 infer</text>

          {/* freshness-check note */}
          <text x={enterX + 14} y={laneY.fabric - 4} fontFamily={MONO} fontSize={9} fill="var(--text-dim)">
            buffer matches input?
          </text>
          <text x={enterX + 14} y={laneY.fabric + 10} fontFamily={MONO} fontSize={9} fill="var(--text-dim)">
            yes → blit · no → one real round trip
          </text>
        </g>

        <text x={w / 2} y={h - 8} textAnchor="middle" fontFamily={MONO} fontSize={10} fill="var(--text-dim)">
          TTFT was spent during typing, for free: the keypress renders an answer that already exists
        </text>
      </svg>
      <Caption>
        A KV cache is append-only, so each keystroke is one token to append, not a
        re-read of the whole prompt. At ~6.6 ms per speculative reply and ~90 ms between
        keystrokes, the completion for the prompt-so-far is always finished before you
        hit the next key. Enter just blits the buffered answer in a single 60 Hz frame.
        If a fast typist outruns the last speculation, a freshness check fires one real
        round trip instead of showing a stale reply.
      </Caption>
    </figure>
  );
}

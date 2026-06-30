import { Box, Arrow, ArrowHead, Roughen, Caption, C, HAND } from "./excali.jsx";

// Every hop from a browser on Hacker News to the transistors on the Kria.
export default function NetworkTopology() {
  const w = 940;
  const h = 430;
  const f = "rgh-net";
  const head = "ah-net";
  const headViolet = "ah-net-v";

  return (
    <figure style={{ margin: "2rem 0", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w, display: "block", margin: "0 auto" }}>
        <defs>
          <Roughen id={f} />
          <ArrowHead id={head} color={C.gray} />
          <ArrowHead id={headViolet} color={C.violet} />
        </defs>

        <text x={w / 2} y={26} textAnchor="middle" fontFamily={HAND} fontSize={17} fontWeight="700" fill="var(--text-primary)">
          browser to transistor: the whole round trip
        </text>

        <g filter={`url(#${f})`}>
          {/* main chain */}
          <Box x={20} y={70} w={150} h={86} stroke={C.blue} fill={C.blueFill}
            title="your browser" sub={["wss://", "chat.mikeayles.com", "(seen on HN)"]} />

          <Box x={210} y={70} w={160} h={86} stroke={C.orange} fill={C.orangeFill}
            title="Cloudflare edge" sub={["named tunnel", "TLS + DDoS buffer", "no open ports"]} />

          <Box x={410} y={70} w={170} h={86} stroke={C.green} fill={C.greenFill}
            title="the Precision box" sub={["asyncio WS :8090", "batch + stream", "no /dev/mem"]} />

          <Box x={620} y={70} w={150} h={86} stroke={C.teal} fill={C.tealFill}
            title="Kria A53 daemon" sub={["root :9099", "/dev/mem MMIO", "host loop"]} />

          <Box x={808} y={70} w={112} h={86} stroke={C.red} fill={C.redFill}
            title="PL fabric" sub={["the model", "0 DRAM", "in the loop"]} />

          {/* dashboard side channel */}
          <Box x={410} y={300} w={170} h={80} stroke={C.violet} fill={C.violetFill}
            title="dash worker" sub={["Cloudflare Worker", "Durable Object", "off-board telemetry"]} />

          {/* arrows main chain */}
          <Arrow x1={170} y1={113} x2={208} y2={113} markerId={head} color={C.gray} />
          <Arrow x1={370} y1={113} x2={408} y2={113} markerId={head} color={C.gray} label="127.0.0.1" labelDy={-8} />
          <Arrow x1={580} y1={113} x2={618} y2={113} markerId={head} color={C.gray} label="Tailscale GigE" labelDy={-8} />
          <Arrow x1={770} y1={113} x2={806} y2={113} markerId={head} color={C.gray} label="AXI" labelDy={-8} />

          {/* return path hint */}
          <Arrow x1={806} y1={140} x2={172} y2={140} markerId={head} color={C.gray} dashed label="tokens flow back the same chain" labelDy={14} />

          {/* dashboard branch */}
          <Arrow x1={495} y1={158} x2={495} y2={298} markerId={headViolet} color={C.violet} label="1 Hz push" labelDy={-4} />
          <line x1={580} y1={340} x2={300} y2={340} stroke={C.violet} strokeWidth={2} strokeDasharray="6 5" />
          <Arrow x1={300} y1={340} x2={300} y2={158} markerId={headViolet} color={C.violet} />
          <text x={300} y={250} textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize={9.5} fill="var(--text-secondary)">
            dash.mikeayles.com
          </text>
        </g>

        <text x={w / 2} y={h - 8} textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize={10} fill="var(--text-dim)">
          chat = long-lived WebSocket (cannot be a Worker)   |   dashboard = stateless Worker (stays up when the board is drowning)
        </text>
      </svg>
      <Caption>
        Two public hostnames, two completely different ship mechanisms. The chat is a
        WebSocket that has to talk to the FPGA over the LAN, so it runs through a Cloudflare
        tunnel to a serving box and on to the Kria. The load dashboard is a stateless
        Cloudflare Worker, deliberately hosted off the board so it survives the moment the
        board cannot.
      </Caption>
    </figure>
  );
}

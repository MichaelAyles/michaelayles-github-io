import { useEffect, useRef, useState, useCallback } from "react";

// Live chat widget for "Kevin on Kria".
//
// Talks directly to the public WebSocket endpoint at wss://chat.mikeayles.com.
// That single origin serves both the chat page and the wss:// upgrade, fronted by
// a Cloudflare named tunnel -> serving box :8090 -> Kria A53 daemon :9099 -> PL fabric.
//
// Protocol (JSON frames over one socket):
//   client -> server:  {type:"enter", prompt, seq, blitted:false}
//   server -> client:  {type:"hello", client_id}
//                      {type:"stream", prompt, text}            // incremental chars
//                      {type:"stream_end", prompt, completion}  // final tidied reply
//                      {type:"authoritative", prompt, completion, infer_ms} // one-shot path
//                      {type:"stats", fabric_tok_s, trip_tok_s, live_users, ...}
//
// No CORS to worry about: WebSocket is not gated by the same-origin fetch policy,
// and the server does not restrict Origin.

const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";
const WS_URL = "wss://chat.mikeayles.com";

const SUGGESTIONS = [
  "once upon time",
  "there be little girl",
  "the dog run fast",
  "kevin like eat",
];

export default function KevinChat({ height = 460 }) {
  const [messages, setMessages] = useState([
    {
      role: "kevin",
      text: "few word do trick. type something, kevin reply from inside the chip.",
    },
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("connecting");
  const [stats, setStats] = useState(null);

  const wsRef = useRef(null);
  const seqRef = useRef(0);
  const pendingRef = useRef(null); // index of the in-flight kevin bubble
  const sentAtRef = useRef(0);
  const scrollRef = useRef(null);
  const retryRef = useRef(null);

  const setKevin = useCallback((updater) => {
    setMessages((prev) => {
      const i = pendingRef.current;
      if (i == null || i >= prev.length) return prev;
      const next = prev.slice();
      next[i] = { ...next[i], ...updater(next[i]) };
      return next;
    });
  }, []);

  const connect = useCallback(() => {
    let ws;
    try {
      ws = new WebSocket(WS_URL);
    } catch (e) {
      setStatus("offline");
      return;
    }
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => setStatus("live");
    ws.onclose = () => {
      setStatus("offline");
      retryRef.current = setTimeout(connect, 2000);
    };
    ws.onerror = () => {
      try {
        ws.close();
      } catch (e) {
        /* noop */
      }
    };
    ws.onmessage = (ev) => {
      let m;
      try {
        m = JSON.parse(ev.data);
      } catch (e) {
        return;
      }
      switch (m.type) {
        case "hello":
          setStatus("live");
          break;
        case "stream":
          setKevin((b) => ({
            text: (b.streaming ? b.text : "") + m.text,
            streaming: true,
          }));
          break;
        case "stream_end":
          if (m.completion) setKevin(() => ({ text: m.completion }));
          finishReply();
          break;
        case "authoritative":
          setKevin(() => ({ text: m.completion || "(kevin say nothing)" }));
          finishReply();
          break;
        case "stats":
          setStats(m);
          break;
        default:
          break;
      }
    };
  }, [setKevin]);

  const finishReply = useCallback(() => {
    const rtt = performance.now() - sentAtRef.current;
    setKevin((b) => ({ rttMs: Math.round(rtt) }));
    pendingRef.current = null;
  }, [setKevin]);

  useEffect(() => {
    connect();
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        try {
          wsRef.current.close();
        } catch (e) {
          /* noop */
        }
      }
    };
  }, [connect]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(
    (raw) => {
      const prompt = (raw ?? input).trim();
      const ws = wsRef.current;
      if (!prompt || pendingRef.current != null) return;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      seqRef.current += 1;
      sentAtRef.current = performance.now();

      setMessages((prev) => {
        const next = [
          ...prev,
          { role: "user", text: prompt },
          { role: "kevin", text: "", streaming: false, thinking: true },
        ];
        pendingRef.current = next.length - 1;
        return next;
      });
      setInput("");

      ws.send(
        JSON.stringify({
          type: "enter",
          prompt,
          seq: seqRef.current,
          blitted: false,
        })
      );

      // Safety: if no reply lands, release the lock.
      setTimeout(() => {
        if (pendingRef.current != null) {
          setKevin((b) =>
            b.text ? {} : { text: "(kevin quiet. try again.)" }
          );
          pendingRef.current = null;
        }
      }, 15000);
    },
    [input, setKevin]
  );

  const dot =
    status === "live" ? "#22c55e" : status === "connecting" ? "#eab308" : "#ef4444";

  return (
    <figure style={{ margin: "2rem 0" }}>
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          background: "var(--surface)",
          overflow: "hidden",
          fontFamily: mono,
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "10px 14px",
            borderBottom: "1px solid var(--border)",
            fontSize: "0.8rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: dot,
                boxShadow: `0 0 6px ${dot}`,
                display: "inline-block",
              }}
            />
            <strong style={{ color: "var(--text-primary)" }}>kevin on kria</strong>
            <span style={{ color: "var(--text-dim)" }}>
              {status === "live"
                ? "live from the fabric"
                : status === "connecting"
                ? "connecting..."
                : "offline"}
            </span>
          </div>
          {stats && (
            <div style={{ color: "var(--text-secondary)", textAlign: "right" }}>
              {stats.fabric_tok_s != null && (
                <span title="raw fabric decode speed">
                  fabric {Math.round(stats.fabric_tok_s).toLocaleString()} tok/s
                </span>
              )}
            </div>
          )}
        </div>

        {/* messages */}
        <div
          ref={scrollRef}
          style={{
            position: "relative",
            height,
            overflowY: "auto",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {status === "offline" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textAlign: "center",
                padding: "0 24px",
                backdropFilter: "blur(2px)",
                background: "var(--surface)",
                opacity: 0.94,
              }}
            >
              <div style={{ fontSize: "1.8rem" }}>😴</div>
              <strong style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
                sorry, kevin is sleeping right now
              </strong>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", maxWidth: 360 }}>
                The Kria board is offline or resting between demos. The widget reconnects on its
                own. Try again in a bit, or open the{" "}
                <a href="https://chat.mikeayles.com" target="_blank" rel="noopener noreferrer">
                  full demo
                </a>
                .
              </span>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background:
                    m.role === "user" ? "#3b82f6" : "var(--bg, rgba(127,127,127,0.12))",
                  color: m.role === "user" ? "#fff" : "var(--text-primary)",
                  border:
                    m.role === "user" ? "none" : "1px solid var(--border)",
                }}
              >
                {m.thinking && !m.text ? (
                  <span style={{ color: "var(--text-dim)" }}>kevin think...</span>
                ) : (
                  m.text
                )}
              </div>
              {m.role === "kevin" && m.rttMs != null && (
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--text-dim)",
                    marginTop: 3,
                    marginLeft: 2,
                  }}
                >
                  round-trip {m.rttMs} ms
                </div>
              )}
            </div>
          ))}
        </div>

        {/* suggestions */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            padding: "0 14px 8px",
          }}
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={status !== "live"}
              style={{
                fontFamily: mono,
                fontSize: "0.72rem",
                color: "var(--text-secondary)",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "3px 9px",
                cursor: status === "live" ? "pointer" : "default",
                opacity: status === "live" ? 1 : 0.5,
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          style={{
            display: "flex",
            gap: 8,
            padding: "10px 14px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="say lot word..."
            maxLength={512}
            style={{
              flex: 1,
              fontFamily: mono,
              fontSize: "0.85rem",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={status !== "live"}
            style={{
              fontFamily: mono,
              fontSize: "0.85rem",
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: status === "live" ? "#3b82f6" : "var(--border)",
              color: "#fff",
              cursor: status === "live" ? "pointer" : "default",
            }}
          >
            send
          </button>
        </form>
      </div>

      <figcaption
        style={{
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          marginTop: 8,
          textAlign: "center",
        }}
      >
        A real conversation with a 3.16M-parameter model living entirely inside the
        on-chip memory of a $250 Kria KV260 FPGA. No GPU, no DDR in the token loop. Output
        is deliberately telegraphic: the compression is the speed. If the dot is red the
        board is asleep or under load. {" "}
        <a href="https://chat.mikeayles.com" target="_blank" rel="noopener noreferrer">
          Open the full demo
        </a>
        .
      </figcaption>
    </figure>
  );
}

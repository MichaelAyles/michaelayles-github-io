const mono = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";

export default function NetworkDiagram() {
  const w = 500;
  const h = 240;
  const inputs = ["angle", "distance", "visible"];
  const outputs = ["left", "right", "shoot", "forward"];
  const hiddenCount = 16;

  const inputX = 60;
  const hiddenX = 250;
  const outputX = 440;

  const inputPositions = inputs.map((_, i) => ({
    x: inputX,
    y: 40 + i * 80,
  }));

  const hiddenPositions = Array.from({ length: hiddenCount }, (_, i) => ({
    x: hiddenX,
    y: 12 + i * 14,
  }));

  const outputPositions = outputs.map((_, i) => ({
    x: outputX,
    y: 30 + i * 60,
  }));

  return (
    <figure style={{ margin: "2rem 0", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        style={{ maxWidth: w, display: "block", margin: "0 auto" }}
      >
        {/* Connections: input -> hidden */}
        {inputPositions.map((inp, i) =>
          hiddenPositions
            .filter((_, j) => j % 3 === i % 3 || j % 5 === 0)
            .map((hid, j) => (
              <line
                key={`ih-${i}-${j}`}
                x1={inp.x + 8} y1={inp.y} x2={hid.x - 4} y2={hid.y}
                stroke="var(--border)" strokeWidth={0.5} opacity={0.4}
              />
            ))
        )}
        {/* Connections: hidden -> output */}
        {hiddenPositions
          .filter((_, j) => j % 2 === 0)
          .map((hid, j) =>
            outputPositions.map((out, k) => (
              <line
                key={`ho-${j}-${k}`}
                x1={hid.x + 4} y1={hid.y} x2={out.x - 8} y2={out.y}
                stroke="var(--border)" strokeWidth={0.5} opacity={0.4}
              />
            ))
          )}
        {/* Input nodes */}
        {inputPositions.map((pos, i) => (
          <g key={`i${i}`}>
            <circle
              cx={pos.x} cy={pos.y} r={8}
              fill="var(--surface)" stroke="#3b82f6" strokeWidth={1}
            />
            <text
              x={pos.x - 16} y={pos.y + 4} textAnchor="end"
              fill="var(--text-secondary)" fontSize={10} fontFamily={mono}
            >
              {inputs[i]}
            </text>
          </g>
        ))}
        {/* Hidden nodes */}
        {hiddenPositions.map((pos, i) => (
          <circle
            key={`h${i}`}
            cx={pos.x} cy={pos.y} r={4}
            fill="var(--surface)" stroke="#eab308" strokeWidth={0.5}
          />
        ))}
        {/* Output nodes */}
        {outputPositions.map((pos, i) => (
          <g key={`o${i}`}>
            <circle
              cx={pos.x} cy={pos.y} r={8}
              fill="var(--surface)" stroke="#ef4444" strokeWidth={1}
            />
            <text
              x={pos.x + 16} y={pos.y + 4} textAnchor="start"
              fill="var(--text-secondary)" fontSize={10} fontFamily={mono}
            >
              {outputs[i]}
            </text>
          </g>
        ))}
        {/* Labels */}
        <text x={inputX} y={h - 4} textAnchor="middle" fill="var(--text-dim)" fontSize={9} fontFamily={mono}>
          3 inputs
        </text>
        <text x={hiddenX} y={h - 4} textAnchor="middle" fill="var(--text-dim)" fontSize={9} fontFamily={mono}>
          16 hidden (tanh)
        </text>
        <text x={outputX} y={h - 4} textAnchor="middle" fill="var(--text-dim)" fontSize={9} fontFamily={mono}>
          4 outputs (softmax)
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
        The entire network. 3 inputs, 16 hidden neurons, 4 outputs. 132 parameters total.
      </figcaption>
    </figure>
  );
}

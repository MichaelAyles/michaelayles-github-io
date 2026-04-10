import { useState } from 'react';

const COLORS = {
  claude: '#f97316',
  copilot: '#3b82f6',
};

const DATA = {
  claude: {
    native: { recall: 0.919, precision: 0.443, f1: 0.562, time: 46.7, n: 60 },
    rag: { recall: 0.939, precision: 0.444, f1: 0.572, time: 47.4, n: 60 },
    categories: {
      exact: { native: { recall: 0.933, time: 31.7 }, rag: { recall: 0.933, time: 37.9 } },
      concept: { native: { recall: 0.944, time: 51.1 }, rag: { recall: 0.967, time: 53.5 } },
      cross: { native: { recall: 0.920, time: 52.7 }, rag: { recall: 0.978, time: 46.4 } },
      refactor: { native: { recall: 0.878, time: 51.2 }, rag: { recall: 0.878, time: 52.0 } },
    },
  },
  copilot: {
    native: { recall: 0.938, precision: 0.427, f1: 0.553, time: 56.7, n: 60 },
    rag: { recall: 0.908, precision: 0.444, f1: 0.561, time: 54.8, n: 60 },
    categories: {
      exact: { native: { recall: 0.933, time: 47.4 }, rag: { recall: 1.000, time: 39.3 } },
      concept: { native: { recall: 0.967, time: 62.9 }, rag: { recall: 0.967, time: 62.2 } },
      cross: { native: { recall: 0.961, time: 62.3 }, rag: { recall: 0.978, time: 58.2 } },
      refactor: { native: { recall: 0.889, time: 54.3 }, rag: { recall: 0.689, time: 59.5 } },
    },
  },
};

function Bar({ value, max, color, label, sublabel }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
        <span>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color }}>{sublabel}</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: '4px',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

function DeltaChip({ value, unit = '', invert = false }) {
  const positive = invert ? value < 0 : value > 0;
  const color = Math.abs(value) < 0.005 ? '#94a3b8' : positive ? '#22c55e' : '#ef4444';
  const sign = value > 0 ? '+' : '';
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: '0.75rem',
      color,
      background: 'rgba(255,255,255,0.05)',
      padding: '1px 6px',
      borderRadius: '3px',
    }}>
      {sign}{typeof value === 'number' ? value.toFixed(3) : value}{unit}
    </span>
  );
}

export default function RAGBenchmarkChart() {
  const [view, setView] = useState('overview');
  const [metric, setMetric] = useState('recall');

  const tools = ['claude', 'copilot'];
  const categories = ['exact', 'concept', 'cross', 'refactor'];

  const buttonStyle = (active) => ({
    padding: '6px 14px',
    fontSize: '0.8rem',
    border: active ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    background: active ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
    color: active ? '#f97316' : '#94a3b8',
    cursor: 'pointer',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  });

  return (
    <div style={{
      background: 'var(--surface, #1a1a2e)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'var(--text, #e2e8f0)',
    }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setView('overview')} style={buttonStyle(view === 'overview')}>Overview</button>
        <button onClick={() => setView('categories')} style={buttonStyle(view === 'categories')}>By Category</button>
        <button onClick={() => setView('speed')} style={buttonStyle(view === 'speed')}>Speed vs Quality</button>
      </div>

      {view === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {tools.map((tool) => {
              const nat = DATA[tool].native;
              const rag = DATA[tool].rag;
              const color = COLORS[tool];
              return (
                <div key={tool} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 4px', color, textTransform: 'capitalize' }}>{tool === 'claude' ? 'Claude Code' : 'GitHub Copilot'}</h4>
                  <p style={{ margin: '0 0 12px', fontSize: '0.75rem', color: '#64748b' }}>
                    Haiku 4.5 &middot; {nat.n + rag.n} runs
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    {[['Recall', 'recall'], ['Precision', 'precision'], ['F1', 'f1']].map(([label, key]) => (
                      <div key={key} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>{label}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem' }}>
                          {nat[key].toFixed(3)}
                        </div>
                        <DeltaChip value={rag[key] - nat[key]} />
                      </div>
                    ))}
                  </div>

                  <Bar value={nat.recall} max={1} color={`${color}99`} label="Native recall" sublabel={nat.recall.toFixed(3)} />
                  <Bar value={rag.recall} max={1} color={color} label="RAG recall" sublabel={rag.recall.toFixed(3)} />

                  <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#64748b' }}>
                    Speed: {nat.time.toFixed(0)}s native &rarr; {rag.time.toFixed(0)}s RAG{' '}
                    <DeltaChip value={rag.time - nat.time} unit="s" invert />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'categories' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={() => setMetric('recall')} style={buttonStyle(metric === 'recall')}>Recall</button>
            <button onClick={() => setMetric('time')} style={buttonStyle(metric === 'time')}>Speed</button>
          </div>

          {categories.map((cat) => (
            <div key={cat} style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px', textTransform: 'capitalize', fontSize: '0.9rem' }}>{cat}</h4>
              {tools.map((tool) => {
                const d = DATA[tool].categories[cat];
                const color = COLORS[tool];
                const max = metric === 'recall' ? 1 : 100;
                const toolLabel = tool === 'claude' ? 'Claude' : 'Copilot';
                return (
                  <div key={tool}>
                    <Bar
                      value={d.native[metric]}
                      max={max}
                      color={`${color}99`}
                      label={`${toolLabel} native`}
                      sublabel={metric === 'recall' ? d.native[metric].toFixed(3) : `${d.native[metric].toFixed(0)}s`}
                    />
                    <Bar
                      value={d.rag[metric]}
                      max={max}
                      color={color}
                      label={`${toolLabel} RAG`}
                      sublabel={metric === 'recall' ? d.rag[metric].toFixed(3) : `${d.rag[metric].toFixed(0)}s`}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {view === 'speed' && (
        <div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 0 }}>
            Each dot is a tool/mode combination. Top-left is the ideal: fast and accurate.
          </p>
          <div style={{ position: 'relative', height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'rotate(-90deg) translateX(50%)', fontSize: '0.7rem', color: '#64748b' }}>
              Recall
            </div>
            <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#64748b' }}>
              Mean response time (s)
            </div>

            {tools.map((tool) => {
              const color = COLORS[tool];
              return ['native', 'rag'].map((mode) => {
                const d = DATA[tool][mode];
                const x = ((d.time - 40) / 25) * 80 + 10;
                const y = (1 - d.recall) * 80 + 10;
                const toolLabel = tool === 'claude' ? 'Claude' : 'Copilot';
                return (
                  <div key={`${tool}-${mode}`} style={{
                    position: 'absolute',
                    left: `${Math.min(90, Math.max(5, x))}%`,
                    top: `${Math.min(85, Math.max(5, y))}%`,
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: mode === 'native' ? '50%' : '3px',
                      background: color,
                      margin: '0 auto 4px',
                      border: '2px solid rgba(255,255,255,0.3)',
                    }} />
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {toolLabel} {mode}
                    </span>
                  </div>
                );
              });
            })}
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px', fontSize: '0.7rem', color: '#64748b' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#f97316', marginRight: 4 }} /> Claude</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', marginRight: 4 }} /> Copilot</span>
            <span>&#9679; native &nbsp; &#9632; RAG</span>
          </div>
        </div>
      )}

      <p style={{ fontSize: '0.65rem', color: '#475569', marginTop: '16px', marginBottom: 0 }}>
        Benchmark: 60 queries across 4 categories (exact symbol, conceptual, cross-cutting, refactoring) against a ~200-file TypeScript codebase.
        Both tools on Haiku 4.5. RAG via MCP server (FAISS + SQLite FTS5).
        Per-tool semaphore; sequential execution within each tool. Native and RAG phases run separately.
      </p>
    </div>
  );
}

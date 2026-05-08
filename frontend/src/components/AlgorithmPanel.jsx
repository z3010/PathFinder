import React from 'react';

const ALGORITHMS = [
  { key: 'astar',             label: 'A* (A-Star)',        icon: '⭐', desc: 'Optimal & informed — uses heuristic + cost' },
  { key: 'dijkstra',          label: 'Dijkstra',           icon: '🔵', desc: 'Optimal, explores by cumulative cost' },
  { key: 'bfs',               label: 'BFS',                icon: '🟢', desc: 'Shortest path in unweighted graphs' },
  { key: 'dfs',               label: 'DFS',                icon: '🟠', desc: 'Deep exploration, not optimal' },
  { key: 'greedy',            label: 'Greedy Best-First',  icon: '🟡', desc: 'Heuristic only — fast but not optimal' },
  { key: 'bfs_bidirectional', label: 'Bidirectional BFS',  icon: '🔀', desc: 'Two frontiers meet in the middle' },
];

const Btn = ({ onClick, disabled, children, color }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#2d3748' : color || '#667eea', color: disabled ? '#718096' : '#fff',
      fontWeight: 700, fontSize: 14, transition: 'all 0.2s', opacity: disabled ? 0.6 : 1 }}>
    {children}
  </button>
);

export default function AlgorithmPanel({ algorithm, setAlgorithm, speed, setSpeed, onRun, onReset, isRunning, phase }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#a0aec0', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>
        Algorithm
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        {ALGORITHMS.map(a => (
          <button key={a.key}
            onClick={() => setAlgorithm(a.key)}
            style={{ padding: '8px 10px', borderRadius: 8, border: `2px solid ${algorithm === a.key ? '#667eea' : 'transparent'}`,
              background: algorithm === a.key ? '#1e2340' : '#242740', color: algorithm === a.key ? '#e2e8f0' : '#a0aec0',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{a.icon} {a.label}</div>
            <div style={{ fontSize: 10, color: '#718096', marginTop: 2 }}>{a.desc}</div>
          </button>
        ))}
      </div>

      {/* Speed */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#a0aec0', fontWeight: 600 }}>Speed</span>
          <span style={{ fontSize: 12, color: '#667eea' }}>{speed < 33 ? 'Slow' : speed < 66 ? 'Medium' : 'Fast'}</span>
        </div>
        <input type="range" min={1} max={99} value={speed} onChange={e => setSpeed(+e.target.value)}
          style={{ width: '100%', accentColor: '#667eea' }} />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn onClick={onRun} disabled={isRunning} color="#667eea">
          {phase === 'idle' ? '▶ Run' : phase === 'done' ? '▶ Run Again' : '⏳ Running...'}
        </Btn>
        <Btn onClick={onReset} color="#4a5568">↺ Reset</Btn>
      </div>

      {/* Legend key */}
      <div style={{ marginTop: 20, padding: 10, background: '#242740', borderRadius: 8, fontSize: 11, color: '#718096', lineHeight: 1.8 }}>
        <div style={{ fontWeight: 700, color: '#a0aec0', marginBottom: 4 }}>🗺 Map Legend</div>
        <div>🔑 Key — must collect first</div>
        <div>🚪 Gate — needs key to pass</div>
        <div>🤖 Start → 🏁 Goal</div>
        <div>⚡ Hazard — penalty cost</div>
        <div>C — Charger — restores energy</div>
      </div>
    </div>
  );
}

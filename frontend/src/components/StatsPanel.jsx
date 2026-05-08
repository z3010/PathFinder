import React from 'react';

function Stat({ label, value, color }) {
  return (
    <div style={{ background: '#242740', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
      <div style={{ fontSize: 10, color: '#718096', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: color || '#e2e8f0' }}>{value ?? '—'}</div>
    </div>
  );
}

export default function StatsPanel({ result, animState }) {
  if (!result) return null;

  const phase = animState.phase;
  const visitedShown = animState.visitedIdx;
  const pathShown    = animState.pathIdx;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#a0aec0', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>
        Stats
      </div>

      <div style={{ padding: '6px 10px', borderRadius: 6, background: result.found ? '#1a3a2a' : '#3a1a1a',
        color: result.found ? '#68d391' : '#fc8181', fontWeight: 700, fontSize: 13, marginBottom: 10, textAlign: 'center' }}>
        {result.found ? '✓ Path Found' : '✗ No Path'}
      </div>

      <Stat label="Algorithm"      value={result.algorithm} color="#667eea" />
      <Stat label="Nodes Expanded" value={result.expanded}  color="#f6ad55" />
      <Stat label="Path Length"    value={result.found ? result.path.length : 'N/A'} color="#68d391" />
      <Stat label="Explored (anim)" value={visitedShown} color="#90cdf4" />

      {phase === 'pathing' || phase === 'done' ? (
        <Stat label="Path Steps (anim)" value={pathShown} color="#68d391" />
      ) : null}

      {result.found && phase === 'done' && (
        <div style={{ marginTop: 10, padding: 10, background: '#242740', borderRadius: 8, fontSize: 11, color: '#a0aec0' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Route summary</div>
          <div>Start → Key → Gate → Goal</div>
          <div style={{ marginTop: 4, color: '#68d391' }}>✓ Animation complete</div>
        </div>
      )}
    </div>
  );
}

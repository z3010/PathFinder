import React from 'react';

const ALGO_COLORS = {
  astar:             '#667eea',
  dijkstra:          '#4299e1',
  bfs:               '#48bb78',
  dfs:               '#ed8936',
  greedy:            '#ecc94b',
  bfs_bidirectional: '#9f7aea',
};

export default function ComparePanel({ data, onRefresh }) {
  if (!data) return (
    <div style={{ color: '#718096', textAlign: 'center', marginTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
      <div>Loading comparison...</div>
    </div>
  );

  const entries = Object.entries(data);
  const maxExpanded = Math.max(...entries.map(([, v]) => v.expanded || 0));
  const maxPath     = Math.max(...entries.map(([, v]) => v.path_len || 0));

  return (
    <div style={{ width: '100%', maxWidth: 900, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Algorithm Comparison</h2>
        <button onClick={onRefresh}
          style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#667eea', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          ↺ Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
        {entries.map(([key, val]) => (
          <div key={key} style={{ background: '#1a1d2e', border: `2px solid ${ALGO_COLORS[key]}33`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: ALGO_COLORS[key] }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>{val.algorithm}</span>
            </div>

            {val.error ? (
              <div style={{ color: '#fc8181', fontSize: 12 }}>Error: {val.error}</div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: val.found ? '#68d391' : '#fc8181', fontWeight: 700, fontSize: 13 }}>
                    {val.found ? '✓ Found' : '✗ Not Found'}
                  </span>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a0aec0', marginBottom: 4 }}>
                    <span>Nodes Expanded</span><span style={{ color: '#f6ad55' }}>{val.expanded}</span>
                  </div>
                  <div style={{ height: 6, background: '#2d3748', borderRadius: 3 }}>
                    <div style={{ height: '100%', borderRadius: 3, background: ALGO_COLORS[key], width: `${(val.expanded / maxExpanded) * 100}%`, transition: 'width 0.5s' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a0aec0', marginBottom: 4 }}>
                    <span>Path Length</span><span style={{ color: '#68d391' }}>{val.path_len ?? 'N/A'}</span>
                  </div>
                  <div style={{ height: 6, background: '#2d3748', borderRadius: 3 }}>
                    <div style={{ height: '100%', borderRadius: 3, background: '#68d391',
                      width: `${val.path_len ? (val.path_len / maxPath) * 100 : 0}%`, transition: 'width 0.5s' }} />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Summary table */}
      <div style={{ background: '#1a1d2e', borderRadius: 12, overflow: 'hidden', border: '1px solid #2d3748' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#242740' }}>
              <th style={th}>Algorithm</th>
              <th style={th}>Found?</th>
              <th style={th}>Path Length</th>
              <th style={th}>Nodes Expanded</th>
              <th style={th}>Optimal?</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, val], i) => (
              <tr key={key} style={{ background: i % 2 === 0 ? '#1a1d2e' : '#1e2340' }}>
                <td style={td}><span style={{ color: ALGO_COLORS[key] }}>●</span> {val.algorithm}</td>
                <td style={{ ...td, color: val.found ? '#68d391' : '#fc8181' }}>{val.found ? '✓' : '✗'}</td>
                <td style={td}>{val.path_len ?? '—'}</td>
                <td style={td}>{val.expanded ?? '—'}</td>
                <td style={{ ...td, color: '#a0aec0', fontSize: 11 }}>{getOptimality(key)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { padding: '10px 16px', textAlign: 'left', color: '#a0aec0', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 };
const td = { padding: '10px 16px', color: '#e2e8f0', borderTop: '1px solid #2d3748' };

function getOptimality(key) {
  return { astar: '✓ Optimal', dijkstra: '✓ Optimal', bfs: '✓ Optimal (unweighted)', dfs: '✗ Not optimal',
    greedy: '✗ Not optimal', bfs_bidirectional: '✓ Optimal (unweighted)' }[key] || '?';
}

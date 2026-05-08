import React, { useState } from 'react';

const SYMBOL_GUIDE = [
  { sym: '#', label: 'Wall',    color: '#2c2c2c' },
  { sym: '.', label: 'Free',    color: '#1a1d2e' },
  { sym: 'S', label: 'Start',   color: '#27ae60' },
  { sym: 'X', label: 'Goal',    color: '#f39c12' },
  { sym: 'K', label: 'Key',     color: '#f4d03f' },
  { sym: 'G', label: 'Gate',    color: '#8e44ad' },
  { sym: 'H', label: 'Hazard',  color: '#e74c3c' },
  { sym: 'C', label: 'Charger', color: '#00b4d8' },
];

const PRESET_SIMPLE = `#############
#S..........#
#...........#
#...K.......#
#...........#
#...........#
#...G.....X.#
#...........#
#############`;

const PRESET_MAZE = `#########################
#S....#.....#...........#
#.....#.....#...........#
#.....#.....#...........#
###...#.....#######.....#
#...........#.......K...#
#...........#...........#
#...........G...........#
#...........#...........#
#####.......#...........#
#...........#...........#
#...........#.....X.....#
#########################`;

export default function MapEditor({ currentMap, onSave, onCancel }) {
  const [mapText, setMapText] = useState(currentMap);
  const [error, setError] = useState('');

  const validate = (text) => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 3) return 'Map must have at least 3 rows';
    const hasStart = lines.some(l => l.includes('S'));
    const hasGoal  = lines.some(l => l.includes('X'));
    const hasKey   = lines.some(l => l.includes('K'));
    const hasGate  = lines.some(l => l.includes('G'));
    if (!hasStart) return 'Map must have a Start cell (S)';
    if (!hasGoal)  return 'Map must have a Goal cell (X)';
    if (hasGate && !hasKey) return 'Map has a Gate (G) but no Key (K) — robot cannot unlock gate';
    return '';
  };

  const handleSave = () => {
    const err = validate(mapText);
    if (err) { setError(err); return; }
    onSave(mapText);
  };

  return (
    <div style={{ width: '100%', maxWidth: 900, padding: 24 }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700 }}>✏️ Map Editor</h2>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Text editor */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ marginBottom: 8, color: '#a0aec0', fontSize: 13 }}>Edit map (use ASCII symbols below):</div>
          <textarea
            value={mapText}
            onChange={e => { setMapText(e.target.value); setError(''); }}
            spellCheck={false}
            style={{ width: '100%', height: 360, background: '#0f1117', color: '#e2e8f0',
              border: `2px solid ${error ? '#fc8181' : '#2d3748'}`, borderRadius: 8, padding: 12,
              fontFamily: 'Courier New, monospace', fontSize: 14, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box' }}
          />
          {error && <div style={{ color: '#fc8181', fontSize: 12, marginTop: 4 }}>⚠️ {error}</div>}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={handleSave}
              style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#667eea', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
              ✓ Apply Map
            </button>
            <button onClick={onCancel}
              style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#4a5568', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Cancel
            </button>
          </div>
        </div>

        {/* Guide */}
        <div style={{ width: 200 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#a0aec0', marginBottom: 10 }}>Symbols</div>
          {SYMBOL_GUIDE.map(({ sym, label, color }) => (
            <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 4, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#fff', border: '1px solid #4a5568' }}>
                {sym}
              </div>
              <span style={{ fontSize: 13, color: '#a0aec0' }}>{label}</span>
            </div>
          ))}

          <div style={{ fontWeight: 700, fontSize: 13, color: '#a0aec0', marginTop: 20, marginBottom: 10 }}>Presets</div>
          <button onClick={() => setMapText(PRESET_SIMPLE)}
            style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: '#242740', color: '#e2e8f0', cursor: 'pointer', marginBottom: 8, fontWeight: 600 }}>
            Simple
          </button>
          <button onClick={() => setMapText(PRESET_MAZE)}
            style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: '#242740', color: '#e2e8f0', cursor: 'pointer', fontWeight: 600 }}>
            Maze
          </button>

          <div style={{ marginTop: 16, padding: 10, background: '#1a1d2e', borderRadius: 8, fontSize: 11, color: '#718096', lineHeight: 1.8 }}>
            <div style={{ fontWeight: 700, color: '#a0aec0', marginBottom: 4 }}>Rules</div>
            <div>• Must have S and X</div>
            <div>• Gate (G) requires Key (K)</div>
            <div>• Rows can be different lengths</div>
            <div>• # = solid wall</div>
          </div>
        </div>
      </div>
    </div>
  );
}

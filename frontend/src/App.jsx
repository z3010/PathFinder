import React, { useState, useEffect, useCallback, useRef } from 'react';
import GridCanvas from './components/GridCanvas';
import AlgorithmPanel from './components/AlgorithmPanel';
import StatsPanel from './components/StatsPanel';
import MapEditor from './components/MapEditor';
import ComparePanel from './components/ComparePanel';

const API = 'https://pathfinder-api-2au5.onrender.com';

const DEFAULT_MAP = `###############.#########
#...........#...#.......#
#.....C.....#...#.......#
#...........#...#.......#
#...........#...#.......#
#...........#...#.......#
#...........#...#.......#
#...........#...#.......#
#...........#...#.......#
#...........#...#.......#
#...........#...#.......#
#S..........#...#......X#
#...........G...........#
#...........#...#.......#
#...........#...#.......#
#...........#...#.......#
#...........#...#.......#
#...........#...#.......#
#...........#...#..H.H..#
#...........#...#.......#
#...K.......#...#.......#
#...........#...#.......#
#...........#...#.......#
#...........#...........#
#########################`;

export default function App() {
  const [mapStr, setMapStr] = useState(DEFAULT_MAP);
  const [gridData, setGridData] = useState(null);
  const [algorithm, setAlgorithm] = useState('astar');
  const [result, setResult] = useState(null);
  const [animState, setAnimState] = useState({ visitedIdx: 0, pathIdx: 0, phase: 'idle' });
  const [speed, setSpeed] = useState(30);
  const [tab, setTab] = useState('visualize'); // 'visualize' | 'compare' | 'editor'
  const [isRunning, setIsRunning] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [error, setError] = useState(null);
  const animRef = useRef(null);

  // Load grid on mount / map change
  useEffect(() => {
    fetch(`${API}/grid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ map_str: mapStr }),
    })
      .then(r => r.json())
      .then(setGridData)
      .catch(e => setError(e.message));
  }, [mapStr]);

  const stopAnim = useCallback(() => {
    if (animRef.current) clearTimeout(animRef.current);
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stopAnim();
    setResult(null);
    setAnimState({ visitedIdx: 0, pathIdx: 0, phase: 'idle' });
    setError(null);
  }, [stopAnim]);

  const runAlgorithm = useCallback(async () => {
    reset();
    setIsRunning(true);
    setError(null);
    try {
      const res = await fetch(`${API}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, map_str: mapStr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Server error');
      setResult(data);
      setAnimState({ visitedIdx: 0, pathIdx: 0, phase: 'visiting' });
    } catch (e) {
      setError(e.message);
      setIsRunning(false);
    }
  }, [algorithm, mapStr, reset]);

  // Animation loop
  useEffect(() => {
    if (!result || animState.phase === 'idle' || animState.phase === 'done') {
      if (animState.phase === 'done') setIsRunning(false);
      return;
    }

    const delay = Math.max(5, 200 - speed * 2);

    if (animState.phase === 'visiting') {
      if (animState.visitedIdx < result.visited.length) {
        animRef.current = setTimeout(() => {
          setAnimState(s => ({ ...s, visitedIdx: s.visitedIdx + 1 }));
        }, delay);
      } else {
        setAnimState(s => ({ ...s, phase: 'pathing', pathIdx: 0 }));
      }
    } else if (animState.phase === 'pathing') {
      if (animState.pathIdx < result.path.length) {
        animRef.current = setTimeout(() => {
          setAnimState(s => ({ ...s, pathIdx: s.pathIdx + 1 }));
        }, delay * 2);
      } else {
        setAnimState(s => ({ ...s, phase: 'done' }));
      }
    }

    return () => clearTimeout(animRef.current);
  }, [animState, result, speed]);

  const runCompare = useCallback(async () => {
    setCompareData(null);
    setError(null);
    try {
      const res = await fetch(`${API}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ map_str: mapStr }),
      });
      const data = await res.json();
      setCompareData(data);
    } catch (e) {
      setError(e.message);
    }
  }, [mapStr]);

  const handleMapSave = (newMap) => {
    setMapStr(newMap);
    reset();
    setTab('visualize');
  };

  const visitedSet = new Set(
    result?.visited?.slice(0, animState.visitedIdx).map(([x, y]) => `${x},${y}`) || []
  );
  const pathSet = new Set(
    result?.path?.slice(0, animState.pathIdx).map(([x, y]) => `${x},${y}`) || []
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a1d2e', borderBottom: '1px solid #2d3748', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Robot Pathfinder
        </span>
        <span style={{ color: '#718096', fontSize: 13 }}>Collect KEY → Unlock GATE → Reach GOAL</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['visualize', 'compare', 'editor'].map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'compare') runCompare(); }}
              style={{ padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                background: tab === t ? '#667eea' : '#2d3748', color: tab === t ? '#fff' : '#a0aec0' }}>
              {t === 'visualize' ? ' Visualize' : t === 'compare' ? '📊 Compare' : '✏️ Editor'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: '#742a2a', color: '#feb2b2', padding: '10px 24px', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 57px)' }}>
        {/* Left panel */}
        {tab !== 'editor' && (
          <div style={{ width: 260, background: '#1a1d2e', borderRight: '1px solid #2d3748', padding: 16, overflowY: 'auto', flexShrink: 0 }}>
            <AlgorithmPanel
              algorithm={algorithm}
              setAlgorithm={(a) => { setAlgorithm(a); reset(); }}
              speed={speed}
              setSpeed={setSpeed}
              onRun={runAlgorithm}
              onReset={reset}
              isRunning={isRunning}
              phase={animState.phase}
            />
            <StatsPanel result={result} animState={animState} />
          </div>
        )}

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 4 }}>
          {tab === 'visualize' && gridData && (
            <GridCanvas
              gridData={gridData}
              visitedSet={visitedSet}
              pathSet={pathSet}
              result={result}
              animState={animState}
            />
          )}
          {tab === 'compare' && (
            <ComparePanel data={compareData} onRefresh={runCompare} />
          )}
          {tab === 'editor' && (
            <MapEditor currentMap={mapStr} onSave={handleMapSave} onCancel={() => setTab('visualize')} />
          )}
        </div>
      </div>
    </div>
  );
}

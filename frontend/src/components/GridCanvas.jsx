import React, { useRef, useEffect, useState } from 'react';

const CELL_COLORS = {
  0: '#1a1d2e',
  1: '#2c2c2c',
  2: '#00b4d8',
  3: '#f4d03f',
  4: '#8e44ad',
  5: '#e74c3c',
  6: '#27ae60',
  7: '#f39c12',
};

const CELL_LABELS = { 2: 'C', 3: '🔑', 4: '🚪', 5: '⚡', 6: '🤖', 7: '🏁' };

function computeCellSize(cols, rows) {
  const availW = window.innerWidth - 260 - 48;
  const availH = window.innerHeight - 57 - 80;
  const byW = Math.floor(availW / cols);
  const byH = Math.floor(availH / rows);
  return Math.max(10, Math.min(byW, byH, 52));
}

export default function GridCanvas({ gridData, visitedSet, pathSet, result, animState }) {
  const canvasRef = useRef(null);
  const [cellSize, setCellSize] = useState(24);

  useEffect(() => {
    if (!gridData) return;
    const update = () => setCellSize(computeCellSize(gridData.cols, gridData.rows));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [gridData]);

  useEffect(() => {
    if (!gridData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { rows, cols, grid } = gridData;

    canvas.width  = cols * cellSize;
    canvas.height = rows * cellSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ct  = grid[r][c];
        const key = `${c},${r}`;
        const x   = c * cellSize;
        const y   = r * cellSize;

        let color = CELL_COLORS[ct] || '#1a1d2e';
        if (pathSet.has(key)) color = '#48bb78';
        else if (visitedSet.has(key) && ct === 0) color = '#3b4a6b';

        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);

        ctx.strokeStyle = '#0f1117';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellSize, cellSize);

        if (cellSize >= 14) {
          const label = CELL_LABELS[ct];
          if (label) {
            ctx.font = `${cellSize * 0.55}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x + cellSize / 2, y + cellSize / 2);
          }
        }
      }
    }

    if (animState.phase === 'pathing' && result?.path && animState.pathIdx > 0) {
      const [px, py] = result.path[animState.pathIdx - 1];
      ctx.font = `${cellSize * 0.7}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🤖', px * cellSize + cellSize / 2, py * cellSize + cellSize / 2);
    }
  }, [gridData, visitedSet, pathSet, result, animState, cellSize]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', overflow: 'auto' }}>
      <canvas ref={canvasRef} style={{ borderRadius: 8, border: '1px solid #2d3748', display: 'block' }} />
      <Legend />
    </div>
  );
}

function Legend() {
  const items = [
    { color: '#27ae60', label: 'Start 🤖' },
    { color: '#f39c12', label: 'Goal 🏁' },
    { color: '#f4d03f', label: 'Key 🔑' },
    { color: '#8e44ad', label: 'Gate 🚪' },
    { color: '#2c2c2c', label: 'Wall' },
    { color: '#e74c3c', label: 'Hazard ⚡' },
    { color: '#00b4d8', label: 'Charger' },
    { color: '#3b4a6b', label: 'Explored' },
    { color: '#48bb78', label: 'Path' },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      {items.map(({ color, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#a0aec0' }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: color, border: '1px solid #4a5568' }} />
          {label}
        </div>
      ))}
    </div>
  );
}

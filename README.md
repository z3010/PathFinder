# 🤖 Robot Pathfinder Visualizer

An interactive pathfinding visualizer where a robot must **collect the KEY first** to unlock the **GATE**, then reach the **GOAL**.

Built with **FastAPI (Python)** backend and **React + Vite** frontend.

---

## Algorithms Implemented

| Algorithm | Optimal? | Strategy |
|---|---|---|
| **A\*** | ✓ | Cost + heuristic (Manhattan to key→goal) |
| **Dijkstra** | ✓ | Uniform cost expansion |
| **BFS** | ✓ (unweighted) | Breadth-first level order |
| **DFS** | ✗ | Depth-first stack |
| **Greedy Best-First** | ✗ | Heuristic only |
| **Bidirectional BFS** | ✓ (unweighted) | Forward + backward frontiers meet in middle |

All algorithms enforce: **Robot must visit KEY cell before it can pass through GATE cells.**

---

## Map Cell Types

| Symbol | Cell | Description |
|---|---|---|
| `S` | Start 🤖 | Robot starting position |
| `X` | Goal 🏁 | Destination |
| `K` | Key 🔑 | Must collect before passing Gate |
| `G` | Gate 🚪 | Blocked until key is held |
| `#` | Wall | Impassable |
| `.` | Free | Walkable |
| `H` | Hazard ⚡ | Passable with cost penalty |
| `C` | Charger | Restores robot energy |

---

## Project Structure

```
pathfinder/
├── backend/
│   ├── algorithms.py      # All 6 pathfinding algorithms + CityGrid
│   ├── server.py          # FastAPI REST API
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Main app + animation engine
│   │   └── components/
│   │       ├── GridCanvas.jsx         # Canvas renderer
│   │       ├── AlgorithmPanel.jsx     # Algorithm selector + controls
│   │       ├── StatsPanel.jsx         # Live stats display
│   │       ├── ComparePanel.jsx       # Side-by-side comparison
│   │       └── MapEditor.jsx          # ASCII map editor
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Setup & Run

### Backend

```bash
cd backend
pip install -r requirements.txt
python server.py
# → API running at http://localhost:8000
# → Swagger docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → App running at http://localhost:3000
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/algorithms` | List all available algorithms |
| `POST` | `/grid` | Parse map → return grid layout |
| `POST` | `/solve` | Run algorithm → return path + visited |
| `POST` | `/compare` | Run all algorithms → return stats table |

### Example: Solve with A*

```bash
curl -X POST http://localhost:8000/solve \
  -H "Content-Type: application/json" \
  -d '{"algorithm": "astar"}'
```

### Example: Custom Map

```bash
curl -X POST http://localhost:8000/solve \
  -H "Content-Type: application/json" \
  -d '{"algorithm": "dijkstra", "map_str": "#####\n#S..#\n#.K.#\n#.G.#\n#..X#\n#####"}'
```

---

## Features

- 🎞 **Animated exploration** — watch nodes expand in real-time
- 🤖 **Robot animation** — robot walks along the final path
- 📊 **Algorithm comparison** — bar charts + stats table
- ✏️ **Map Editor** — draw custom maps in ASCII
- 🎚 **Speed control** — slow to fast
- 🗺 **Legend** — color-coded cell types

---

## Key Design: State Space

All algorithms use augmented state `(x, y, has_key: bool)`:

- `has_key=False` → Gates are blocked
- `has_key=True` → Gates become passable

This means the robot naturally routes to the key first, then proceeds to the gate and goal.

---

## Original Notebook

This project extends `Group8_final.ipynb` (A* with energy constraints) by adding:
- 5 additional algorithms (Dijkstra, BFS, DFS, Greedy, Bidirectional BFS)
- Full interactive web visualizer (FastAPI + React)
- Map editor, comparison dashboard, animation engine

#  Robot Pathfinder Visualizer
https://pathfinder-ui.onrender.com
An interactive pathfinding visualizer where a robot must **collect the KEY first** to unlock the **GATE**, then reach the **GOAL**.
Built with **FastAPI (Python)** backend and **React + Vite** frontend. 

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
| `S` | Start  | Robot starting position |
| `X` | Goal  | Destination |
| `K` | Key | Must collect before passing Gate |
| `G` | Gate | Blocked until key is held |
| `#` | Wall | Impassable |
| `.` | Free | Walkable |
| `H` | Hazard  | Passable with cost penalty |
| `C` | Charger | Restores robot energy |

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/algorithms` | List all available algorithms |
| `POST` | `/grid` | Parse map → return grid layout |
| `POST` | `/solve` | Run algorithm → return path + visited |
| `POST` | `/compare` | Run all algorithms → return stats table |

---

## Features

-  **Animated exploration** — watch nodes expand in real-time
-  **Robot animation** — robot walks along the final path
-  **Algorithm comparison** — bar charts + stats table
-  **Map Editor** — draw custom maps in ASCII
-  **Speed control** — slow to fast
- **Legend** — color-coded cell types

---

## Key Design: State Space

All algorithms use augmented state `(x, y, has_key: bool)`:

- `has_key=False` → Gates are blocked
- `has_key=True` → Gates become passable

This means the robot naturally routes to the key first, then proceeds to the gate and goal.

---


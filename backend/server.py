"""
FastAPI backend for the Pathfinding Visualizer.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from algorithms import CityGrid, ALGORITHMS, run_algorithm, ASCII_MAP

app = FastAPI(title="Pathfinding Visualizer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Default map ─────────────────────────────────────────────────────────────
DEFAULT_MAP = """
###############.#########
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
#########################
""".strip()


# ─── Request / Response models ────────────────────────────────────────────────
class SolveRequest(BaseModel):
    algorithm: str
    map_str: Optional[str] = None


class GridRequest(BaseModel):
    map_str: Optional[str] = None


# ─── Routes ──────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Pathfinding Visualizer API", "algorithms": list(ALGORITHMS.keys())}


@app.get("/algorithms")
def get_algorithms():
    return {k: v[0] for k, v in ALGORITHMS.items()}


@app.post("/grid")
def get_grid(req: GridRequest = None):
    """Parse a map string and return the grid layout for rendering."""
    map_str = (req.map_str if req and req.map_str else DEFAULT_MAP)
    try:
        grid = CityGrid(map_str)
        return grid.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/solve")
def solve(req: SolveRequest):
    """Run an algorithm on the map and return path + visited nodes."""
    map_str = req.map_str or DEFAULT_MAP
    algo    = req.algorithm

    if algo not in ALGORITHMS:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm '{algo}'. "
                            f"Valid: {list(ALGORITHMS.keys())}")
    try:
        grid   = CityGrid(map_str)
        result = run_algorithm(algo, grid)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/compare")
def compare_all(req: GridRequest = None):
    """Run all algorithms and return a comparison summary."""
    map_str = (req.map_str if req and req.map_str else DEFAULT_MAP)
    grid    = CityGrid(map_str)
    results = {}
    for key in ALGORITHMS:
        try:
            r = run_algorithm(key, grid)
            results[key] = {
                'algorithm': r['algorithm'],
                'found':     r['found'],
                'path_len':  len(r['path']) if r['found'] else None,
                'expanded':  r['expanded'],
            }
        except Exception as e:
            results[key] = {'error': str(e)}
    return results


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)

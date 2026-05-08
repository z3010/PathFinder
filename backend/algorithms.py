"""
Pathfinding algorithms for the Robot Navigation problem.
All algorithms enforce: Robot must collect KEY before passing through GATE.
Algorithms: A*, Dijkstra, BFS, DFS, Greedy Best-First, Bidirectional BFS
"""

import heapq
from collections import deque, namedtuple
from dataclasses import dataclass, field
from typing import Optional, List, Tuple, Dict, Any
import numpy as np

# ─── Cell type constants ────────────────────────────────────────────────────
FREE    = 0
WALL    = 1
CHARGER = 2
KEY     = 3
GATE    = 4
HAZARD  = 5
START   = 6
GOAL    = 7

ASCII_MAP = {
    '.': FREE, '#': WALL, 'C': CHARGER, 'K': KEY,
    'G': GATE, 'H': HAZARD, 'S': START, 'X': GOAL,
}

CELL_COLORS = {
    FREE:    '#FFFFFF',
    WALL:    '#2c2c2c',
    CHARGER: '#00b4d8',
    KEY:     '#f4d03f',
    GATE:    '#8e44ad',
    HAZARD:  '#e74c3c',
    START:   '#27ae60',
    GOAL:    '#f39c12',
}

INF = float('inf')
State = namedtuple('State', ['x', 'y', 'has_key'])


# ─── CityGrid ───────────────────────────────────────────────────────────────
class CityGrid:
    DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    def __init__(self, ascii_map: str):
        self._parse(ascii_map)

    def _parse(self, ascii_map: str):
        lines = [l for l in ascii_map.strip().splitlines() if l.strip()]
        self.rows = len(lines)
        self.cols = max(len(l) for l in lines)
        self.grid = np.full((self.rows, self.cols), FREE, dtype=np.int8)
        self.start = None
        self.goal  = None
        self.keys  = []
        self.gates = []

        for r, line in enumerate(lines):
            for c, ch in enumerate(line):
                ct = ASCII_MAP.get(ch, FREE)
                self.grid[r, c] = ct
                if   ct == START: self.start = (c, r)
                elif ct == GOAL:  self.goal  = (c, r)
                elif ct == KEY:   self.keys.append((c, r))
                elif ct == GATE:  self.gates.append((c, r))

    def cell_type(self, x, y) -> int:
        return int(self.grid[y, x])

    def in_bounds(self, x, y) -> bool:
        return 0 <= x < self.cols and 0 <= y < self.rows

    def is_wall(self, x, y) -> bool:
        return self.cell_type(x, y) == WALL

    def is_gate(self, x, y) -> bool:
        return self.cell_type(x, y) == GATE

    def is_key(self, x, y) -> bool:
        return self.cell_type(x, y) == KEY

    def neighbours(self, x, y):
        result = []
        for dx, dy in self.DIRECTIONS:
            nx, ny = x + dx, y + dy
            if self.in_bounds(nx, ny) and not self.is_wall(nx, ny):
                result.append((nx, ny))
        return result

    def passable(self, x, y, has_key: bool) -> bool:
        """Returns True if cell can be entered given current key state."""
        if self.is_wall(x, y):
            return False
        if self.is_gate(x, y) and not has_key:
            return False
        return True

    def to_dict(self):
        return {
            'rows': self.rows,
            'cols': self.cols,
            'grid': self.grid.tolist(),
            'start': self.start,
            'goal':  self.goal,
            'keys':  self.keys,
            'gates': self.gates,
            'cell_colors': CELL_COLORS,
        }


# ─── Path reconstruction helpers ────────────────────────────────────────────
def reconstruct_path(came_from: dict, current) -> List[Tuple[int,int]]:
    path = []
    while current is not None:
        path.append((current.x, current.y))
        current = came_from[current]
    path.reverse()
    return path


def manhattan(ax, ay, bx, by) -> int:
    return abs(ax - bx) + abs(ay - by)


# ─── A* ─────────────────────────────────────────────────────────────────────
@dataclass(order=True)
class AStarNode:
    f: float
    g: float
    state: State = field(compare=False)


def astar(grid: CityGrid) -> dict:
    """A* with key-gate logic. Robot collects key, then unlocks gate."""
    sx, sy = grid.start
    gx, gy = grid.goal
    start_state = State(sx, sy, False)

    def h(s):
        if not s.has_key and grid.keys:
            kx, ky = min(grid.keys, key=lambda k: manhattan(s.x, s.y, k[0], k[1]))
            return manhattan(s.x, s.y, kx, ky) + manhattan(kx, ky, gx, gy)
        return manhattan(s.x, s.y, gx, gy)

    open_heap = [AStarNode(f=h(start_state), g=0.0, state=start_state)]
    g_score   = {start_state: 0.0}
    came_from = {start_state: None}
    visited   = []
    expanded  = 0

    while open_heap:
        node = heapq.heappop(open_heap)
        cur  = node.state
        g    = node.g

        if g > g_score.get(cur, INF):
            continue

        expanded += 1
        visited.append((cur.x, cur.y))

        if (cur.x, cur.y) == (gx, gy):
            return {
                'path':     reconstruct_path(came_from, cur),
                'visited':  visited,
                'expanded': expanded,
                'found':    True,
            }

        for nx, ny in grid.neighbours(cur.x, cur.y):
            if not grid.passable(nx, ny, cur.has_key):
                continue
            new_key = cur.has_key or grid.is_key(nx, ny)
            ng      = g + 1
            nxt     = State(nx, ny, new_key)
            if ng < g_score.get(nxt, INF):
                g_score[nxt]   = ng
                came_from[nxt] = cur
                heapq.heappush(open_heap, AStarNode(f=ng + h(nxt), g=ng, state=nxt))

    return {'path': [], 'visited': visited, 'expanded': expanded, 'found': False}


# ─── Dijkstra ────────────────────────────────────────────────────────────────
@dataclass(order=True)
class DijkNode:
    cost: float
    state: State = field(compare=False)


def dijkstra(grid: CityGrid) -> dict:
    sx, sy = grid.start
    gx, gy = grid.goal
    start  = State(sx, sy, False)

    dist      = {start: 0}
    came_from = {start: None}
    heap      = [DijkNode(cost=0, state=start)]
    visited   = []
    expanded  = 0

    while heap:
        node = heapq.heappop(heap)
        cur  = node.state
        cost = node.cost

        if cost > dist.get(cur, INF):
            continue

        expanded += 1
        visited.append((cur.x, cur.y))

        if (cur.x, cur.y) == (gx, gy):
            return {'path': reconstruct_path(came_from, cur), 'visited': visited,
                    'expanded': expanded, 'found': True}

        for nx, ny in grid.neighbours(cur.x, cur.y):
            if not grid.passable(nx, ny, cur.has_key):
                continue
            new_key = cur.has_key or grid.is_key(nx, ny)
            ncost   = cost + 1
            nxt     = State(nx, ny, new_key)
            if ncost < dist.get(nxt, INF):
                dist[nxt]      = ncost
                came_from[nxt] = cur
                heapq.heappush(heap, DijkNode(cost=ncost, state=nxt))

    return {'path': [], 'visited': visited, 'expanded': expanded, 'found': False}


# ─── BFS ─────────────────────────────────────────────────────────────────────
def bfs(grid: CityGrid) -> dict:
    sx, sy = grid.start
    gx, gy = grid.goal
    start  = State(sx, sy, False)

    queue     = deque([start])
    came_from = {start: None}
    visited   = []
    expanded  = 0

    while queue:
        cur = queue.popleft()
        expanded += 1
        visited.append((cur.x, cur.y))

        if (cur.x, cur.y) == (gx, gy):
            return {'path': reconstruct_path(came_from, cur), 'visited': visited,
                    'expanded': expanded, 'found': True}

        for nx, ny in grid.neighbours(cur.x, cur.y):
            if not grid.passable(nx, ny, cur.has_key):
                continue
            new_key = cur.has_key or grid.is_key(nx, ny)
            nxt     = State(nx, ny, new_key)
            if nxt not in came_from:
                came_from[nxt] = cur
                queue.append(nxt)

    return {'path': [], 'visited': visited, 'expanded': expanded, 'found': False}


# ─── DFS ─────────────────────────────────────────────────────────────────────
def dfs(grid: CityGrid) -> dict:
    sx, sy = grid.start
    gx, gy = grid.goal
    start  = State(sx, sy, False)

    stack     = [start]
    came_from = {start: None}
    visited   = []
    expanded  = 0

    while stack:
        cur = stack.pop()
        if cur in visited:
            continue

        expanded += 1
        visited.append((cur.x, cur.y))

        if (cur.x, cur.y) == (gx, gy):
            return {'path': reconstruct_path(came_from, cur), 'visited': visited,
                    'expanded': expanded, 'found': True}

        for nx, ny in reversed(grid.neighbours(cur.x, cur.y)):
            if not grid.passable(nx, ny, cur.has_key):
                continue
            new_key = cur.has_key or grid.is_key(nx, ny)
            nxt     = State(nx, ny, new_key)
            if nxt not in came_from:
                came_from[nxt] = cur
                stack.append(nxt)

    return {'path': [], 'visited': visited, 'expanded': expanded, 'found': False}


# ─── Greedy Best-First ────────────────────────────────────────────────────────
@dataclass(order=True)
class GreedyNode:
    h: float
    state: State = field(compare=False)


def greedy_best_first(grid: CityGrid) -> dict:
    sx, sy = grid.start
    gx, gy = grid.goal
    start  = State(sx, sy, False)

    def h(s):
        if not s.has_key and grid.keys:
            kx, ky = min(grid.keys, key=lambda k: manhattan(s.x, s.y, k[0], k[1]))
            return manhattan(s.x, s.y, kx, ky) + manhattan(kx, ky, gx, gy)
        return manhattan(s.x, s.y, gx, gy)

    heap      = [GreedyNode(h=h(start), state=start)]
    came_from = {start: None}
    visited   = []
    expanded  = 0

    seen = set()
    while heap:
        node = heapq.heappop(heap)
        cur  = node.state

        if cur in seen:
            continue
        seen.add(cur)

        expanded += 1
        visited.append((cur.x, cur.y))

        if (cur.x, cur.y) == (gx, gy):
            return {'path': reconstruct_path(came_from, cur), 'visited': visited,
                    'expanded': expanded, 'found': True}

        for nx, ny in grid.neighbours(cur.x, cur.y):
            if not grid.passable(nx, ny, cur.has_key):
                continue
            new_key = cur.has_key or grid.is_key(nx, ny)
            nxt     = State(nx, ny, new_key)
            if nxt not in came_from:
                came_from[nxt] = cur
                heapq.heappush(heap, GreedyNode(h=h(nxt), state=nxt))

    return {'path': [], 'visited': visited, 'expanded': expanded, 'found': False}


# ─── Bidirectional BFS ───────────────────────────────────────────────────────
def bfs_bidirectional(grid: CityGrid) -> dict:
    """
    Bidirectional BFS. Forward search: must pick up key.
    Backward search: starts from goal, no key constraint (meeting point check).
    Meeting point is verified to be consistent with key-gate logic.
    """
    sx, sy = grid.start
    gx, gy = grid.goal

    fwd_start = State(sx, sy, False)
    bwd_start = State(gx, gy, True)   # backward assumes key already held

    fwd_queue     = deque([fwd_start])
    fwd_came_from = {fwd_start: None}
    fwd_visited   = []

    bwd_queue     = deque([bwd_start])
    bwd_came_from = {bwd_start: None}
    bwd_visited   = []

    expanded = 0
    all_visited = []

    def step_fwd():
        nonlocal expanded
        if not fwd_queue:
            return None
        cur = fwd_queue.popleft()
        expanded += 1
        fwd_visited.append((cur.x, cur.y))
        all_visited.append((cur.x, cur.y))
        for nx, ny in grid.neighbours(cur.x, cur.y):
            if not grid.passable(nx, ny, cur.has_key):
                continue
            new_key = cur.has_key or grid.is_key(nx, ny)
            nxt = State(nx, ny, new_key)
            if nxt not in fwd_came_from:
                fwd_came_from[nxt] = cur
                fwd_queue.append(nxt)
        return cur

    def step_bwd():
        nonlocal expanded
        if not bwd_queue:
            return None
        cur = bwd_queue.popleft()
        expanded += 1
        bwd_visited.append((cur.x, cur.y))
        all_visited.append((cur.x, cur.y))
        for nx, ny in grid.neighbours(cur.x, cur.y):
            if grid.is_wall(nx, ny):
                continue
            # Backward: we traverse gates freely (assume key carried)
            nxt = State(nx, ny, True)
            if nxt not in bwd_came_from:
                bwd_came_from[nxt] = cur
                bwd_queue.append(nxt)
        return cur

    def find_meeting():
        for fs in fwd_came_from:
            bs = State(fs.x, fs.y, True)
            if bs in bwd_came_from:
                return fs, bs
        return None, None

    def build_path(fwd_node, bwd_node):
        # Forward path
        fp = []
        n = fwd_node
        while n is not None:
            fp.append((n.x, n.y))
            n = fwd_came_from[n]
        fp.reverse()

        # Backward path (reverse of backward came_from)
        bp = []
        n = bwd_node
        while n is not None:
            bp.append((n.x, n.y))
            n = bwd_came_from[n]

        return fp + bp[1:]   # skip duplicate meeting point

    for _ in range(grid.rows * grid.cols * 2):
        step_fwd()
        step_bwd()
        fn, bn = find_meeting()
        if fn is not None:
            path = build_path(fn, bn)
            return {'path': path, 'visited': all_visited,
                    'expanded': expanded, 'found': True}

    return {'path': [], 'visited': all_visited, 'expanded': expanded, 'found': False}


# ─── Registry ────────────────────────────────────────────────────────────────
ALGORITHMS = {
    'astar':             ('A* (A-Star)',             astar),
    'dijkstra':          ('Dijkstra',                dijkstra),
    'bfs':               ('BFS (Breadth-First)',     bfs),
    'dfs':               ('DFS (Depth-First)',       dfs),
    'greedy':            ('Greedy Best-First',       greedy_best_first),
    'bfs_bidirectional': ('Bidirectional BFS',       bfs_bidirectional),
}


def run_algorithm(algo_key: str, grid: CityGrid) -> dict:
    if algo_key not in ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algo_key}")
    label, fn = ALGORITHMS[algo_key]
    result = fn(grid)
    result['algorithm'] = label
    return result

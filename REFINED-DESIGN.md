# Refined Maze Design - With Solution Rendering

## The Solution Challenge

You're right - there's a subtle issue. The entrance/exit are *passages* (edges), but the solution is a *path of cells* (nodes). We need to bridge this elegantly.

## Key Insight

The solution is: **Entrance and exit are special cells, not passages**. This makes everything work naturally.

## Refined Design

```typescript
// Core types remain simple
type CellId = string;
type Passage = [CellId, CellId];  // Sorted pair

interface Maze {
  cells: Set<CellId>;
  passages: Set<Passage>;
  entrance: CellId;  // Changed: now a cell
  exit: CellId;      // Changed: now a cell
}

// Grid now designates entrance/exit cells
interface Grid {
  cells(): CellId[];
  neighbors(cell: CellId): CellId[];
  
  // Entry/exit are special cells on the boundary
  entranceCell(): CellId;
  exitCell(): CellId;
  
  // For rendering
  position(cell: CellId): [number, number];
  
  // Which passages connect to the outside
  boundaryPassages(cell: CellId): Passage[];
}

// Generation with proper entrance/exit handling
function generateMaze(grid: Grid, random: () => number): Maze {
  const cells = new Set(grid.cells());
  const entrance = grid.entranceCell();
  const exit = grid.exitCell();
  
  // Build all possible passages
  const allPassages: Passage[] = [];
  for (const cell of cells) {
    for (const neighbor of grid.neighbors(cell)) {
      if (cell < neighbor) {
        allPassages.push([cell, neighbor]);
      }
    }
  }
  
  // Find spanning tree of all cells
  const tree = spanningTree(cells, allPassages, random);
  
  // Add boundary passages for entrance/exit
  const passages = new Set(tree);
  
  // Add ONE boundary passage for entrance cell to outside
  const entranceBoundary = grid.boundaryPassages(entrance)[0];
  if (entranceBoundary) passages.add(entranceBoundary);
  
  // Add ONE boundary passage for exit cell to outside
  const exitBoundary = grid.boundaryPassages(exit)[0];
  if (exitBoundary) passages.add(exitBoundary);
  
  return { cells, passages, entrance, exit };
}

// Solving is now crystal clear
function solveMaze(maze: Maze): CellId[] | null {
  // Build adjacency from passages
  const adj = new Map<CellId, Set<CellId>>();
  for (const cell of maze.cells) {
    adj.set(cell, new Set());
  }
  
  for (const [a, b] of maze.passages) {
    // Only add if both cells are in maze
    if (maze.cells.has(a) && maze.cells.has(b)) {
      adj.get(a)!.add(b);
      adj.get(b)!.add(a);
    }
  }
  
  // BFS from entrance to exit
  const queue: CellId[] = [maze.entrance];
  const parent = new Map<CellId, CellId>();
  parent.set(maze.entrance, maze.entrance);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current === maze.exit) {
      // Reconstruct path
      const path: CellId[] = [];
      let node = maze.exit;
      while (node !== maze.entrance) {
        path.unshift(node);
        node = parent.get(node)!;
      }
      path.unshift(maze.entrance);
      return path;
    }
    
    for (const next of adj.get(current)!) {
      if (!parent.has(next)) {
        parent.set(next, current);
        queue.push(next);
      }
    }
  }
  
  return null;
}

// Rendering becomes elegant
interface Renderer {
  render(maze: Maze, grid: Grid, solution?: CellId[]): string;
}

class SVGRenderer implements Renderer {
  render(maze: Maze, grid: Grid, solution?: CellId[]): string {
    const solutionSet = new Set(solution || []);
    
    // 1. Draw all cells
    for (const cell of maze.cells) {
      const [x, y] = grid.position(cell);
      const highlight = solutionSet.has(cell);
      // Draw cell with highlight if in solution
    }
    
    // 2. Draw walls (where passages are NOT)
    for (const cellA of maze.cells) {
      for (const cellB of grid.neighbors(cellA)) {
        if (cellA < cellB) {
          const passage: Passage = [cellA, cellB];
          if (!maze.passages.has(passage)) {
            // Draw wall between cellA and cellB
          }
        }
      }
    }
    
    // 3. Mark entrance/exit
    // Special rendering for entrance/exit cells
  }
}

// Example grid with entrance/exit cells
class RectangularGrid implements Grid {
  constructor(private width: number, private height: number) {}
  
  entranceCell(): CellId {
    return `0,0`;  // Top-left corner
  }
  
  exitCell(): CellId {
    return `${this.width-1},${this.height-1}`;  // Bottom-right
  }
  
  boundaryPassages(cell: CellId): Passage[] {
    const [x, y] = cell.split(',').map(Number);
    const result: Passage[] = [];
    
    // Virtual "outside" cells for entrance/exit
    if (x === 0) result.push([`-1,${y}`, cell]);
    if (x === this.width - 1) result.push([cell, `${this.width},${y}`]);
    if (y === 0) result.push([`${x},-1`, cell]);
    if (y === this.height - 1) result.push([cell, `${x},${this.height}`]);
    
    return result;
  }
  
  // Rest of implementation...
}
```

## Why This Works Better

1. **Clear solution path**: Entrance/exit are cells, so the path is just a list of cells
2. **Rendering is simple**: Highlight cells in solution set
3. **Works for any grid**: Even weird topologies just need to designate entrance/exit cells
4. **Boundary handling**: Virtual "outside" cells for entrance/exit passages

## Edge Cases Handled

1. **Weird coordinate systems**: Don't matter - cells are just IDs
2. **Shared walls**: Passages are sorted pairs, so no duplicates
3. **Complex topologies**: As long as you can define neighbors, it works
4. **Multiple entrances**: Just designate multiple entrance cells

## Test Strategy (< 50 lines)

```typescript
// Test grid topology
test('rectangular grid has correct neighbors', () => {
  const grid = new RectangularGrid(3, 3);
  expect(grid.neighbors('1,1')).toEqual(['0,1', '2,1', '1,0', '1,2']);
});

// Test maze generation  
test('maze is a spanning tree', () => {
  const maze = generateMaze(grid, Math.random);
  expect(maze.passages.size).toBe(maze.cells.size - 1 + 2); // +2 for entrance/exit
});

// Test solution
test('solution connects entrance to exit', () => {
  const solution = solveMaze(maze);
  expect(solution![0]).toBe(maze.entrance);
  expect(solution![solution!.length - 1]).toBe(maze.exit);
});

// Property test
test('all mazes are solvable', () => {
  for (let i = 0; i < 100; i++) {
    const maze = generateMaze(grid, Math.random);
    expect(solveMaze(maze)).not.toBeNull();
  }
});
```

Total code: ~200 lines for everything!
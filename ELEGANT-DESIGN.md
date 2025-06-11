# Elegant Maze Architecture

## Core Insight

A maze is just a connected graph with some edges marked as "passages". The elegance comes from finding the right representation where correctness falls out naturally.

## The Minimal Design

```typescript
// 1. A maze is just cells and passages between them
type CellId = string;
type Passage = [CellId, CellId];  // Sorted pair

interface Maze {
  cells: Set<CellId>;
  passages: Set<Passage>;  // Which walls are OPEN
  entrance: Passage;
  exit: Passage;
}

// 2. A grid defines topology - nothing more
interface Grid {
  cells(): CellId[];
  neighbors(cell: CellId): CellId[];
  boundary(): Passage[];  // Which passages are on the edge
  
  // For rendering only
  position(cell: CellId): [number, number];
}

// 3. Generation is just finding a spanning tree
function generateMaze(grid: Grid, random: () => number): Maze {
  // Build adjacency graph
  const edges: Passage[] = [];
  const cells = new Set(grid.cells());
  
  for (const cell of cells) {
    for (const neighbor of grid.neighbors(cell)) {
      if (cell < neighbor) {  // Avoid duplicates
        edges.push([cell, neighbor]);
      }
    }
  }
  
  // Boundary passages cannot be opened (except entrance/exit)
  const boundary = new Set(grid.boundary());
  const internal = edges.filter(e => !boundary.has(e));
  
  // Run spanning tree on internal edges
  const tree = spanningTree(cells, internal, random);
  
  // Pick entrance/exit from boundary
  const boundaryArray = Array.from(boundary);
  const entrance = boundaryArray[0];  // Or use random
  const exit = boundaryArray[boundaryArray.length - 1];
  
  return {
    cells,
    passages: new Set([...tree, entrance, exit]),
    entrance,
    exit
  };
}

// 4. Spanning tree - pure graph algorithm
function spanningTree<T>(
  nodes: Set<T>, 
  edges: [T, T][], 
  random: () => number
): [T, T][] {
  // Randomized Kruskal's algorithm
  const shuffled = shuffle(edges, random);
  const parent = new Map<T, T>();
  
  // Union-find
  const find = (x: T): T => {
    if (!parent.has(x)) parent.set(x, x);
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)!));
    }
    return parent.get(x)!;
  };
  
  const tree: [T, T][] = [];
  for (const [a, b] of shuffled) {
    if (find(a) !== find(b)) {
      parent.set(find(a), find(b));
      tree.push([a, b]);
    }
  }
  
  return tree;
}

// 5. Validation - all invariants in one place
function validateMaze(maze: Maze, grid: Grid): string[] {
  const errors: string[] = [];
  
  // Check spanning tree property
  if (maze.passages.size !== maze.cells.size) {
    errors.push("Not a tree: wrong edge count");
  }
  
  // Check connectivity
  if (!isConnected(maze.cells, maze.passages)) {
    errors.push("Not connected");
  }
  
  // Check boundaries
  const boundary = new Set(grid.boundary());
  for (const passage of maze.passages) {
    if (boundary.has(passage) && 
        passage !== maze.entrance && 
        passage !== maze.exit) {
      errors.push(`Boundary breach at ${passage}`);
    }
  }
  
  return errors;
}

// 6. Grid implementations - just topology
class RectangularGrid implements Grid {
  constructor(private width: number, private height: number) {}
  
  cells(): CellId[] {
    const result: CellId[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        result.push(`${x},${y}`);
      }
    }
    return result;
  }
  
  neighbors(cell: CellId): CellId[] {
    const [x, y] = cell.split(',').map(Number);
    const result: CellId[] = [];
    
    if (x > 0) result.push(`${x-1},${y}`);
    if (x < this.width - 1) result.push(`${x+1},${y}`);
    if (y > 0) result.push(`${x},${y-1}`);
    if (y < this.height - 1) result.push(`${x},${y+1}`);
    
    return result;
  }
  
  boundary(): Passage[] {
    const result: Passage[] = [];
    
    // Top and bottom edges
    for (let x = 0; x < this.width - 1; x++) {
      result.push([`${x},0`, `${x+1},0`]);
      result.push([`${x},${this.height-1}`, `${x+1},${this.height-1}`]);
    }
    
    // Left and right edges
    for (let y = 0; y < this.height - 1; y++) {
      result.push([`0,${y}`, `0,${y+1}`]);
      result.push([`${this.width-1},${y}`, `${this.width-1},${y+1}`]);
    }
    
    return result;
  }
  
  position(cell: CellId): [number, number] {
    const [x, y] = cell.split(',').map(Number);
    return [x, y];
  }
}

// 7. Solving - just graph search
function solveMaze(maze: Maze): CellId[] | null {
  // Build adjacency from passages
  const adjacent = new Map<CellId, Set<CellId>>();
  
  for (const [a, b] of maze.passages) {
    if (!adjacent.has(a)) adjacent.set(a, new Set());
    if (!adjacent.has(b)) adjacent.set(b, new Set());
    adjacent.get(a)!.add(b);
    adjacent.get(b)!.add(a);
  }
  
  // Find entrance/exit cells
  const [startA, startB] = maze.entrance;
  const [endA, endB] = maze.exit;
  
  // BFS from entrance cell to exit cell
  // (Implementation details omitted for brevity)
  
  return path;
}
```

## Why This Design is Elegant

1. **Maze = Cells + Open Passages** - That's it. No walls, just passages.

2. **Grid is pure topology** - Returns cells and their relationships. Nothing more.

3. **Correctness by construction**:
   - Can't remove a boundary (except entrance/exit)
   - Spanning tree ensures connectivity
   - Types prevent invalid states

4. **Minimal concepts**:
   - No Wall objects
   - No coordinate types
   - No complex hierarchies

5. **Pure functions** - Each function does one thing well

6. **Testable** - Each piece is independent:
   ```typescript
   // Test grid topology
   assert(rect.neighbors("1,1").length === 4);
   
   // Test spanning tree
   assert(spanningTree(nodes, edges).length === nodes.size - 1);
   
   // Test maze validity
   assert(validateMaze(maze, grid).length === 0);
   ```

The beauty is that complex behavior (different maze types) emerges from simple rules (different topologies). Just like Norvig would do it!
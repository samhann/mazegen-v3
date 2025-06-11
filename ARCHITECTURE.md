# Maze Generation Architecture

## Core Abstractions

### 1. Graph Layer (Pure graph theory)
```typescript
// Generic graph edge
interface Edge<T> {
  from: T;
  to: T;
  isFixed?: boolean;  // Optional constraint: cannot be removed
}

// Generic graph 
interface Graph<T> {
  nodes: Set<T>;
  edges: Set<Edge<T>>;
}

// Spanning tree algorithm works on abstract graphs
interface SpanningTreeAlgorithm {
  // Returns edges to keep (respects isFixed constraint)
  generate<T>(graph: Graph<T>, random: () => number): Set<Edge<T>>;
}
```

### 2. Grid Layer (Spatial representation)
```typescript
// Simple point in 2D space
interface Point {
  x: number;
  y: number;
}

// Grid knows how to create cells and their topology
interface Grid {
  // Grid-specific cell generation
  generateCells(): Map<string, Point>;
  
  // Grid-specific neighbor rules
  getNeighbors(cellId: string): string[];
  
  // Dimensions for boundary detection
  getBounds(): { minX: number, maxX: number, minY: number, maxY: number };
  
  // Where to place entrance/exit
  getEntrancePosition(): [string, string];  // [cellId1, cellId2]
  getExitPosition(): [string, string];
}
```

### 3. Maze Layer (Combines graph + grid + walls)
```typescript
// Wall between cells
interface Wall {
  cell1: string;
  cell2: string;
  isBoundary: boolean;
}

// Complete maze representation
interface Maze {
  cells: Map<string, Point>;
  walls: Set<Wall>;
  entrance: Wall;
  exit: Wall;
  
  // Convert to graph for algorithm
  toGraph(): Graph<string>;
  
  // Apply spanning tree result
  applySpanningTree(keptEdges: Set<Edge<string>>): void;
}
```

### 4. Rendering Layer
```typescript
interface Renderer<T> {
  render(cells: Map<string, Point>, walls: Set<Wall>, solution?: string[]): T;
}
```

## Key Design Principles

1. **Correct by Construction**:
   - Grid generates valid topology
   - Boundary walls automatically marked as `isFixed`
   - Only entrance/exit boundaries are removable
   - Spanning tree respects constraints

2. **Clean Separation**:
   - SpanningTreeAlgorithm knows nothing about mazes/walls
   - Grid handles spatial layout but not walls
   - Maze combines everything but delegates to appropriate layers

3. **Testability**:
   - Test grid topology independently
   - Test spanning tree on abstract graphs
   - Test maze assembly separately

## Example Implementation

```typescript
class RectangularGrid implements Grid {
  constructor(private width: number, private height: number) {}
  
  generateCells(): Map<string, Point> {
    const cells = new Map();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        cells.set(`${x},${y}`, { x, y });
      }
    }
    return cells;
  }
  
  getNeighbors(cellId: string): string[] {
    const [x, y] = cellId.split(',').map(Number);
    const neighbors = [];
    if (x > 0) neighbors.push(`${x-1},${y}`);
    if (x < this.width - 1) neighbors.push(`${x+1},${y}`);
    if (y > 0) neighbors.push(`${x},${y-1}`);
    if (y < this.height - 1) neighbors.push(`${x},${y+1}`);
    return neighbors;
  }
}
```

## Testing Strategy

### 1. Grid Tests
```typescript
// Test that all cells have correct neighbors
// Test boundary cells have fewer neighbors
// Test no orphaned cells
```

### 2. Graph Algorithm Tests
```typescript
// Test on known small graphs
// Test respects fixed edges
// Test produces spanning tree (n-1 edges for n nodes)
```

### 3. Maze Integration Tests
```typescript
// Test boundary walls are preserved
// Test entrance/exit are open
// Test path exists from entrance to exit
// Test no cycles in passageways
```

### 4. Property-Based Tests
```typescript
// For any valid grid + algorithm:
// - Result is connected
// - Result is acyclic
// - All cells reachable
// - Boundary integrity maintained
```

## Questions

1. Should we use cell IDs (like "3,4") or cell references everywhere?
2. For hex grids, how should we handle the coordinate system? Axial internally with conversion?
3. Should the solution path be cell IDs or Points?
# Final Maze Architecture

## Core Philosophy
- **Elegance through simplicity** - Like Norvig's style
- **Correct by construction** - Invalid states are unrepresentable  
- **Minimal code** - Under 300 lines total
- **Pure functions** - Testable, composable

## The Essential Design

### 1. Core Types (10 lines)
```typescript
type CellId = string;                    // "3,4" or "q,r" - grid specific
type Passage = [CellId, CellId];         // Sorted pair - no duplicates
type Solution = CellId[];                // Path from entrance to exit

interface Maze {
  cells: Set<CellId>;
  passages: Set<Passage>;                // Which walls are OPEN
  entrance: CellId;
  exit: CellId;
}
```

### 2. Grid Interface (20 lines)
```typescript
interface Grid {
  // Topology
  cells(): CellId[];
  neighbors(cell: CellId): CellId[];
  
  // Special cells
  entranceCell(): CellId;
  exitCell(): CellId;
  
  // Boundary handling
  boundaryPassages(cell: CellId): Passage[];
  
  // For rendering only
  position(cell: CellId): [number, number];
}
```

### 3. Key Algorithms (50 lines total)

**Maze Generation**
- Build adjacency from grid topology
- Run spanning tree on all internal passages  
- Add entrance/exit boundary passages
- Return maze with exactly n-1 internal passages

**Maze Solving**
- Build adjacency from passages
- BFS from entrance to exit
- Return path as cell IDs

**Validation**
- Check spanning tree property (edge count)
- Check connectivity (BFS reaches all)
- Check no cycles (union-find)

### 4. Rendering (30 lines)
```typescript
// Renderer converts maze + solution to visual format
// Key insight: Draw all walls, then erase passages
// Highlight solution cells
```

## Why This Design Works

1. **Passages, not walls** - We track what's open, not what's closed
2. **Entrance/exit as cells** - Makes solution finding trivial
3. **String IDs everywhere** - Simple, uniform, debuggable
4. **Grid hides complexity** - Each grid type handles its own coordinate system

## Implementation Plan

1. **Core types** - Simple data structures
2. **Rectangular grid** - Simplest case first
3. **Spanning tree** - Randomized Kruskal's
4. **Solver** - BFS
5. **SVG renderer** - Basic visualization
6. **Tests** - Property-based testing
7. **Hexagonal grid** - Reuse everything, just new Grid implementation

## What Makes This Elegant

- **No coordinate types** - Just strings
- **No wall objects** - Just passages (tuples)
- **No complex hierarchies** - Just interfaces
- **No state** - Pure functions
- **No special cases** - Uniform handling

The entire system is ~200 lines of actual code. Adding a new grid type is ~30 lines. The design ensures correctness through simplicity rather than complexity.
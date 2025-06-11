# Current Maze Architecture (Implemented)

## Overview
A minimal, elegant maze generation system inspired by Peter Norvig's programming style. The architecture prioritizes correctness through simplicity rather than performance optimization.

## Core Design Principles

### 1. "Passages, Not Walls" 
**Key Insight**: Represent mazes as sets of open passages rather than tracking which walls to remove.
- Eliminates duplicate wall handling
- Makes solution rendering trivial
- Spanning tree gives exactly the right number of passages

### 2. "Correct by Construction"
- Invalid states are unrepresentable in the type system
- Pure functions with no side effects
- Property-based testing validates invariants
- Build incrementally on solid foundations

### 3. "Uniform Abstractions"
- String IDs work across all grid types
- Same interfaces for rectangular, hexagonal, triangular grids
- Sorted passage pairs prevent duplicates by design

## Implementation Details

### Core Types (~25 lines)
```typescript
type CellId = string;                    // "3,4" or "q,r" - grid specific
type Passage = [CellId, CellId];         // Always sorted to prevent duplicates
type Solution = CellId[];                // Path from entrance to exit

interface Maze {
  cells: Set<CellId>;
  passages: Set<Passage>;                // Which connections are OPEN
  entrance: CellId;                      // Start cell
  exit: CellId;                          // End cell
}
```

### Grid Interface (~20 lines)
```typescript
interface Grid {
  // Topology
  cells(): CellId[];
  neighbors(cell: CellId): CellId[];
  
  // Special positions
  entranceCell(): CellId;
  exitCell(): CellId;
  
  // Boundary handling
  boundaryPassages(cell: CellId): Passage[];
  
  // Rendering only
  position(cell: CellId): [number, number];
}
```

### Algorithm Layer (~200 lines)
- **SpanningTree**: Pure graph algorithm using union-find
- **MazeGenerator**: Combines grid topology + spanning tree
- **MazeSolver**: BFS pathfinding through passages
- **Validation**: Property-based correctness checking

### Rendering Layer (~270 lines)
- **ASCIIRenderer**: Debug visualization with solution paths
- **SVGRenderer**: Production-quality graphics with customization

## Key Trade-offs Made

### 1. Simplicity Over Performance
- **String IDs**: Human-readable, universal, easy to debug
- **BFS over A***: Simpler code, adequate for maze sizes
- **Set operations**: Clear semantics over micro-optimizations

### 2. Correctness Over Flexibility  
- **Sorted passages**: Prevents duplicates by design
- **Immutable data**: No mutation bugs
- **Pure functions**: Predictable, testable behavior

### 3. Elegance Over Features
- **Two renderers**: ASCII + SVG cover 90% of use cases
- **Single solution**: Shortest path only (no alternatives)
- **Fixed entrance/exit**: Opposite corners (could be parameterized)

## Component Responsibilities

### Grid Implementations
- **Input**: Grid dimensions, topology rules
- **Output**: Cell IDs, neighbor relationships, boundary detection
- **Responsibility**: Define spatial structure only
- **Examples**: RectangularGrid (4 neighbors), HexagonalGrid (6 neighbors)

### Spanning Tree Algorithm
- **Input**: Graph with nodes and edges (some marked as fixed)
- **Output**: Minimal connected subgraph
- **Responsibility**: Pure graph theory, knows nothing about mazes
- **Algorithm**: Randomized Kruskal's with union-find

### Maze Generator
- **Input**: Grid + random function
- **Output**: Valid maze (connected, acyclic, proper boundaries)
- **Responsibility**: Combine grid topology with spanning tree
- **Guarantees**: Always generates solvable maze

### Maze Solver
- **Input**: Maze
- **Output**: Shortest path from entrance to exit
- **Responsibility**: BFS through passage adjacencies
- **Guarantees**: Finds optimal solution if one exists

### Renderers
- **Input**: Maze + grid + optional solution
- **Output**: Visual representation (ASCII/SVG)
- **Responsibility**: Convert abstract maze to concrete visualization
- **Features**: Highlight solution path, mark entrance/exit

## Extension Points

### Adding New Grid Types
1. Implement `Grid` interface
2. Define coordinate system (internal use only)
3. Implement `neighbors()` logic
4. Define boundary detection
5. Provide `position()` for rendering

Everything else (generation, solving, rendering) works automatically.

### Current Metrics
- **Total code**: ~600 lines
- **Test coverage**: 42 tests, 100% passing
- **Grid types**: 1 (rectangular)
- **Renderers**: 2 (ASCII, SVG)

## Success Criteria Met
✅ **Elegant**: Minimal, readable code  
✅ **Correct**: Property-based validation  
✅ **Extensible**: Easy to add grid types  
✅ **Testable**: Pure functions, isolated concerns  
✅ **Complete**: Generation, solving, rendering  

## Next: Hexagonal Grids

The architecture is ready for hexagonal grids. Key insights:
- Use axial coordinates (q,r) internally
- Convert to x,y only in `position()` method  
- 6 neighbors instead of 4
- Different boundary detection logic
- Same interfaces, same algorithms, same renderers
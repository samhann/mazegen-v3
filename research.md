# Maze Generation Research: Spanning Trees on Various Grid Types

## Overview
This research explores spanning tree algorithms for maze generation on different grid types (rectangular, hexagonal, triangular, polar) with flexible data structure design.

## Spanning Tree Maze Generation Algorithms

### Core Concept
- Maze = Graph where cells are nodes, potential passages are edges
- Perfect maze = Spanning tree (no cycles, all cells connected, exactly one path between any two points)
- Generate by creating random spanning tree from fully connected grid graph

### Key Algorithms

#### 1. Randomized Prim's Algorithm
- **Process**: Start with one cell, maintain "frontier" of adjacent unvisited cells, randomly select frontier cell and connect to maze
- **Characteristics**: Grows from single point, creates organic tree-like structure, many short cul-de-sacs
- **Time**: O(V log V) with priority queue
- **Best for**: Dense graphs, when you want maze growing from specific starting point

#### 2. Randomized Kruskal's Algorithm  
- **Process**: Start with all walls, randomly select walls and remove if it connects separate components
- **Characteristics**: Grows from multiple points simultaneously, uses Union-Find data structure
- **Time**: O(E log E) for edge sorting + O(E α(V)) for union-find operations
- **Best for**: Sparse graphs, different visual aesthetic than Prim's

#### 3. Randomized Depth-First Search (Recursive Backtracker)
- **Process**: Random walk with backtracking when hitting dead ends
- **Characteristics**: Simple to implement, creates long winding passages, fewer short dead ends
- **Time**: O(V)
- **Best for**: Simple implementation, creates different maze style

## Grid Type Representations

### Rectangular Grids
- **Coordinates**: Simple (row, col) indexing
- **Neighbors**: 4-connected (up, down, left, right)
- **Data Structure**: 2D array most efficient
- **Use Case**: Standard mazes, familiar coordinate system

### Hexagonal Grids
- **Neighbors**: 6-connected, equidistant from center
- **Coordinate Systems**:
  - **Cube Coordinates**: (x,y,z) with x+y+z=0 constraint - RECOMMENDED for algorithms
  - **Axial Coordinates**: (q,r) - good for storage/display  
  - **Offset Coordinates**: (row,col) with odd/even offset logic - familiar but complicated
- **Advantages**: More natural neighbor relationships, breaks up visual lines, better for organic patterns
- **Implementation**: Update algorithms to handle 6 neighbors instead of 4

### Other Grid Types
- **Triangular**: 3 or 12 neighbors depending on implementation
- **Polar**: Concentric circles with radial divisions, variable neighbor counts
- **Arbitrary**: Any connected graph structure

## Flexible Data Structure Design

### Graph-Based Approach (Recommended)
```typescript
interface GridCell {
  id: string;
  coordinates: Coordinates; // Flexible coordinate system
  neighbors: Set<string>; // Cell IDs of adjacent cells
  walls: Map<string, boolean>; // Wall state to each neighbor
}

interface Grid {
  cells: Map<string, GridCell>;
  coordinateSystem: CoordinateSystem;
  getNeighbors(cellId: string): string[];
  hasWall(from: string, to: string): boolean;
}
```

**Benefits**:
- Grid-agnostic algorithms (works for any topology)
- Efficient for sparse connectivity
- Supports arbitrary graph structures
- Clean separation of grid topology from maze algorithms

### Coordinate System Abstraction
```typescript
interface CoordinateSystem {
  getNeighbors(coords: Coordinates): Coordinates[];
  distance(a: Coordinates, b: Coordinates): number;
  toString(coords: Coordinates): string;
}

// Implementations: RectangularCoords, HexCubeCoords, HexAxialCoords, etc.
```

### Alternative: 2D Array (For Dense Rectangular Grids)
- More memory efficient for large dense rectangular grids
- Familiar indexing, cache-friendly access patterns
- Limited to rectangular topology

## Implementation Strategy

### Phase 1: Core Architecture
1. Abstract `Grid` interface supporting multiple coordinate systems
2. `Cell` and `CoordinateSystem` abstractions
3. Graph-based internal representation

### Phase 2: Coordinate Systems
1. Rectangular coordinates (simple case)
2. Hexagonal cube coordinates (most useful for algorithms)
3. Conversion utilities between coordinate systems

### Phase 3: Maze Algorithms
1. Generic spanning tree algorithms working on abstract `Grid`
2. Prim's algorithm (priority queue based)
3. Kruskal's algorithm (Union-Find based)
4. DFS algorithm (stack based)

### Phase 4: Specialized Grids
1. Hexagonal grid implementation
2. Triangular grid support
3. Polar coordinate grids

## Key Design Principles

1. **Algorithm Independence**: Maze algorithms should work on any grid topology
2. **Coordinate Flexibility**: Support multiple coordinate systems with conversion utilities
3. **Performance**: Use appropriate data structures (priority queues, Union-Find, etc.)
4. **Extensibility**: Easy to add new grid types and coordinate systems
5. **Type Safety**: Strong typing for coordinates and grid operations

## Testing Strategy

1. **Completeness**: Verify all cells reachable (spanning tree property)
2. **Perfection**: Verify exactly one path between any two cells (no cycles)
3. **Uniformity**: Statistical analysis of generated maze characteristics
4. **Performance**: Benchmark algorithms on different grid sizes and types

## References

- Red Blob Games: Hexagonal Grids (definitive guide for hex coordinates)
- Jamis Buck's Maze Generation blog series
- Wikipedia: Maze Generation Algorithms
- Various academic papers on MST algorithms
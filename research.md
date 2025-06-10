# Maze Generation: Spanning Tree Implementation Strategy

## Core Concept
Perfect maze = Spanning tree of grid graph (no cycles, all cells connected, exactly one path between any two points).

## Implementation Priority: Start Simple, Build Up

### Phase 1: Rectangular Grids + DFS Algorithm
- **Why DFS First**: Simplest to implement (O(V), stack-based, no complex data structures)
- **Why Rectangular**: Familiar (row,col) coordinates, 4 neighbors, easy ASCII rendering
- **Validation**: Test connectivity (BFS), acyclicity (edge count = vertices - 1)

### Phase 2: Add Prim's Algorithm  
- **Process**: Grow from single point using priority queue of frontier cells
- **Benefits**: Different maze aesthetic, demonstrates algorithm flexibility
- **Data Structure**: Priority queue for weighted random selection

### Phase 3: Hexagonal Grids (Future)
- **Coordinate System**: Cube coordinates (x,y,z) with x+y+z=0 for algorithms
- **Implementation**: 6 neighbors instead of 4, same spanning tree algorithms work

## Data Structure Design

Start simple, then generalize:

### Phase 1: 2D Array (Rectangular Only)
```typescript
class RectangularMaze {
  walls: boolean[][]; // walls[row][col] = has wall to right/down
  width: number;
  height: number;
}
```

### Phase 2: Graph-Based (Grid Agnostic)  
```typescript
interface Grid {
  cells: Map<string, Cell>;
  getNeighbors(cellId: string): string[];
  hasWall(from: string, to: string): boolean;
}
```

## Testing Strategy: Build Primitives First

### Core Validation Functions
```typescript
function isValidMaze(maze: Maze): boolean {
  return isConnected(maze) && hasNoCycles(maze);
}

function isConnected(maze: Maze): boolean {
  // BFS/DFS from any cell reaches all cells
}

function hasNoCycles(maze: Maze): boolean {
  // Edge count = vertex count - 1
}
```

### Test-Driven Development Sequence
1. **Grid Creation**: Test neighbor relationships, border handling
2. **ASCII Rendering**: Verify visual output matches expected patterns  
3. **DFS Algorithm**: Test produces valid spanning tree
4. **Maze Solving**: Test path finding works correctly
5. **Integration**: Test full pipeline works

### Property-Based Testing (fast-check)
```typescript
// Test maze properties hold for any valid grid size
fc.assert(fc.property(
  fc.integer({min: 3, max: 20}), 
  (size) => isValidMaze(generateMaze(size, size))
));
```

## Implementation Plan

1. **Start Simple**: Rectangular grid + DFS algorithm + ASCII rendering
2. **Test Thoroughly**: Each primitive tested before building next layer
3. **Validate Early**: Connectivity and cycle detection from day one
4. **Incremental**: Add Prim's algorithm, then hexagonal grids
5. **Property Testing**: Use fast-check for edge case discovery

## Key Trade-offs Made

- **Rectangular First**: Simpler than hexagonal, faster to validate
- **DFS First**: O(V) vs O(V log V), easier implementation 
- **2D Array Start**: More efficient than graph for dense rectangular grids
- **Testing Focus**: Prioritize correctness validation over performance optimization
- **ASCII Rendering**: Simple visual feedback for development
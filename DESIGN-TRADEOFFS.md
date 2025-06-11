# Design Trade-offs Analysis

## 1. Cell Identification Strategy

### Option A: String IDs (e.g., "3,4", "q,r,s")
```typescript
type CellId = string;
cells: Map<CellId, Point>;
```

**Pros:**
- Simple and uniform across all grid types
- Easy to debug (human-readable)
- Natural map keys
- Easy serialization

**Cons:**
- String parsing overhead
- No type safety on format
- Potential for malformed IDs

### Option B: Typed Coordinate Objects
```typescript
interface RectCoord { x: number; y: number; }
interface HexCoord { q: number; r: number; }
cells: Map<Coord, Point>;  // Need custom equality
```

**Pros:**
- Type safe
- No parsing needed
- Clear intent

**Cons:**
- Need custom Map equality for objects
- Different types for different grids (complex generics)
- More verbose

### Option C: Numeric IDs with Lookup
```typescript
type CellId = number;  // 0, 1, 2, ...
cells: Map<CellId, Point>;
coordToId: Map<string, CellId>;  // For lookups
```

**Pros:**
- Fast numeric operations
- Memory efficient
- Simple equality

**Cons:**
- Extra indirection
- Need to maintain two mappings
- Less debuggable

**Recommendation: Option A (String IDs)**
- Simplest to implement correctly
- Works uniformly across grid types
- Debugging ease outweighs performance cost

## 2. Hexagonal Coordinate System

### Option A: Axial Internally, Convert for Rendering
```typescript
class HexGrid {
  private cells: Map<string, HexCoord>;  // "q,r" -> {q, r}
  
  toCarthesian(hex: HexCoord): Point {
    // Convert when needed
  }
}
```

**Pros:**
- Clean hex math (neighbor calculation is simple)
- Standard hex algorithms work directly
- Clear separation of concerns

**Cons:**
- Conversion overhead
- Two coordinate systems to understand

### Option B: Cartesian Throughout
```typescript
class HexGrid {
  private cells: Map<string, Point>;  // Store x,y directly
  
  getNeighbors(id: string): string[] {
    // Complex math for hex neighbors in x,y
  }
}
```

**Pros:**
- Uniform Point interface
- No conversion needed
- Renderer ready

**Cons:**
- Hex neighbor math is complex in x,y
- Fractional coordinates everywhere
- Hard to debug hex algorithms

### Option C: Abstract Coordinate Interface
```typescript
interface Coordinate {
  toPoint(): Point;
}
class HexCoord implements Coordinate { ... }
```

**Pros:**
- Type safe
- Each grid optimal internally

**Cons:**
- More complex type system
- Need to handle multiple coordinate types

**Recommendation: Option A (Axial Internal)**
- Hex algorithms are well-studied in axial
- Conversion is simple and isolated
- Best of both worlds

## 3. Solution Path Representation

### Option A: Array of Cell IDs
```typescript
type Solution = string[];  // ["0,0", "0,1", "1,1", ...]
```

**Pros:**
- Simple and clear
- Easy to validate (check adjacency)
- Grid agnostic

**Cons:**
- Need to look up points for rendering

### Option B: Array of Points
```typescript
type Solution = Point[];  // [{x:0,y:0}, {x:0,y:1}, ...]
```

**Pros:**
- Renderer ready
- No lookups needed

**Cons:**
- Loses cell identity
- Harder to validate adjacency

### Option C: Path Object
```typescript
interface Path {
  cells: string[];
  segments: Array<[Point, Point]>;  // For rendering
}
```

**Pros:**
- Best of both worlds
- Validation and rendering ready

**Cons:**
- More complex
- Redundant data

**Recommendation: Option A (Cell IDs)**
- Simplest representation
- Validation is important
- Renderer can easily convert

## 4. Wall Representation Between Cells

### Option A: Sorted Pair ID
```typescript
class Wall {
  id: string;  // "cell1|cell2" where cell1 < cell2
}
```

**Pros:**
- Guarantees uniqueness
- Simple string operations
- Easy to debug

**Cons:**
- String manipulation overhead

### Option B: Directional Edges
```typescript
class Wall {
  from: string;
  to: string;
  // Store both directions
}
```

**Pros:**
- Natural for directed algorithms
- No sorting needed

**Cons:**
- Duplicate data
- Need to handle both directions

### Option C: Edge Set with Custom Equality
```typescript
class WallSet {
  has(cell1: string, cell2: string): boolean {
    // Check both orders
  }
}
```

**Pros:**
- Clean API
- No ID needed

**Cons:**
- More complex implementation
- Hidden complexity

**Recommendation: Option A (Sorted Pair)**
- Simple and correct
- One wall per cell pair
- String overhead negligible

## Overall Architecture Recommendation

Based on these trade-offs, the simplest correct design:

1. **Use string IDs** for cells (uniform, simple)
2. **Axial coordinates** for hex grids (clean algorithms)
3. **Cell ID arrays** for solutions (validation friendly)
4. **Sorted pair IDs** for walls (guarantees uniqueness)

This gives us:
- Uniform interfaces across grid types
- Simple, correct implementations
- Easy debugging
- Minimal code complexity

The slight performance overhead of strings is worth the correctness and simplicity gains.
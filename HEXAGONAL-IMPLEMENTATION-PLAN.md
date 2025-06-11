# Hexagonal Maze Implementation: Adversarial Planning

## What Could Go Wrong? (Failure Modes)

### 1. **Coordinate System Leakage** 
**Problem**: Mixing axial (q,r) and cartesian (x,y) coordinates throughout the system
**Symptoms**: 
- Renderer tries to use axial coordinates directly
- Neighbor calculations use cartesian math on axial coords
- String parsing fails with negative coordinates

**Prevention**:
- Keep axial coordinates strictly internal to HexagonalGrid
- Only expose cartesian via `position()` method
- Test coordinate conversion extensively

### 2. **Neighbor Calculation Errors**
**Problem**: Wrong offsets for the 6 hexagonal neighbors
**Symptoms**:
- Cells have wrong number of neighbors
- Maze generation creates impossible passages
- Solutions path through non-adjacent cells

**Prevention**:
```typescript
// Standard axial neighbor offsets (test these!)
const HEX_DIRECTIONS = [
  [1, 0], [-1, 0],    // East, West
  [0, 1], [0, -1],    // Southeast, Northwest  
  [1, -1], [-1, 1]    // Northeast, Southwest
];
```

### 3. **Boundary Detection Failure**
**Problem**: Hexagonal boundaries are not rectangles - complex shape detection
**Symptoms**:
- Some boundary cells not detected
- Entrance/exit placed in wrong locations
- Boundary passages created for internal cells

**Prevention**:
- Use mathematical distance from center for boundary detection
- Test boundary detection for each cell explicitly
- Verify entrance/exit are actually on boundary

### 4. **ASCII Rendering Chaos**
**Problem**: Hexagonal layout doesn't map to rectangular ASCII grid
**Symptoms**:
- Overlapping characters
- Impossible to see maze structure
- Solution paths look wrong

**Prevention**:
- Design ASCII layout carefully with proper spacing
- Test with small hex grids first (radius 1, 2)
- Consider if ASCII renderer should be hex-specific

### 5. **SVG Positioning Errors** 
**Problem**: Hexagon positioning and drawing
**Symptoms**:
- Hexagons overlap or have gaps
- Solution path doesn't follow hex centers
- Walls drawn in wrong places

**Prevention**:
- Use standard hex-to-cartesian conversion formulas
- Draw hex boundaries correctly with proper geometry
- Test SVG output visually at each step

### 6. **String ID Parsing Issues**
**Problem**: Negative coordinates in string IDs like "-1,2"
**Symptoms**:
- Split fails or produces wrong results
- Cell lookups fail
- Passage creation breaks

**Prevention**:
- Test with negative coordinate strings explicitly
- Handle parsing edge cases properly
- Validate all string operations

## Implementation Plan: Correct by Construction

### Phase 1: Pure Coordinate Math (30 minutes)
**Goal**: Get hex coordinate system 100% correct before doing anything else

```typescript
class HexCoordinates {
  // Test these formulas extensively!
  static axialToCartesian(q: number, r: number): [number, number] {
    const x = q + r / 2;
    const y = r * Math.sqrt(3) / 2;
    return [x, y];
  }
  
  static getNeighborOffsets(): [number, number][] {
    return [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]];
  }
  
  static distanceFromCenter(q: number, r: number): number {
    return Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
  }
}
```

**Tests to write**:
- Center cell (0,0) converts to (0,0)
- Known hex positions convert correctly
- Distance calculation matches expected hex distances
- All 6 neighbors of center are distance 1

### Phase 2: HexagonalGrid Implementation (45 minutes)
**Goal**: Implement Grid interface with bulletproof hex logic

```typescript
class HexagonalGrid implements Grid {
  constructor(private radius: number) {
    if (radius < 1) throw new Error('Radius must be at least 1');
  }
  
  cells(): CellId[] {
    // Generate all cells within radius
    const cells: CellId[] = [];
    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius);
      const r2 = Math.min(this.radius, -q + this.radius);
      for (let r = r1; r <= r2; r++) {
        cells.push(`${q},${r}`);
      }
    }
    return cells;
  }
  
  neighbors(cell: CellId): CellId[] {
    const [q, r] = this.parseCell(cell);
    const neighbors: CellId[] = [];
    
    for (const [dq, dr] of HexCoordinates.getNeighborOffsets()) {
      const neighborCell = `${q + dq},${r + dr}`;
      if (this.isValidCell(neighborCell)) {
        neighbors.push(neighborCell);
      }
    }
    return neighbors;
  }
  
  private parseCell(cell: CellId): [number, number] {
    const parts = cell.split(',');
    if (parts.length !== 2) throw new Error(`Invalid cell ID: ${cell}`);
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  }
  
  private isValidCell(cell: CellId): boolean {
    try {
      const [q, r] = this.parseCell(cell);
      return HexCoordinates.distanceFromCenter(q, r) <= this.radius;
    } catch {
      return false;
    }
  }
}
```

**Critical tests**:
- Cell count formula: `3 * radius * (radius + 1) + 1`
- Center cell has exactly 6 neighbors
- Edge cells have 2-4 neighbors (never more than 6)
- All neighbors are valid cells
- Boundary detection works for all cells
- String parsing handles negative numbers

### Phase 3: Boundary and Entrance/Exit (30 minutes)
**Goal**: Get boundary detection and entrance/exit placement right

```typescript
// In HexagonalGrid class
boundaryPassages(cell: CellId): Passage[] {
  const [q, r] = this.parseCell(cell);
  
  // Only boundary cells can have boundary passages
  if (HexCoordinates.distanceFromCenter(q, r) !== this.radius) {
    return [];
  }
  
  // Create virtual "outside" cell
  // Strategy: extend in the direction away from center
  const outsideQ = q + Math.sign(q || 1);  // Handle q=0 case
  const outsideR = r + Math.sign(r || 1);  // Handle r=0 case
  
  return [makePassage(cell, `${outsideQ},${outsideR}`)];
}

entranceCell(): CellId {
  // Leftmost cell (minimum q coordinate)
  return `${-this.radius},0`;
}

exitCell(): CellId {
  // Rightmost cell (maximum q coordinate)  
  return `${this.radius},0`;
}
```

**Tests**:
- Entrance and exit are valid cells
- Entrance and exit are on boundary
- All boundary cells detected correctly
- Boundary passages point "outward"

### Phase 4: ASCII Renderer Adaptation (45 minutes)
**Goal**: Make hex mazes visible in ASCII without breaking existing logic

**Two strategies**:
1. **Hex-specific ASCII** - Draw actual hex shape
2. **Grid approximation** - Use existing grid renderer with offset rows

Choose **grid approximation** to minimize code changes:

```typescript
// In ASCIIRenderer, modify for hex layout
private hexOffset(y: number): string {
  return y % 2 === 1 ? ' ' : '';  // Offset odd rows
}
```

**Tests**:
- Small hex maze (radius 2) renders readably
- Solution path is visible
- Entrance and exit are marked

### Phase 5: SVG Hexagon Rendering (60 minutes)
**Goal**: Proper hexagonal visualization

```typescript
// In SVGRenderer, add hex support
private renderHexagon(centerX: number, centerY: number, size: number): string {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = centerX + size * Math.cos(angle);
    const y = centerY + size * Math.sin(angle);
    points.push([x, y]);
  }
  
  const pathData = `M ${points[0][0]} ${points[0][1]} ` +
    points.slice(1).map(([x, y]) => `L ${x} ${y}`).join(' ') + ' Z';
    
  return `<path d="${pathData}" stroke="black" fill="white"/>`;
}
```

**Tests**:
- Hexagons don't overlap
- Solution path connects hex centers
- Walls appear at hex boundaries

## Risk Mitigation Strategies

### 1. **Test-Driven Development**
Write tests BEFORE implementation for each method:
- Known cell counts for small radii
- Specific neighbor relationships  
- Boundary detection for edge cases
- Coordinate conversion spot checks

### 2. **Visual Validation**
Generate tiny test cases and manually verify:
- Radius 1 hex (7 cells) - can validate by hand
- Radius 2 hex (19 cells) - still manageable
- Check ASCII and SVG output at each step

### 3. **Property Testing** 
Generate random hex grids and verify:
- All cells have ≤ 6 neighbors
- Cell count matches formula
- All generated mazes are solvable
- Boundary cells detected correctly

### 4. **Incremental Integration**
Don't change everything at once:
- Test HexagonalGrid with existing maze generator
- Verify spanning tree algorithm works unchanged
- Test solver with hex mazes
- Only then update renderers

## Success Criteria

✅ **Mathematical correctness**: Coordinate conversions verified by hand  
✅ **Interface compliance**: Implements Grid interface exactly  
✅ **Visual validation**: ASCII and SVG output look correct  
✅ **Property preservation**: All existing maze properties hold  
✅ **Test coverage**: Same quality tests as rectangular grid  

## Timeline: 3-4 hours total
- Phase 1: Coordinate math (30 min)
- Phase 2: Grid implementation (45 min)  
- Phase 3: Boundary/entrance logic (30 min)
- Phase 4: ASCII adaptation (45 min)
- Phase 5: SVG hexagons (60 min)
- Testing/debugging: (30 min buffer)

The key is to **never move to the next phase until the current one is bulletproof**. Test each piece in isolation before combining.
# Hexagonal Grid Implementation Plan

## Why Previous Attempts Failed

1. **Coordinate system leakage** - Mixed axial and cartesian throughout
2. **Complex wall management** - Should have used passages from start  
3. **No incremental validation** - Built too much before testing basics
4. **Renderer coupling** - Grid logic knew about rendering concerns

## Correct-by-Construction Approach

### Phase 1: Axial Coordinate System (~30 lines)
```typescript
class HexagonalGrid implements Grid {
  constructor(private radius: number) {}
  
  // Use axial coordinates internally: "q,r" format
  cells(): CellId[] {
    const result: CellId[] = [];
    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius);
      const r2 = Math.min(this.radius, -q + this.radius);
      for (let r = r1; r <= r2; r++) {
        result.push(`${q},${r}`);
      }
    }
    return result;
  }
  
  // 6 neighbors in axial coordinates
  neighbors(cell: CellId): CellId[] {
    const [q, r] = cell.split(',').map(Number);
    return [
      `${q+1},${r}`,   `${q-1},${r}`,     // East, West
      `${q},${r+1}`,   `${q},${r-1}`,     // SE, NW  
      `${q+1},${r-1}`, `${q-1},${r+1}`    // NE, SW
    ].filter(neighbor => this.isValidCell(neighbor));
  }
  
  // Convert to cartesian only for rendering
  position(cell: CellId): [number, number] {
    const [q, r] = cell.split(',').map(Number);
    const x = q + r / 2;
    const y = r * Math.sqrt(3) / 2;
    return [x, y];
  }
}
```

### Phase 2: Test Axial Topology (Incremental!)
```typescript
test('hexagonal grid has correct cell count', () => {
  const grid = new HexagonalGrid(2);
  expect(grid.cells().length).toBe(19); // 1 + 6 + 12 for radius 2
});

test('center cell has 6 neighbors', () => {
  const grid = new HexagonalGrid(2);
  expect(grid.neighbors('0,0').length).toBe(6);
});

test('edge cells have fewer neighbors', () => {
  const grid = new HexagonalGrid(2);
  expect(grid.neighbors('2,0').length).toBe(3); // Edge cell
});
```

### Phase 3: Entrance/Exit Strategy
```typescript
entranceCell(): CellId {
  return `${-this.radius},0`; // Left edge
}

exitCell(): CellId {
  return `${this.radius},0`; // Right edge
}

boundaryPassages(cell: CellId): Passage[] {
  const [q, r] = cell.split(',').map(Number);
  
  // Check if on boundary (distance from origin equals radius)
  if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) === this.radius) {
    // Create virtual outside cell
    const outsideQ = q + Math.sign(q || 1);
    const outsideR = r + Math.sign(r || 1);
    return [makePassage(cell, `${outsideQ},${outsideR}`)];
  }
  
  return [];
}
```

### Phase 4: ASCII Renderer Adaptation
The current ASCII renderer needs minor updates for hex layouts:
- Different cell spacing (hexagonal packing)
- Diagonal connections for 6-neighbor topology
- Otherwise same logic (walls where passages don't exist)

### Phase 5: SVG Renderer Enhancement  
- Render hexagons instead of squares
- Adjust positioning for hex grid layout
- Same passage/wall logic applies

## Implementation Steps (1 hour total)

1. **Create HexagonalGrid class** (15 min)
   - Basic axial coordinate methods
   - Test cell count and neighbor relationships

2. **Test topology thoroughly** (15 min)  
   - Verify all cells have correct neighbors
   - Check boundary detection works
   - Validate entrance/exit placement

3. **Generate and validate hex mazes** (15 min)
   - Use existing maze generator (should work unchanged!)
   - Verify spanning tree properties hold
   - Test solver finds paths

4. **Update renderers** (15 min)
   - ASCII: adjust for hex layout
   - SVG: draw hexagons, position correctly

## Key Success Factors

1. **Keep coordinate systems separate** - Axial internal, cartesian for rendering only
2. **Test incrementally** - Validate each method before proceeding  
3. **Reuse existing algorithms** - Generator/solver should work unchanged
4. **Property-based testing** - Same invariants apply to hex mazes

## Expected Results

- **Same code volume** - ~30 lines for HexagonalGrid
- **Same algorithms** - No changes to generation/solving
- **Same interfaces** - Drop-in replacement for RectangularGrid
- **Same correctness** - All existing tests pass with hex grids

The beauty of our architecture is that hexagonal grids become trivial to add. The hard work was designing the right abstractions.
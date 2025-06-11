# Simple Hexagonal Grid Plan

## Keep It Minimal

**Goal**: Add hexagonal grids with ~50 lines of code, reusing everything else unchanged.

## The Minimal Implementation

```typescript
// src/hexagonal-grid.ts (~40 lines)
export class HexagonalGrid implements Grid {
  constructor(private radius: number) {}

  cells(): CellId[] {
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
    const [q, r] = cell.split(',').map(Number);
    return [
      `${q+1},${r}`, `${q-1},${r}`,      // E, W
      `${q},${r+1}`, `${q},${r-1}`,      // SE, NW
      `${q+1},${r-1}`, `${q-1},${r+1}`   // NE, SW
    ].filter(neighbor => this.isValid(neighbor));
  }

  entranceCell() { return `${-this.radius},0`; }
  exitCell() { return `${this.radius},0`; }

  boundaryPassages(cell: CellId): Passage[] {
    // Simple: if on edge, create one boundary passage
    const [q, r] = cell.split(',').map(Number);
    if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) === this.radius) {
      return [makePassage(cell, `outside-${cell}`)];
    }
    return [];
  }

  position(cell: CellId): [number, number] {
    const [q, r] = cell.split(',').map(Number);
    return [q + r / 2, r * 0.866]; // Standard hex conversion
  }

  private isValid(cell: CellId): boolean {
    const [q, r] = cell.split(',').map(Number);
    return Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= this.radius;
  }
}
```

## Simple Test (10 lines)
```typescript
test('hex grid basics', () => {
  const grid = new HexagonalGrid(2);
  expect(grid.cells().length).toBe(19); // 1 + 6 + 12
  expect(grid.neighbors('0,0').length).toBe(6);
  expect(grid.neighbors('2,0').length).toBe(3); // edge
});
```

## That's It!

- **No ASCII changes** - current renderer will work (might look weird but functional)
- **No SVG changes initially** - squares will work for testing
- **Same algorithms** - generation, solving, validation all unchanged
- **Total addition**: ~50 lines

## Test Plan
1. Write HexagonalGrid class
2. Test basic properties (cell count, neighbors)  
3. Generate hex maze - should work with existing code
4. Solve hex maze - should work with existing code
5. If it works, we're done. If not, minimal fixes.

## Why This Works
Our architecture is so clean that adding hex grids is trivial. The spanning tree algorithm doesn't care about topology. The solver doesn't care about grid shape. Only the Grid implementation changes.

**Estimated time**: 30 minutes to working hex mazes.
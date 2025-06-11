import { HexagonalGrid } from '../src/hexagonal-grid';

describe('HexagonalGrid', () => {
  describe('basic properties', () => {
    test('throws for invalid radius', () => {
      expect(() => new HexagonalGrid(0)).toThrow();
      expect(() => new HexagonalGrid(-1)).toThrow();
    });

    test('radius 1 has correct cell count', () => {
      const grid = new HexagonalGrid(1);
      const cells = grid.cells();
      
      // Radius 1 hex should have 7 cells: center + 6 surrounding
      // But let me verify this is actually correct
      console.log('Radius 1 cells:', cells);
      expect(cells.length).toBe(7);
      
      // Check if center cell exists
      expect(cells).toContain('0,0');
    });

    test('radius 2 has correct cell count', () => {
      const grid = new HexagonalGrid(2);
      const cells = grid.cells();
      
      // Radius 2 hex should have 19 cells
      // Formula: 3 * radius * (radius + 1) + 1 = 3 * 2 * 3 + 1 = 19
      // But this formula might be wrong
      console.log('Radius 2 cell count:', cells.length);
      console.log('First few cells:', cells.slice(0, 10));
      expect(cells.length).toBe(19);
    });
  });

  describe('neighbor relationships', () => {
    test('center cell should have 6 neighbors', () => {
      const grid = new HexagonalGrid(2);
      const neighbors = grid.neighbors('0,0');
      
      console.log('Center cell neighbors:', neighbors);
      expect(neighbors.length).toBe(6);
      
      // Verify these are the expected neighbors
      const expectedNeighbors = ['1,0', '-1,0', '0,1', '0,-1', '1,-1', '-1,1'];
      expect(neighbors.sort()).toEqual(expectedNeighbors.sort());
    });

    test('edge cells have fewer neighbors', () => {
      const grid = new HexagonalGrid(2);
      
      // Test a cell that should be on the edge
      const edgeCell = '2,0';
      const neighbors = grid.neighbors(edgeCell);
      
      console.log(`Edge cell ${edgeCell} neighbors:`, neighbors);
      expect(neighbors.length).toBeLessThan(6);
      expect(neighbors.length).toBeGreaterThan(0);
    });

    test('all neighbors are valid cells', () => {
      const grid = new HexagonalGrid(2);
      const allCells = new Set(grid.cells());
      
      for (const cell of grid.cells()) {
        const neighbors = grid.neighbors(cell);
        for (const neighbor of neighbors) {
          expect(allCells.has(neighbor)).toBe(true);
        }
      }
    });
  });

  describe('boundary detection', () => {
    test('entrance and exit are valid cells', () => {
      const grid = new HexagonalGrid(2);
      const entrance = grid.entranceCell();
      const exit = grid.exitCell();
      
      console.log('Entrance:', entrance);
      console.log('Exit:', exit);
      
      expect(grid.cells()).toContain(entrance);
      expect(grid.cells()).toContain(exit);
    });

    test('entrance and exit are on boundary', () => {
      const grid = new HexagonalGrid(2);
      const entrance = grid.entranceCell();
      const exit = grid.exitCell();
      
      const entranceBoundary = grid.boundaryPassages(entrance);
      const exitBoundary = grid.boundaryPassages(exit);
      
      console.log('Entrance boundary passages:', entranceBoundary);
      console.log('Exit boundary passages:', exitBoundary);
      
      expect(entranceBoundary.length).toBeGreaterThan(0);
      expect(exitBoundary.length).toBeGreaterThan(0);
    });

    test('center cell is not on boundary', () => {
      const grid = new HexagonalGrid(2);
      const centerBoundary = grid.boundaryPassages('0,0');
      
      expect(centerBoundary.length).toBe(0);
    });
  });

  describe('coordinate conversion', () => {
    test('center cell converts to origin', () => {
      const grid = new HexagonalGrid(2);
      const [x, y] = grid.position('0,0');
      
      console.log('Center position:', [x, y]);
      expect(x).toBeCloseTo(0);
      expect(y).toBeCloseTo(0);
    });

    test('known positions convert correctly', () => {
      const grid = new HexagonalGrid(2);
      
      // Test a few known conversions
      const pos1 = grid.position('1,0');
      const pos2 = grid.position('0,1');
      
      console.log('Position 1,0:', pos1);
      console.log('Position 0,1:', pos2);
      
      // These should be different positions
      expect(pos1[0]).not.toBeCloseTo(pos2[0]);
      expect(pos1[1]).not.toBeCloseTo(pos2[1]);
    });
  });

  describe('manual verification for small grid', () => {
    test('radius 1 grid visual check', () => {
      const grid = new HexagonalGrid(1);
      const cells = grid.cells();
      
      console.log('\n=== Radius 1 Hexagonal Grid ===');
      console.log('Total cells:', cells.length);
      console.log('All cells:', cells);
      
      for (const cell of cells) {
        const neighbors = grid.neighbors(cell);
        const position = grid.position(cell);
        const boundary = grid.boundaryPassages(cell);
        
        console.log(`Cell ${cell}:`);
        console.log(`  Position: [${position[0].toFixed(2)}, ${position[1].toFixed(2)}]`);
        console.log(`  Neighbors: [${neighbors.join(', ')}]`);
        console.log(`  Boundary passages: ${boundary.length}`);
      }
      
      // This is for manual verification - just ensure it runs
      expect(cells.length).toBeGreaterThan(0);
    });
  });
});
import { RectangularGrid } from '../src/rectangular-grid';

describe('RectangularGrid', () => {
  test('creates correct number of cells', () => {
    const grid = new RectangularGrid(3, 3);
    expect(grid.cells().length).toBe(9);
    expect(grid.cells()).toEqual([
      '0,0', '1,0', '2,0',
      '0,1', '1,1', '2,1',
      '0,2', '1,2', '2,2'
    ]);
  });

  test('throws for invalid dimensions', () => {
    expect(() => new RectangularGrid(1, 1)).toThrow();
    expect(() => new RectangularGrid(0, 5)).toThrow();
  });

  test('neighbors are correct for center cell', () => {
    const grid = new RectangularGrid(3, 3);
    expect(grid.neighbors('1,1').sort()).toEqual(['0,1', '1,0', '1,2', '2,1']);
  });

  test('neighbors are correct for corner cells', () => {
    const grid = new RectangularGrid(3, 3);
    expect(grid.neighbors('0,0').sort()).toEqual(['0,1', '1,0']);
    expect(grid.neighbors('2,2').sort()).toEqual(['1,2', '2,1']);
  });

  test('neighbors are correct for edge cells', () => {
    const grid = new RectangularGrid(3, 3);
    expect(grid.neighbors('1,0').sort()).toEqual(['0,0', '1,1', '2,0']);
    expect(grid.neighbors('0,1').sort()).toEqual(['0,0', '0,2', '1,1']);
  });

  test('entrance and exit are at opposite corners', () => {
    const grid = new RectangularGrid(5, 5);
    expect(grid.entranceCell()).toBe('0,0');
    expect(grid.exitCell()).toBe('4,4');
  });

  test('boundary passages are correct', () => {
    const grid = new RectangularGrid(3, 3);
    
    // Corner cells have 2 boundary passages
    expect(grid.boundaryWalls('0,0').sort()).toEqual([
      ['-1,0', '0,0'],
      ['0,-1', '0,0']
    ]);
    
    // Edge cells have 1 boundary passage
    expect(grid.boundaryWalls('1,0')).toEqual([['1,-1', '1,0']]);
    
    // Center cells have no boundary passages
    expect(grid.boundaryWalls('1,1')).toEqual([]);
  });

  test('position returns correct coordinates', () => {
    const grid = new RectangularGrid(3, 3);
    expect(grid.position('0,0')).toEqual([0, 0]);
    expect(grid.position('2,1')).toEqual([2, 1]);
  });

  test('all cells have valid neighbors', () => {
    const grid = new RectangularGrid(4, 4);
    const cellSet = new Set(grid.cells());
    
    for (const cell of grid.cells()) {
      const neighbors = grid.neighbors(cell);
      // Each neighbor should be a valid cell
      for (const neighbor of neighbors) {
        expect(cellSet.has(neighbor)).toBe(true);
      }
      // Should have 2-4 neighbors
      expect(neighbors.length).toBeGreaterThanOrEqual(2);
      expect(neighbors.length).toBeLessThanOrEqual(4);
    }
  });
});
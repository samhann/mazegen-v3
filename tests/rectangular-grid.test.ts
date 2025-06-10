import { RectangularGrid } from '../src/rectangular-grid';
import { Coordinates, Direction, coordinatesEqual } from '../src/coordinates';

describe('RectangularGrid', () => {
  describe('Grid Creation', () => {
    test('should create grid with valid dimensions', () => {
      const grid = new RectangularGrid(5, 3);
      expect(grid.width).toBe(5);
      expect(grid.height).toBe(3);
      expect(grid.getCellCount()).toBe(15);
    });

    test('should throw error for invalid dimensions', () => {
      expect(() => new RectangularGrid(0, 5)).toThrow('Grid dimensions must be positive');
      expect(() => new RectangularGrid(5, 0)).toThrow('Grid dimensions must be positive');
      expect(() => new RectangularGrid(-1, 5)).toThrow('Grid dimensions must be positive');
    });

    test('should create 1x1 grid', () => {
      const grid = new RectangularGrid(1, 1);
      expect(grid.getCellCount()).toBe(1);
    });
  });

  describe('Coordinate Validation', () => {
    const grid = new RectangularGrid(3, 4);

    test('should validate coordinates within grid', () => {
      expect(grid.isValidCoordinate({ row: 0, col: 0 })).toBe(true);
      expect(grid.isValidCoordinate({ row: 3, col: 2 })).toBe(true);
      expect(grid.isValidCoordinate({ row: 1, col: 1 })).toBe(true);
    });

    test('should reject coordinates outside grid', () => {
      expect(grid.isValidCoordinate({ row: -1, col: 0 })).toBe(false);
      expect(grid.isValidCoordinate({ row: 0, col: -1 })).toBe(false);
      expect(grid.isValidCoordinate({ row: 4, col: 0 })).toBe(false);
      expect(grid.isValidCoordinate({ row: 0, col: 3 })).toBe(false);
    });
  });

  describe('Neighbor Finding', () => {
    const grid = new RectangularGrid(3, 3);

    test('should find all 4 neighbors for center cell', () => {
      const neighbors = grid.getNeighbors({ row: 1, col: 1 });
      expect(neighbors).toHaveLength(4);
      
      const expectedNeighbors = [
        { row: 0, col: 1 }, // North
        { row: 2, col: 1 }, // South
        { row: 1, col: 2 }, // East
        { row: 1, col: 0 }  // West
      ];
      
      expectedNeighbors.forEach(expected => {
        expect(neighbors.some(neighbor => coordinatesEqual(neighbor, expected))).toBe(true);
      });
    });

    test('should find 2 neighbors for corner cell', () => {
      const neighbors = grid.getNeighbors({ row: 0, col: 0 });
      expect(neighbors).toHaveLength(2);
      
      const expectedNeighbors = [
        { row: 1, col: 0 }, // South
        { row: 0, col: 1 }  // East
      ];
      
      expectedNeighbors.forEach(expected => {
        expect(neighbors.some(neighbor => coordinatesEqual(neighbor, expected))).toBe(true);
      });
    });

    test('should find 0 neighbors for 1x1 grid', () => {
      const smallGrid = new RectangularGrid(1, 1);
      const neighbors = smallGrid.getNeighbors({ row: 0, col: 0 });
      expect(neighbors).toHaveLength(0);
    });
  });

  describe('Wall Management', () => {
    let grid: RectangularGrid;

    beforeEach(() => {
      grid = new RectangularGrid(3, 3);
    });

    test('should initialize with all internal walls present', () => {
      expect(grid.hasWall({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true);
      expect(grid.hasWall({ row: 0, col: 0 }, { row: 1, col: 0 })).toBe(true);
      expect(grid.hasWall({ row: 1, col: 1 }, { row: 1, col: 2 })).toBe(true);
    });

    test('should have walls at grid boundaries', () => {
      expect(grid.hasWall({ row: 0, col: 0 }, { row: -1, col: 0 })).toBe(true);
      expect(grid.hasWall({ row: 0, col: 0 }, { row: 0, col: -1 })).toBe(true);
      expect(grid.hasWall({ row: 2, col: 2 }, { row: 3, col: 2 })).toBe(true);
      expect(grid.hasWall({ row: 2, col: 2 }, { row: 2, col: 3 })).toBe(true);
    });

    test('should remove walls between adjacent cells', () => {
      const from = { row: 0, col: 0 };
      const to = { row: 0, col: 1 };
      
      expect(grid.hasWall(from, to)).toBe(true);
      grid.removeWall(from, to);
      expect(grid.hasWall(from, to)).toBe(false);
      expect(grid.hasWall(to, from)).toBe(false);
    });

    test('should throw error when trying to remove border walls', () => {
      const validCell = { row: 1, col: 1 };
      const invalidCell = { row: -1, col: 0 };
      
      expect(grid.hasWall(validCell, invalidCell)).toBe(true);
      expect(() => grid.removeWall(validCell, invalidCell))
        .toThrow('Cannot remove border walls directly. Use addEntryPoint() for entry/exit points.');
    });
  });

  describe('Cell Operations', () => {
    test('should return all cells in correct order', () => {
      const grid = new RectangularGrid(2, 2);
      const cells = grid.getAllCells();
      
      expect(cells).toHaveLength(4);
      expect(cells).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 }
      ]);
    });

    test('should return correct cell count', () => {
      expect(new RectangularGrid(3, 4).getCellCount()).toBe(12);
      expect(new RectangularGrid(1, 1).getCellCount()).toBe(1);
      expect(new RectangularGrid(10, 5).getCellCount()).toBe(50);
    });
  });
});
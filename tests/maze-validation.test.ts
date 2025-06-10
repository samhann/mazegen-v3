import { MazeValidator, RectangularGrid, MazeGenerator } from '../src/maze';

describe('Maze Validation', () => {
  describe('Basic Validation', () => {
    test('should validate 1x1 grid as perfect maze', () => {
      const grid = new RectangularGrid(1, 1);
      const result = MazeValidator.validate(grid);
      
      expect(result.isValid).toBe(true);
      expect(result.isConnected).toBe(true);
      expect(result.hasNoCycles).toBe(true);
      expect(result.cellCount).toBe(1);
      expect(result.passageCount).toBe(0);
    });

    test('should detect disconnected 2x2 grid', () => {
      const grid = new RectangularGrid(2, 2);
      // No walls removed - all cells isolated
      const result = MazeValidator.validate(grid);
      
      expect(result.isValid).toBe(false);
      expect(result.isConnected).toBe(false);
      expect(result.cellCount).toBe(4);
      expect(result.passageCount).toBe(0);
    });

    test('should validate simple connected 2x2 maze', () => {
      const grid = new RectangularGrid(2, 2);
      // Create spanning tree: (0,0) -> (0,1) -> (1,1) -> (1,0)
      grid.removeWall({ row: 0, col: 0 }, { row: 0, col: 1 });
      grid.removeWall({ row: 0, col: 1 }, { row: 1, col: 1 });
      grid.removeWall({ row: 1, col: 1 }, { row: 1, col: 0 });
      
      const result = MazeValidator.validate(grid);
      
      expect(result.isValid).toBe(true);
      expect(result.isConnected).toBe(true);
      expect(result.hasNoCycles).toBe(true);
      expect(result.cellCount).toBe(4);
      expect(result.passageCount).toBe(3); // 4 cells - 1 = 3 edges
    });

    test('should detect maze with cycle', () => {
      const grid = new RectangularGrid(2, 2);
      // Create cycle by connecting all adjacent pairs
      grid.removeWall({ row: 0, col: 0 }, { row: 0, col: 1 });
      grid.removeWall({ row: 0, col: 0 }, { row: 1, col: 0 });
      grid.removeWall({ row: 0, col: 1 }, { row: 1, col: 1 });
      grid.removeWall({ row: 1, col: 0 }, { row: 1, col: 1 });
      
      const result = MazeValidator.validate(grid);
      
      expect(result.isValid).toBe(false);
      expect(result.isConnected).toBe(true);
      expect(result.hasNoCycles).toBe(false);
      expect(result.cellCount).toBe(4);
      expect(result.passageCount).toBe(4); // Too many edges
    });
  });

  describe('Generated Maze Validation', () => {
    test('should validate DFS-generated mazes as perfect', () => {
      const sizes = [3, 5, 8];
      
      for (const size of sizes) {
        const maze = MazeGenerator.createMaze(size, size, { 
          seed: 12345,
          addDefaultEntryExit: false 
        });
        
        const result = MazeValidator.validate(maze);
        
        expect(result.isValid).toBe(true);
        expect(result.cellCount).toBe(size * size);
        expect(result.passageCount).toBe(size * size - 1);
      }
    });

    test('should validate different sized mazes', () => {
      const dimensions = [[3, 4], [2, 5], [4, 3]];
      
      for (const [width, height] of dimensions) {
        const maze = MazeGenerator.createMaze(width, height, { 
          seed: 54321,
          addDefaultEntryExit: false 
        });
        
        const result = MazeValidator.validate(maze);
        
        expect(result.isValid).toBe(true);
        expect(result.cellCount).toBe(width * height);
        expect(result.passageCount).toBe(width * height - 1);
      }
    });
  });

  describe('Passage Counting', () => {
    test('should count passages correctly', () => {
      const grid = new RectangularGrid(2, 2);
      
      expect(MazeValidator.countPassages(grid)).toBe(0);
      
      grid.removeWall({ row: 0, col: 0 }, { row: 0, col: 1 });
      expect(MazeValidator.countPassages(grid)).toBe(1);
      
      grid.removeWall({ row: 0, col: 1 }, { row: 1, col: 1 });
      expect(MazeValidator.countPassages(grid)).toBe(2);
    });
  });

  describe('Connectivity Analysis', () => {
    test('should find reachable cells', () => {
      const grid = new RectangularGrid(3, 1);
      // Create path: (0,0) -> (0,1) -> (0,2)
      grid.removeWall({ row: 0, col: 0 }, { row: 0, col: 1 });
      grid.removeWall({ row: 0, col: 1 }, { row: 0, col: 2 });
      
      const reachable = MazeValidator.getReachableCells(grid, { row: 0, col: 0 });
      
      expect(reachable.size).toBe(3);
      expect(reachable.has('0,0')).toBe(true);
      expect(reachable.has('0,1')).toBe(true);
      expect(reachable.has('0,2')).toBe(true);
    });

    test('should identify disconnected components', () => {
      const grid = new RectangularGrid(4, 1);
      // Create two components: (0,0)-(0,1) and (0,2)-(0,3)
      grid.removeWall({ row: 0, col: 0 }, { row: 0, col: 1 });
      grid.removeWall({ row: 0, col: 2 }, { row: 0, col: 3 });
      
      const info = MazeValidator.getConnectivityInfo(grid);
      
      expect(info.isFullyConnected).toBe(false);
      expect(info.components).toHaveLength(2);
      expect(info.largestComponentSize).toBe(2);
    });
  });
});
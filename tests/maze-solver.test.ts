import { MazeSolver, RectangularGrid, MazeGenerator } from '../src/maze';

describe('MazeSolver', () => {
  describe('Basic Path Finding', () => {
    test('should find path in simple 2x2 maze', () => {
      const grid = new RectangularGrid(2, 2);
      // Create path: (0,0) -> (0,1) -> (1,1) -> (1,0)
      grid.removeWall({ row: 0, col: 0 }, { row: 0, col: 1 });
      grid.removeWall({ row: 0, col: 1 }, { row: 1, col: 1 });
      grid.removeWall({ row: 1, col: 1 }, { row: 1, col: 0 });
      
      const solution = MazeSolver.findPath(grid, { row: 0, col: 0 }, { row: 1, col: 0 });
      
      expect(solution.found).toBe(true);
      expect(solution.path).toHaveLength(4);
      expect(solution.length).toBe(3);
      expect(solution.path[0]).toEqual({ row: 0, col: 0 });
      expect(solution.path[3]).toEqual({ row: 1, col: 0 });
    });

    test('should return no path when maze is disconnected', () => {
      const grid = new RectangularGrid(2, 2);
      // No walls removed - cells are isolated
      
      const solution = MazeSolver.findPath(grid, { row: 0, col: 0 }, { row: 1, col: 1 });
      
      expect(solution.found).toBe(false);
      expect(solution.path).toHaveLength(0);
      expect(solution.length).toBe(0);
    });

    test('should handle same start and end point', () => {
      const grid = new RectangularGrid(2, 2);
      
      const solution = MazeSolver.findPath(grid, { row: 0, col: 0 }, { row: 0, col: 0 });
      
      expect(solution.found).toBe(true);
      expect(solution.path).toHaveLength(1);
      expect(solution.length).toBe(0);
    });

    test('should handle invalid coordinates', () => {
      const grid = new RectangularGrid(2, 2);
      
      const solution = MazeSolver.findPath(grid, { row: -1, col: 0 }, { row: 1, col: 1 });
      
      expect(solution.found).toBe(false);
    });
  });

  describe('Solution Path Finding', () => {
    test('should find solution path with entry/exit points', () => {
      const maze = MazeGenerator.createMaze(5, 5, { 
        seed: 12345,
        addDefaultEntryExit: true 
      });
      
      const solution = MazeSolver.findSolutionPath(maze);
      
      expect(solution.found).toBe(true);
      expect(solution.path.length).toBeGreaterThan(1);
      expect(solution.path[0]).toEqual({ row: 0, col: 0 }); // Entry
      expect(solution.path[solution.path.length - 1]).toEqual({ row: 4, col: 4 }); // Exit
    });

    test('should return no solution when no entry points exist', () => {
      const maze = MazeGenerator.createMaze(3, 3, { 
        addDefaultEntryExit: false 
      });
      
      const solution = MazeSolver.findSolutionPath(maze);
      
      expect(solution.found).toBe(false);
    });
  });

  describe('Maze Analysis', () => {
    test('should count dead ends correctly', () => {
      const grid = new RectangularGrid(3, 1);
      // Linear maze: (0,0) -> (0,1) -> (0,2)
      grid.removeWall({ row: 0, col: 0 }, { row: 0, col: 1 });
      grid.removeWall({ row: 0, col: 1 }, { row: 0, col: 2 });
      
      const deadEnds = MazeSolver.countDeadEnds(grid);
      
      expect(deadEnds).toBe(2); // Both ends are dead ends
    });

    test('should analyze maze difficulty', () => {
      const maze = MazeGenerator.createMaze(4, 4, { 
        seed: 999,
        addDefaultEntryExit: true 
      });
      
      const analysis = MazeSolver.analyzeDifficulty(maze);
      
      expect(analysis.hasSolution).toBe(true);
      expect(analysis.solutionLength).toBeGreaterThan(0);
      expect(analysis.solutionRatio).toBeGreaterThan(0);
      expect(analysis.solutionRatio).toBeLessThanOrEqual(1);
      expect(analysis.deadEnds).toBeGreaterThan(0);
    });

    test('should check if maze is solvable', () => {
      const solvableMaze = MazeGenerator.createMaze(3, 3, { 
        addDefaultEntryExit: true 
      });
      
      const unsolvableMaze = new RectangularGrid(3, 3);
      // No entry points
      
      expect(MazeSolver.isSolvable(solvableMaze)).toBe(true);
      expect(MazeSolver.isSolvable(unsolvableMaze)).toBe(false);
    });
  });

  describe('Path Finding Edge Cases', () => {
    test('should find shortest path when multiple paths exist', () => {
      const grid = new RectangularGrid(3, 3);
      // Create a grid with multiple paths
      grid.removeWall({ row: 0, col: 0 }, { row: 0, col: 1 });
      grid.removeWall({ row: 0, col: 1 }, { row: 0, col: 2 });
      grid.removeWall({ row: 0, col: 0 }, { row: 1, col: 0 });
      grid.removeWall({ row: 1, col: 0 }, { row: 2, col: 0 });
      grid.removeWall({ row: 2, col: 0 }, { row: 2, col: 1 });
      grid.removeWall({ row: 2, col: 1 }, { row: 2, col: 2 });
      
      const solution = MazeSolver.findPath(grid, { row: 0, col: 0 }, { row: 2, col: 2 });
      
      expect(solution.found).toBe(true);
      // BFS should find one of the shortest paths
      expect(solution.length).toBeGreaterThan(0);
    });

    test('should work with 1x1 maze', () => {
      const grid = new RectangularGrid(1, 1);
      
      const solution = MazeSolver.findPath(grid, { row: 0, col: 0 }, { row: 0, col: 0 });
      
      expect(solution.found).toBe(true);
      expect(solution.path).toHaveLength(1);
    });
  });

  describe('Performance', () => {
    test('should solve large mazes efficiently', () => {
      const startTime = Date.now();
      
      const maze = MazeGenerator.createMaze(25, 25, { 
        seed: 42,
        addDefaultEntryExit: true 
      });
      
      const solution = MazeSolver.findSolutionPath(maze);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(solution.found).toBe(true);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });
});
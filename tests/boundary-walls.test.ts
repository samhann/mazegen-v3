import { generateMaze } from '../src/maze-generator';
import { RectangularGrid } from '../src/rectangular-grid';
import { HexagonalGrid } from '../src/hexagonal-grid';

describe('Boundary Wall Tests', () => {
  describe('RectangularGrid', () => {
    it('should have solid perimeter walls with openings only at entrance and exit', () => {
      const grid = new RectangularGrid(5, 5);
      const maze = generateMaze(grid);
      
      // Check that boundary cells don't have passages to the outside
      // except at entrance (0,0) and exit (4,4)
      const cells = Array.from(maze.cells);
      
      for (const cell of cells) {
        const [x, y] = cell.split(',').map(Number);
        const isBoundary = x === 0 || x === 4 || y === 0 || y === 4;
        const isEntrance = cell === '0,0';
        const isExit = cell === '4,4';
        
        if (isBoundary && !isEntrance && !isExit) {
          // Boundary cells (except entrance/exit) should not have passages to virtual outside nodes
          const boundaries = grid.boundaryWalls(cell);
          for (const boundary of boundaries) {
            // Check this boundary passage is NOT in the maze passages
            let found = false;
            for (const passage of maze.passages) {
              if ((passage[0] === boundary[0] && passage[1] === boundary[1]) ||
                  (passage[0] === boundary[1] && passage[1] === boundary[0])) {
                found = true;
                break;
              }
            }
            expect(found).toBe(false);
          }
        }
      }
    });
    
    it('should create a valid connected maze', () => {
      const grid = new RectangularGrid(10, 10);
      const maze = generateMaze(grid);
      
      // Build adjacency list
      const adj = new Map<string, Set<string>>();
      for (const cell of maze.cells) {
        adj.set(cell, new Set());
      }
      
      for (const [a, b] of maze.passages) {
        if (maze.cells.has(a) && maze.cells.has(b)) {
          adj.get(a)!.add(b);
          adj.get(b)!.add(a);
        }
      }
      
      // BFS to check connectivity
      const visited = new Set<string>();
      const queue = [maze.entrance];
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);
        
        for (const neighbor of adj.get(current) || []) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor);
          }
        }
      }
      
      // All cells should be reachable
      expect(visited.size).toBe(maze.cells.size);
      expect(visited.has(maze.exit)).toBe(true);
    });
  });
  
  describe('HexagonalGrid', () => {
    it('should have solid perimeter walls with openings only at entrance and exit', () => {
      const grid = new HexagonalGrid(2);
      const maze = generateMaze(grid);
      
      const entrance = grid.entranceCell();
      const exit = grid.exitCell();
      
      // Check boundary cells
      const cells = Array.from(maze.cells);
      for (const cell of cells) {
        const boundaries = grid.boundaryWalls(cell);
        if (boundaries.length > 0 && cell !== entrance && cell !== exit) {
          // This is a boundary cell that's not entrance/exit
          // Its boundary passages should NOT be in the maze
          for (const boundary of boundaries) {
            let found = false;
            for (const passage of maze.passages) {
              if ((passage[0] === boundary[0] && passage[1] === boundary[1]) ||
                  (passage[0] === boundary[1] && passage[1] === boundary[0])) {
                found = true;
                break;
              }
            }
            expect(found).toBe(false);
          }
        }
      }
    });
  });
});
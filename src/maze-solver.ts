import { RectangularGrid } from './rectangular-grid';
import { Coordinates, coordinatesToString, coordinatesEqual, Direction, DIRECTION_DELTAS, addCoordinates } from './coordinates';

export interface SolutionPath {
  path: Coordinates[];
  length: number;
  found: boolean;
}

export class MazeSolver {
  /**
   * Finds the shortest path between two points using BFS
   */
  static findPath(grid: RectangularGrid, start: Coordinates, end: Coordinates): SolutionPath {
    if (!grid.isValidCoordinate(start) || !grid.isValidCoordinate(end)) {
      return { path: [], length: 0, found: false };
    }
    
    if (coordinatesEqual(start, end)) {
      return { path: [start], length: 0, found: true };
    }
    
    const visited = new Set<string>();
    const queue: { cell: Coordinates; path: Coordinates[] }[] = [];
    
    queue.push({ cell: start, path: [start] });
    visited.add(coordinatesToString(start));
    
    while (queue.length > 0) {
      const { cell: current, path } = queue.shift()!;
      
      // Check all neighbors
      const neighbors = grid.getNeighbors(current);
      
      for (const neighbor of neighbors) {
        const neighborKey = coordinatesToString(neighbor);
        
        // Skip if already visited or if there's a wall
        if (visited.has(neighborKey) || grid.hasWall(current, neighbor)) {
          continue;
        }
        
        const newPath = [...path, neighbor];
        
        // Check if we reached the end
        if (coordinatesEqual(neighbor, end)) {
          return {
            path: newPath,
            length: newPath.length - 1,
            found: true
          };
        }
        
        visited.add(neighborKey);
        queue.push({ cell: neighbor, path: newPath });
      }
    }
    
    return { path: [], length: 0, found: false };
  }
  
  /**
   * Finds path between entry and exit points (if they exist)
   */
  static findSolutionPath(grid: RectangularGrid): SolutionPath {
    const entryPoints = grid.getEntryPoints();
    
    if (entryPoints.length < 2) {
      return { path: [], length: 0, found: false };
    }
    
    // Find entry and exit points (typically first and last)
    const entry = entryPoints[0].cell;
    const exit = entryPoints[entryPoints.length - 1].cell;
    
    return this.findPath(grid, entry, exit);
  }
  
  /**
   * Gets the cell adjacent to a border entry point (where you actually enter the maze)
   */
  static getEntryCell(grid: RectangularGrid, entryPoint: { cell: Coordinates; direction: Direction }): Coordinates {
    // The entry cell is the cell inside the maze that connects to the entry point
    return entryPoint.cell;
  }
  
  /**
   * Finds all possible paths between two points (useful for analysis)
   */
  static findAllPaths(
    grid: RectangularGrid, 
    start: Coordinates, 
    end: Coordinates,
    maxPaths: number = 100
  ): SolutionPath[] {
    const paths: SolutionPath[] = [];
    
    const dfs = (current: Coordinates, target: Coordinates, path: Coordinates[], visited: Set<string>) => {
      if (paths.length >= maxPaths) return;
      
      if (coordinatesEqual(current, target)) {
        paths.push({
          path: [...path],
          length: path.length - 1,
          found: true
        });
        return;
      }
      
      const neighbors = grid.getNeighbors(current);
      
      for (const neighbor of neighbors) {
        const neighborKey = coordinatesToString(neighbor);
        
        if (!visited.has(neighborKey) && !grid.hasWall(current, neighbor)) {
          visited.add(neighborKey);
          path.push(neighbor);
          
          dfs(neighbor, target, path, visited);
          
          path.pop();
          visited.delete(neighborKey);
        }
      }
    };
    
    const visited = new Set<string>();
    visited.add(coordinatesToString(start));
    dfs(start, end, [start], visited);
    
    return paths;
  }
  
  /**
   * Checks if a maze is solvable (has path from entry to exit)
   */
  static isSolvable(grid: RectangularGrid): boolean {
    const solution = this.findSolutionPath(grid);
    return solution.found;
  }
  
  /**
   * Gets maze difficulty metrics based on solution characteristics
   */
  static analyzeDifficulty(grid: RectangularGrid): {
    solutionLength: number;
    solutionRatio: number;
    deadEnds: number;
    hasSolution: boolean;
  } {
    const solution = this.findSolutionPath(grid);
    const deadEnds = this.countDeadEnds(grid);
    const totalCells = grid.getCellCount();
    
    return {
      solutionLength: solution.length,
      solutionRatio: totalCells > 0 ? solution.length / totalCells : 0,
      deadEnds,
      hasSolution: solution.found
    };
  }
  
  /**
   * Counts dead ends in the maze (cells with only one passage)
   */
  static countDeadEnds(grid: RectangularGrid): number {
    let deadEnds = 0;
    const allCells = grid.getAllCells();
    
    for (const cell of allCells) {
      const neighbors = grid.getNeighbors(cell);
      let openPassages = 0;
      
      for (const neighbor of neighbors) {
        if (!grid.hasWall(cell, neighbor)) {
          openPassages++;
        }
      }
      
      if (openPassages === 1) {
        deadEnds++;
      }
    }
    
    return deadEnds;
  }
}
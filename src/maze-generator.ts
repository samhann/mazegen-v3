import { RectangularGrid } from './rectangular-grid';
import { Coordinates, coordinatesToString, coordinatesEqual, Direction } from './coordinates';

export interface MazeGenerationOptions {
  seed?: number;
  startCell?: Coordinates;
  addDefaultEntryExit?: boolean;
}

export class MazeGenerator {
  private rng: () => number;
  
  constructor(seed?: number) {
    // Simple seeded random number generator for reproducible results
    if (seed !== undefined) {
      let state = seed;
      this.rng = () => {
        state = (state * 1103515245 + 12345) % 2147483648;
        return state / 2147483648;
      };
    } else {
      this.rng = Math.random;
    }
  }

  /**
   * Generates a maze using Depth-First Search (Recursive Backtracker) algorithm
   */
  generateWithDFS(grid: RectangularGrid, options: MazeGenerationOptions = {}): void {
    const visited = new Set<string>();
    const stack: Coordinates[] = [];
    
    // Choose starting cell (default to top-left)
    const startCell = options.startCell || { row: 0, col: 0 };
    if (!grid.isValidCoordinate(startCell)) {
      throw new Error('Invalid start cell coordinates');
    }
    
    // Start DFS from the chosen cell
    let currentCell = startCell;
    visited.add(coordinatesToString(currentCell));
    
    const totalCells = grid.getCellCount();
    
    while (visited.size < totalCells) {
      const unvisitedNeighbors = this.getUnvisitedNeighbors(grid, currentCell, visited);
      
      if (unvisitedNeighbors.length > 0) {
        // Choose a random unvisited neighbor
        const randomIndex = Math.floor(this.rng() * unvisitedNeighbors.length);
        const chosenNeighbor = unvisitedNeighbors[randomIndex];
        
        // Push current cell to stack for backtracking
        stack.push(currentCell);
        
        // Remove wall between current cell and chosen neighbor
        grid.removeWall(currentCell, chosenNeighbor);
        
        // Move to chosen neighbor
        currentCell = chosenNeighbor;
        visited.add(coordinatesToString(currentCell));
      } else {
        // Backtrack: no unvisited neighbors, go back to previous cell
        if (stack.length > 0) {
          currentCell = stack.pop()!;
        } else {
          // This should not happen if the grid is connected
          break;
        }
      }
    }
  }
  
  private getUnvisitedNeighbors(
    grid: RectangularGrid, 
    cell: Coordinates, 
    visited: Set<string>
  ): Coordinates[] {
    // Only consider neighbors that are valid cells (internal to the grid)
    // This automatically excludes border walls since getNeighbors only returns valid coordinates
    return grid.getNeighbors(cell).filter(neighbor => 
      !visited.has(coordinatesToString(neighbor))
    );
  }
  
  /**
   * Adds default entry and exit points to a maze
   */
  addDefaultEntryExit(grid: RectangularGrid): void {
    // Add entry at top-left
    grid.addEntryPoint({ row: 0, col: 0 }, Direction.North);
    
    // Add exit at bottom-right
    const exitRow = grid.height - 1;
    const exitCol = grid.width - 1;
    grid.addEntryPoint({ row: exitRow, col: exitCol }, Direction.South);
  }
  
  /**
   * Utility method to create a complete maze from grid dimensions
   */
  static createMaze(
    width: number, 
    height: number, 
    options: MazeGenerationOptions = {}
  ): RectangularGrid {
    const grid = new RectangularGrid(width, height);
    const generator = new MazeGenerator(options.seed);
    generator.generateWithDFS(grid, options);
    
    // Add default entry/exit points unless explicitly disabled
    if (options.addDefaultEntryExit !== false) {
      generator.addDefaultEntryExit(grid);
    }
    
    return grid;
  }
}
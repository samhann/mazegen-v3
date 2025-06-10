import { RectangularGrid } from './rectangular-grid';
import { Coordinates, coordinatesToString, coordinatesEqual } from './coordinates';

export interface ValidationResult {
  isValid: boolean;
  isConnected: boolean;
  hasNoCycles: boolean;
  cellCount: number;
  passageCount: number;
  errors: string[];
}

export class MazeValidator {
  /**
   * Validates that a maze is a perfect maze (connected and acyclic)
   */
  static validate(grid: RectangularGrid): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      isConnected: false,
      hasNoCycles: false,
      cellCount: grid.getCellCount(),
      passageCount: 0,
      errors: []
    };

    try {
      // Count passages (connections between cells)
      result.passageCount = this.countPassages(grid);
      
      // Check connectivity
      result.isConnected = this.isConnected(grid);
      if (!result.isConnected) {
        result.errors.push('Maze is not fully connected - some cells are unreachable');
      }
      
      // Check for cycles (spanning tree property)
      result.hasNoCycles = this.hasNoCycles(grid);
      if (!result.hasNoCycles) {
        result.errors.push(`Maze has cycles - expected ${result.cellCount - 1} passages, found ${result.passageCount}`);
      }
      
      result.isValid = result.isConnected && result.hasNoCycles;
      
    } catch (error) {
      result.errors.push(`Validation error: ${error}`);
    }
    
    return result;
  }
  
  /**
   * Checks if all cells in the maze are reachable from any starting cell
   */
  static isConnected(grid: RectangularGrid): boolean {
    if (grid.getCellCount() === 0) return true;
    if (grid.getCellCount() === 1) return true;
    
    const allCells = grid.getAllCells();
    const startCell = allCells[0];
    const visited = new Set<string>();
    const queue: Coordinates[] = [startCell];
    
    visited.add(coordinatesToString(startCell));
    
    // BFS to find all reachable cells
    while (queue.length > 0) {
      const currentCell = queue.shift()!;
      const neighbors = grid.getNeighbors(currentCell);
      
      for (const neighbor of neighbors) {
        const neighborKey = coordinatesToString(neighbor);
        
        // If there's no wall between current cell and neighbor, and neighbor not visited
        if (!grid.hasWall(currentCell, neighbor) && !visited.has(neighborKey)) {
          visited.add(neighborKey);
          queue.push(neighbor);
        }
      }
    }
    
    // Check if all cells were reached
    return visited.size === grid.getCellCount();
  }
  
  /**
   * Checks if the maze has no cycles (spanning tree property)
   * For a spanning tree: number of edges = number of vertices - 1
   */
  static hasNoCycles(grid: RectangularGrid): boolean {
    const cellCount = grid.getCellCount();
    const passageCount = this.countPassages(grid);
    
    // For a spanning tree: edges = vertices - 1
    return passageCount === cellCount - 1;
  }
  
  /**
   * Counts the number of passages (open connections) between cells
   */
  static countPassages(grid: RectangularGrid): number {
    let passageCount = 0;
    const allCells = grid.getAllCells();
    const counted = new Set<string>();
    
    for (const cell of allCells) {
      const neighbors = grid.getNeighbors(cell);
      
      for (const neighbor of neighbors) {
        // Create a unique key for this cell pair to avoid double counting
        const cellKey = coordinatesToString(cell);
        const neighborKey = coordinatesToString(neighbor);
        const pairKey = cellKey < neighborKey ? `${cellKey}-${neighborKey}` : `${neighborKey}-${cellKey}`;
        
        if (!counted.has(pairKey) && !grid.hasWall(cell, neighbor)) {
          counted.add(pairKey);
          passageCount++;
        }
      }
    }
    
    return passageCount;
  }
  
  /**
   * Finds all cells reachable from a starting cell
   */
  static getReachableCells(grid: RectangularGrid, startCell: Coordinates): Set<string> {
    const visited = new Set<string>();
    const queue: Coordinates[] = [startCell];
    
    visited.add(coordinatesToString(startCell));
    
    while (queue.length > 0) {
      const currentCell = queue.shift()!;
      const neighbors = grid.getNeighbors(currentCell);
      
      for (const neighbor of neighbors) {
        const neighborKey = coordinatesToString(neighbor);
        
        if (!grid.hasWall(currentCell, neighbor) && !visited.has(neighborKey)) {
          visited.add(neighborKey);
          queue.push(neighbor);
        }
      }
    }
    
    return visited;
  }
  
  /**
   * Gets detailed connectivity information for debugging
   */
  static getConnectivityInfo(grid: RectangularGrid): {
    components: Set<string>[];
    largestComponentSize: number;
    isFullyConnected: boolean;
  } {
    const allCells = grid.getAllCells();
    const globalVisited = new Set<string>();
    const components: Set<string>[] = [];
    
    for (const cell of allCells) {
      const cellKey = coordinatesToString(cell);
      
      if (!globalVisited.has(cellKey)) {
        const componentCells = this.getReachableCells(grid, cell);
        components.push(componentCells);
        
        // Mark all cells in this component as visited
        componentCells.forEach(key => globalVisited.add(key));
      }
    }
    
    const largestComponentSize = Math.max(...components.map(comp => comp.size));
    const isFullyConnected = components.length === 1;
    
    return {
      components,
      largestComponentSize,
      isFullyConnected
    };
  }
}
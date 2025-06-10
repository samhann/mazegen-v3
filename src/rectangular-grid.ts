import { Coordinates, Direction, DIRECTION_DELTAS, coordinatesToString, addCoordinates } from './coordinates';

export class RectangularGrid {
  private walls: Map<string, Set<Direction>>;
  private entryPoints: Set<string>; // Coordinates where border walls are removed
  public readonly width: number;
  public readonly height: number;

  constructor(width: number, height: number) {
    if (width < 1 || height < 1) {
      throw new Error('Grid dimensions must be positive');
    }
    this.width = width;
    this.height = height;
    this.walls = new Map();
    this.entryPoints = new Set();
    this.initializeGrid();
  }

  private initializeGrid(): void {
    // Initialize all cells with all walls present
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const cellKey = coordinatesToString({ row, col });
        this.walls.set(cellKey, new Set(Object.values(Direction)));
      }
    }
  }

  isValidCoordinate(coords: Coordinates): boolean {
    return coords.row >= 0 && coords.row < this.height &&
           coords.col >= 0 && coords.col < this.width;
  }

  getNeighbors(coords: Coordinates): Coordinates[] {
    const neighbors: Coordinates[] = [];
    
    for (const direction of Object.values(Direction)) {
      const delta = DIRECTION_DELTAS[direction];
      const neighbor = addCoordinates(coords, delta);
      
      if (this.isValidCoordinate(neighbor)) {
        neighbors.push(neighbor);
      }
    }
    
    return neighbors;
  }

  hasWall(from: Coordinates, to: Coordinates): boolean {
    // Handle border walls (between cell and outside grid)
    if (!this.isValidCoordinate(from) || !this.isValidCoordinate(to)) {
      return this.hasBorderWall(from, to);
    }

    const direction = this.getDirection(from, to);
    if (!direction) {
      return true; // Not adjacent cells
    }

    const fromKey = coordinatesToString(from);
    const fromWalls = this.walls.get(fromKey);
    return fromWalls?.has(direction) ?? true;
  }

  removeWall(from: Coordinates, to: Coordinates): void {
    // Only allow removing internal walls (between two valid cells)
    if (!this.isValidCoordinate(from) || !this.isValidCoordinate(to)) {
      throw new Error('Cannot remove border walls directly. Use addEntryPoint() for entry/exit points.');
    }

    const direction = this.getDirection(from, to);
    const reverseDirection = this.getReverseDirection(direction);
    
    if (!direction || !reverseDirection) {
      return;
    }

    const fromKey = coordinatesToString(from);
    const toKey = coordinatesToString(to);
    
    this.walls.get(fromKey)?.delete(direction);
    this.walls.get(toKey)?.delete(reverseDirection);
  }

  private getDirection(from: Coordinates, to: Coordinates): Direction | null {
    const delta = { row: to.row - from.row, col: to.col - from.col };
    
    for (const [direction, directionDelta] of Object.entries(DIRECTION_DELTAS)) {
      if (delta.row === directionDelta.row && delta.col === directionDelta.col) {
        return direction as Direction;
      }
    }
    
    return null;
  }

  private getReverseDirection(direction: Direction | null): Direction | null {
    if (!direction) return null;
    
    const reverseMap: Record<Direction, Direction> = {
      [Direction.North]: Direction.South,
      [Direction.South]: Direction.North,
      [Direction.East]: Direction.West,
      [Direction.West]: Direction.East
    };
    
    return reverseMap[direction];
  }

  getAllCells(): Coordinates[] {
    const cells: Coordinates[] = [];
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        cells.push({ row, col });
      }
    }
    return cells;
  }

  getCellCount(): number {
    return this.width * this.height;
  }

  /**
   * Checks if there's a border wall between a cell and the outside of the grid
   */
  private hasBorderWall(from: Coordinates, to: Coordinates): boolean {
    const validFrom = this.isValidCoordinate(from);
    const validTo = this.isValidCoordinate(to);
    
    if (validFrom && validTo) {
      return false; // Both cells are inside, this is an internal wall
    }
    
    if (!validFrom && !validTo) {
      return true; // Both outside grid
    }
    
    // One cell is inside, one is outside - check for entry points
    const insideCell = validFrom ? from : to;
    const outsideCell = validFrom ? to : from;
    
    const direction = this.getDirection(insideCell, outsideCell);
    if (!direction) {
      return true;
    }
    
    // Check if this border location has been marked as an entry point
    const entryKey = this.getBorderEntryKey(insideCell, direction);
    return !this.entryPoints.has(entryKey);
  }
  
  /**
   * Creates an entry/exit point by removing a border wall
   */
  addEntryPoint(cell: Coordinates, direction: Direction): void {
    if (!this.isValidCoordinate(cell)) {
      throw new Error('Cell must be inside the grid');
    }
    
    if (!this.isBorderDirection(cell, direction)) {
      throw new Error('Direction must point toward grid border');
    }
    
    const entryKey = this.getBorderEntryKey(cell, direction);
    this.entryPoints.add(entryKey);
  }
  
  /**
   * Removes an entry/exit point, restoring the border wall
   */
  removeEntryPoint(cell: Coordinates, direction: Direction): void {
    const entryKey = this.getBorderEntryKey(cell, direction);
    this.entryPoints.delete(entryKey);
  }
  
  /**
   * Checks if a direction from a cell points toward the grid border
   */
  isBorderDirection(cell: Coordinates, direction: Direction): boolean {
    if (!this.isValidCoordinate(cell)) {
      return false;
    }
    
    const delta = DIRECTION_DELTAS[direction];
    const targetCell = addCoordinates(cell, delta);
    return !this.isValidCoordinate(targetCell);
  }
  
  /**
   * Gets all cells that are on the border of the grid
   */
  getBorderCells(): Coordinates[] {
    const borderCells: Coordinates[] = [];
    
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const cell = { row, col };
        if (this.isBorderCell(cell)) {
          borderCells.push(cell);
        }
      }
    }
    
    return borderCells;
  }
  
  /**
   * Checks if a cell is on the border of the grid
   */
  isBorderCell(cell: Coordinates): boolean {
    return cell.row === 0 || cell.row === this.height - 1 ||
           cell.col === 0 || cell.col === this.width - 1;
  }
  
  /**
   * Gets the directions that point toward the border from a given cell
   */
  getBorderDirections(cell: Coordinates): Direction[] {
    const directions: Direction[] = [];
    
    for (const direction of Object.values(Direction)) {
      if (this.isBorderDirection(cell, direction)) {
        directions.push(direction);
      }
    }
    
    return directions;
  }
  
  private getBorderEntryKey(cell: Coordinates, direction: Direction): string {
    return `${coordinatesToString(cell)}:${direction}`;
  }
  
  /**
   * Gets all current entry points
   */
  getEntryPoints(): Array<{cell: Coordinates, direction: Direction}> {
    return Array.from(this.entryPoints).map(entryKey => {
      const [cellStr, direction] = entryKey.split(':');
      const [row, col] = cellStr.split(',').map(Number);
      return {
        cell: { row, col },
        direction: direction as Direction
      };
    });
  }
  
  // For debugging
  getWallsForCell(coords: Coordinates): Set<Direction> | undefined {
    const key = coordinatesToString(coords);
    return this.walls.get(key);
  }
}
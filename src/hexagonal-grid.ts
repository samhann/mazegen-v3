import { CellId, Grid, Passage, makePassage, Maze, RenderableMaze, RenderableEdge, RenderableCell, RenderablePath } from './maze-core';

export class HexagonalGrid implements Grid {
  constructor(private radius: number) {
    if (radius < 1) {
      throw new Error('Hexagonal grid radius must be at least 1');
    }
  }

  cells(): CellId[] {
    const cells: CellId[] = [];
    
    // Generate all cells within hex radius using axial coordinates
    // This formula might be wrong - need to test it
    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius);
      const r2 = Math.min(this.radius, -q + this.radius);
      for (let r = r1; r <= r2; r++) {
        cells.push(`${q},${r}`);
      }
    }
    
    return cells;
  }

  neighbors(cell: CellId): CellId[] {
    const [q, r] = this.parseAxialCoords(cell);
    
    // Standard axial coordinate neighbor offsets
    // But these could be wrong - need to verify
    const neighborOffsets = [
      [1, 0],   // East
      [-1, 0],  // West  
      [0, 1],   // Southeast
      [0, -1],  // Northwest
      [1, -1],  // Northeast
      [-1, 1]   // Southwest
    ];
    
    const neighbors: CellId[] = [];
    for (const [dq, dr] of neighborOffsets) {
      const neighborCell = `${q + dq},${r + dr}`;
      if (this.isValidCell(neighborCell)) {
        neighbors.push(neighborCell);
      }
    }
    
    return neighbors;
  }

  entranceCell(): CellId {
    // Place entrance on left edge - but is this actually on the boundary?
    return `${-this.radius},0`;
  }

  exitCell(): CellId {
    // Place exit on right edge - but is this actually on the boundary?
    return `${this.radius},0`;
  }

  boundaryWalls(cell: CellId): Passage[] {
    if (!this.isBoundaryCell(cell)) {
      return [];
    }
    
    // Create wall edge between boundary cell and virtual "outside" cell
    // This represents the solid perimeter wall that contains the maze
    const [q, r] = this.parseAxialCoords(cell);
    const outsideCell = `outside-${q},${r}`;
    
    return [makePassage(cell, outsideCell)];
  }

  position(cell: CellId): [number, number] {
    const [q, r] = this.parseAxialCoords(cell);
    
    // Standard axial to cartesian conversion - but might have bugs
    const x = q + r / 2;
    const y = r * Math.sqrt(3) / 2;
    
    return [x, y];
  }

  private parseAxialCoords(cell: CellId): [number, number] {
    const parts = cell.split(',');
    if (parts.length !== 2) {
      throw new Error(`Invalid cell ID format: ${cell}`);
    }
    
    const q = parseInt(parts[0], 10);
    const r = parseInt(parts[1], 10);
    
    if (isNaN(q) || isNaN(r)) {
      throw new Error(`Invalid numeric coordinates in cell: ${cell}`);
    }
    
    return [q, r];
  }

  private isValidCell(cell: CellId): boolean {
    try {
      const [q, r] = this.parseAxialCoords(cell);
      // Check if within hex radius using axial distance formula
      // This formula could be wrong
      const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
      return distance <= this.radius;
    } catch {
      return false;
    }
  }

  private isBoundaryCell(cell: CellId): boolean {
    try {
      const [q, r] = this.parseAxialCoords(cell);
      const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
      return distance === this.radius;
    } catch {
      return false;
    }
  }

  toRenderable(maze: Maze, solution?: CellId[]): RenderableMaze {
    const solutionSet = new Set(solution || []);
    
    // Build passage lookup for quick checks
    const passageSet = new Set<string>();
    for (const [cellA, cellB] of maze.passages) {
      if (maze.cells.has(cellA) && maze.cells.has(cellB)) {
        passageSet.add(`${cellA}|${cellB}`);
        passageSet.add(`${cellB}|${cellA}`);
      }
    }
    
    // Collect all edges to render (walls where no passage exists)
    const edges: RenderableEdge[] = [];
    const edgeSet = new Set<string>(); // Prevent duplicates
    
    // Define all possible directions for hexagonal grid (axial coordinates)
    const directions = [
      { dq: 1, dr: 0 },   // East
      { dq: -1, dr: 0 },  // West  
      { dq: 0, dr: 1 },   // Southeast
      { dq: 0, dr: -1 },  // Northwest
      { dq: 1, dr: -1 },  // Northeast
      { dq: -1, dr: 1 }   // Southwest
    ];
    
    for (const cell of maze.cells) {
      const [q, r] = this.parseAxialCoords(cell);
      const [x, y] = this.position(cell);
      
      for (const { dq, dr } of directions) {
        const neighborQ = q + dq;
        const neighborR = r + dr;
        const neighborId = `${neighborQ},${neighborR}`;
        
        // Check if neighbor exists in grid bounds
        const neighborExists = this.isValidCell(neighborId);
        
        let shouldRenderWall = false;
        
        if (!neighborExists) {
          // No neighbor exists - this is a boundary wall
          shouldRenderWall = true;
        } else if (maze.cells.has(neighborId)) {
          // Neighbor exists - check if there's a passage
          if (!passageSet.has(`${cell}|${neighborId}`)) {
            shouldRenderWall = true;
          }
        }
        
        if (shouldRenderWall) {
          // For hexagonal grids, calculate wall position between hexagon centers
          const [neighborX, neighborY] = neighborExists 
            ? this.axialToCartesian(neighborQ, neighborR)
            : [x + dq + dr/2, y + dr * Math.sqrt(3)/2]; // Extrapolated position
          
          // Calculate wall position - midpoint between cells, perpendicular line
          const midX = (x + neighborX) / 2;
          const midY = (y + neighborY) / 2;
          
          // Vector from cell to neighbor (or extrapolated direction)
          const dx = neighborX - x;
          const dy = neighborY - y;
          const length = Math.sqrt(dx * dx + dy * dy);
          
          if (length > 0) {
            // Perpendicular vector (rotated 90 degrees)
            const perpX = -dy / length;
            const perpY = dx / length;
            
            // Wall length - longer for hexagonal grids to close gaps
            const wallLength = length * 0.8; // Use 80% of distance between centers
            
            const wallX1 = midX + perpX * wallLength / 2;
            const wallY1 = midY + perpY * wallLength / 2;
            const wallX2 = midX - perpX * wallLength / 2;
            const wallY2 = midY - perpY * wallLength / 2;
            
            // Create canonical edge key to prevent duplicates
            const edgeKey = [
              Math.min(wallX1, wallX2),
              Math.min(wallY1, wallY2),
              Math.max(wallX1, wallX2),
              Math.max(wallY1, wallY2)
            ].join(',');
            
            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
              edges.push({ x1: wallX1, y1: wallY1, x2: wallX2, y2: wallY2 });
            }
          }
        }
      }
    }
    
    // Create cells
    const cells: RenderableCell[] = [];
    for (const cell of maze.cells) {
      const [x, y] = this.position(cell);
      let type: RenderableCell['type'] = 'normal';
      
      if (cell === maze.entrance) type = 'entrance';
      else if (cell === maze.exit) type = 'exit';
      else if (solutionSet.has(cell)) type = 'solution';
      
      cells.push({ x, y, type });
    }
    
    // Create solution path
    let solutionPath: RenderablePath | undefined;
    if (solution && solution.length > 1) {
      const points = solution.map(cell => {
        const [x, y] = this.position(cell);
        return { x, y };
      });
      solutionPath = { points };
    }
    
    return { edges, cells, solutionPath };
  }

  private axialToCartesian(q: number, r: number): [number, number] {
    const x = q + r / 2;
    const y = r * Math.sqrt(3) / 2;
    return [x, y];
  }
}
import { CellId, Grid, Passage, makePassage, Maze, RenderableMaze, RenderableEdge, RenderableCell, RenderablePath } from './maze-core';

export class RectangularGrid implements Grid {
  constructor(private width: number, private height: number) {
    if (width < 2 || height < 2) {
      throw new Error('Grid must be at least 2x2');
    }
  }

  cells(): CellId[] {
    const result: CellId[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        result.push(`${x},${y}`);
      }
    }
    return result;
  }

  neighbors(cell: CellId): CellId[] {
    const [x, y] = cell.split(',').map(Number);
    const result: CellId[] = [];
    
    // Only include neighbors that exist in the grid
    if (x > 0) result.push(`${x-1},${y}`);
    if (x < this.width - 1) result.push(`${x+1},${y}`);
    if (y > 0) result.push(`${x},${y-1}`);
    if (y < this.height - 1) result.push(`${x},${y+1}`);
    
    return result;
  }

  entranceCell(): CellId {
    // Top-left corner
    return '0,0';
  }

  exitCell(): CellId {
    // Bottom-right corner
    return `${this.width-1},${this.height-1}`;
  }

  boundaryWalls(cell: CellId): Passage[] {
    const [x, y] = cell.split(',').map(Number);
    const result: Passage[] = [];
    
    // Create wall edges between boundary cells and virtual "outside" cells
    // These represent the solid perimeter walls that contain the maze
    if (x === 0) result.push(makePassage(`-1,${y}`, cell));
    if (x === this.width - 1) result.push(makePassage(cell, `${this.width},${y}`));
    if (y === 0) result.push(makePassage(`${x},-1`, cell));
    if (y === this.height - 1) result.push(makePassage(cell, `${x},${this.height}`));
    
    return result;
  }

  position(cell: CellId): [number, number] {
    const [x, y] = cell.split(',').map(Number);
    return [x, y];
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
    
    // Define all possible directions for rectangular grid
    const directions = [
      { dx: 1, dy: 0 },   // East
      { dx: 0, dy: 1 },   // South
      { dx: -1, dy: 0 },  // West  
      { dx: 0, dy: -1 }   // North
    ];
    
    for (const cell of maze.cells) {
      const [x, y] = this.position(cell);
      
      for (const { dx, dy } of directions) {
        const neighborX = x + dx;
        const neighborY = y + dy;
        const neighborId = `${neighborX},${neighborY}`;
        
        // Check if neighbor exists in grid bounds
        const neighborExists = neighborX >= 0 && neighborX < this.width && 
                             neighborY >= 0 && neighborY < this.height;
        
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
          // Calculate wall position - midpoint between cells, perpendicular line
          const midX = x + dx * 0.5;
          const midY = y + dy * 0.5;
          
          // Create wall perpendicular to direction
          let wallX1, wallY1, wallX2, wallY2;
          if (dx !== 0) {
            // Vertical wall (between east/west cells)
            wallX1 = wallX2 = midX;
            wallY1 = midY - 0.4;
            wallY2 = midY + 0.4;
          } else {
            // Horizontal wall (between north/south cells)
            wallX1 = midX - 0.4;
            wallY1 = wallY2 = midY;
            wallX2 = midX + 0.4;
          }
          
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
}
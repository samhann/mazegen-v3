import { RectangularGrid } from './rectangular-grid';
import { MazeSolver, SolutionPath } from './maze-solver';
import { Coordinates, Direction, coordinatesEqual } from './coordinates';

export interface SVGRenderOptions {
  cellSize?: number;
  wallThickness?: number;
  wallColor?: string;
  backgroundColor?: string;
  solutionColor?: string;
  entryExitColor?: string;
  showSolution?: boolean;
  padding?: number;
}

const DEFAULT_OPTIONS: Required<SVGRenderOptions> = {
  cellSize: 20,
  wallThickness: 2,
  wallColor: '#000000',
  backgroundColor: '#ffffff',
  solutionColor: '#ff0000',
  entryExitColor: '#00ff00',
  showSolution: true,
  padding: 10
};

export class SVGRenderer {
  /**
   * Renders a maze as SVG with optional solution path
   */
  static renderMaze(grid: RectangularGrid, options: SVGRenderOptions = {}): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    const width = grid.width * opts.cellSize + 2 * opts.padding;
    const height = grid.height * opts.cellSize + 2 * opts.padding;
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
    
    // Background
    svg += `  <rect x="0" y="0" width="${width}" height="${height}" fill="${opts.backgroundColor}"/>\n`;
    
    // Draw walls
    svg += this.renderWalls(grid, opts);
    
    // Draw entry/exit points
    svg += this.renderEntryExitPoints(grid, opts);
    
    // Draw solution path if requested
    if (opts.showSolution) {
      svg += this.renderSolutionPath(grid, opts);
    }
    
    svg += '</svg>';
    return svg;
  }
  
  /**
   * Renders maze walls as SVG lines
   */
  private static renderWalls(grid: RectangularGrid, opts: Required<SVGRenderOptions>): string {
    let walls = '';
    
    const allCells = grid.getAllCells();
    
    // Render internal walls between cells
    for (const cell of allCells) {
      const x = cell.col * opts.cellSize + opts.padding;
      const y = cell.row * opts.cellSize + opts.padding;
      
      const neighbors = grid.getNeighbors(cell);
      
      // Check each direction for walls
      if (grid.hasWall(cell, { row: cell.row, col: cell.col + 1 })) {
        // Right wall
        const x1 = x + opts.cellSize;
        const y1 = y;
        const x2 = x + opts.cellSize;
        const y2 = y + opts.cellSize;
        walls += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${opts.wallColor}" stroke-width="${opts.wallThickness}"/>\n`;
      }
      
      if (grid.hasWall(cell, { row: cell.row + 1, col: cell.col })) {
        // Bottom wall
        const x1 = x;
        const y1 = y + opts.cellSize;
        const x2 = x + opts.cellSize;
        const y2 = y + opts.cellSize;
        walls += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${opts.wallColor}" stroke-width="${opts.wallThickness}"/>\n`;
      }
    }
    
    // Render border walls
    walls += this.renderBorderWalls(grid, opts);
    
    return walls;
  }
  
  /**
   * Renders the border walls around the maze
   */
  private static renderBorderWalls(grid: RectangularGrid, opts: Required<SVGRenderOptions>): string {
    let walls = '';
    const entryPoints = grid.getEntryPoints();
    
    // Top border
    for (let col = 0; col < grid.width; col++) {
      const hasEntryHere = entryPoints.some(ep => 
        ep.cell.row === 0 && ep.cell.col === col && ep.direction === Direction.North
      );
      
      if (!hasEntryHere) {
        const x1 = col * opts.cellSize + opts.padding;
        const y1 = opts.padding;
        const x2 = (col + 1) * opts.cellSize + opts.padding;
        const y2 = opts.padding;
        walls += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${opts.wallColor}" stroke-width="${opts.wallThickness}"/>\n`;
      }
    }
    
    // Bottom border
    for (let col = 0; col < grid.width; col++) {
      const hasEntryHere = entryPoints.some(ep => 
        ep.cell.row === grid.height - 1 && ep.cell.col === col && ep.direction === Direction.South
      );
      
      if (!hasEntryHere) {
        const x1 = col * opts.cellSize + opts.padding;
        const y1 = grid.height * opts.cellSize + opts.padding;
        const x2 = (col + 1) * opts.cellSize + opts.padding;
        const y2 = grid.height * opts.cellSize + opts.padding;
        walls += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${opts.wallColor}" stroke-width="${opts.wallThickness}"/>\n`;
      }
    }
    
    // Left border
    for (let row = 0; row < grid.height; row++) {
      const hasEntryHere = entryPoints.some(ep => 
        ep.cell.row === row && ep.cell.col === 0 && ep.direction === Direction.West
      );
      
      if (!hasEntryHere) {
        const x1 = opts.padding;
        const y1 = row * opts.cellSize + opts.padding;
        const x2 = opts.padding;
        const y2 = (row + 1) * opts.cellSize + opts.padding;
        walls += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${opts.wallColor}" stroke-width="${opts.wallThickness}"/>\n`;
      }
    }
    
    // Right border
    for (let row = 0; row < grid.height; row++) {
      const hasEntryHere = entryPoints.some(ep => 
        ep.cell.row === row && ep.cell.col === grid.width - 1 && ep.direction === Direction.East
      );
      
      if (!hasEntryHere) {
        const x1 = grid.width * opts.cellSize + opts.padding;
        const y1 = row * opts.cellSize + opts.padding;
        const x2 = grid.width * opts.cellSize + opts.padding;
        const y2 = (row + 1) * opts.cellSize + opts.padding;
        walls += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${opts.wallColor}" stroke-width="${opts.wallThickness}"/>\n`;
      }
    }
    
    return walls;
  }
  
  /**
   * Renders entry and exit points
   */
  private static renderEntryExitPoints(grid: RectangularGrid, opts: Required<SVGRenderOptions>): string {
    let elements = '';
    const entryPoints = grid.getEntryPoints();
    
    for (let i = 0; i < entryPoints.length; i++) {
      const ep = entryPoints[i];
      const x = ep.cell.col * opts.cellSize + opts.padding + opts.cellSize / 2;
      const y = ep.cell.row * opts.cellSize + opts.padding + opts.cellSize / 2;
      const radius = opts.cellSize / 4;
      
      // First entry point is green (start), last is red (end)
      const color = i === 0 ? '#00ff00' : (i === entryPoints.length - 1 ? '#ff0000' : opts.entryExitColor);
      
      elements += `  <circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" stroke="#000" stroke-width="1"/>\n`;
    }
    
    return elements;
  }
  
  /**
   * Renders the solution path through the maze
   */
  private static renderSolutionPath(grid: RectangularGrid, opts: Required<SVGRenderOptions>): string {
    const solution = MazeSolver.findSolutionPath(grid);
    
    if (!solution.found || solution.path.length < 2) {
      return '';
    }
    
    let path = '';
    const strokeWidth = Math.max(2, opts.cellSize / 8);
    
    // Draw path as connected line segments
    for (let i = 0; i < solution.path.length - 1; i++) {
      const current = solution.path[i];
      const next = solution.path[i + 1];
      
      const x1 = current.col * opts.cellSize + opts.padding + opts.cellSize / 2;
      const y1 = current.row * opts.cellSize + opts.padding + opts.cellSize / 2;
      const x2 = next.col * opts.cellSize + opts.padding + opts.cellSize / 2;
      const y2 = next.row * opts.cellSize + opts.padding + opts.cellSize / 2;
      
      path += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${opts.solutionColor}" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="0.7"/>\n`;
    }
    
    return path;
  }
  
  /**
   * Saves SVG to a file (for Node.js environments)
   */
  static saveToFile(svg: string, filename: string): void {
    // This would require fs module in Node.js environment
    // For now, just return the SVG string
    console.log(`SVG content (save to ${filename}):`);
    console.log(svg);
  }
  
  /**
   * Creates a complete HTML page with the maze SVG
   */
  static createHTMLPage(grid: RectangularGrid, options: SVGRenderOptions = {}): string {
    const svg = this.renderMaze(grid, options);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Maze</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f0f0f0;
        }
        .maze-container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: inline-block;
        }
        .maze-info {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <h1>Generated Maze</h1>
    <div class="maze-container">
        ${svg}
        <div class="maze-info">
            <p>Dimensions: ${grid.width} × ${grid.height} (${grid.getCellCount()} cells)</p>
            <p>🟢 Start &nbsp;&nbsp; 🔴 End &nbsp;&nbsp; <span style="color: red;">— Solution Path</span></p>
        </div>
    </div>
</body>
</html>`;
  }
}
import { Grid, Maze, CellId } from './maze-core';

export interface SVGOptions {
  cellSize?: number;
  wallWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
  solutionColor?: string;
  entranceColor?: string;
  exitColor?: string;
}

export class SVGRenderer {
  private options: Required<SVGOptions>;

  constructor(options: SVGOptions = {}) {
    this.options = {
      cellSize: 30,
      wallWidth: 2,
      strokeColor: '#000000',
      backgroundColor: '#ffffff',
      solutionColor: '#ff0000',
      entranceColor: '#00ff00',
      exitColor: '#ff0000',
      ...options
    };
  }

  render(maze: Maze, grid: Grid, solution?: CellId[]): string {
    const solutionSet = new Set(solution || []);
    
    // Find bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const cell of maze.cells) {
      const [x, y] = grid.position(cell);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    
    const gridWidth = maxX - minX + 1;
    const gridHeight = maxY - minY + 1;
    
    const { cellSize, wallWidth } = this.options;
    const svgWidth = gridWidth * cellSize + wallWidth;
    const svgHeight = gridHeight * cellSize + wallWidth;
    
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">\n`;
    svg += `  <rect width="100%" height="100%" fill="${this.options.backgroundColor}"/>\n`;
    
    // Draw solution path first (so it's behind walls)
    if (solution && solution.length > 1) {
      svg += this.renderSolutionPath(solution, grid, minX, minY);
    }
    
    // Draw cell backgrounds
    for (const cell of maze.cells) {
      const [x, y] = grid.position(cell);
      const cellX = (x - minX) * cellSize + wallWidth / 2;
      const cellY = (y - minY) * cellSize + wallWidth / 2;
      
      let fillColor = this.options.backgroundColor;
      
      if (cell === maze.entrance) {
        fillColor = this.options.entranceColor;
      } else if (cell === maze.exit) {
        fillColor = this.options.exitColor;
      } else if (solutionSet.has(cell)) {
        fillColor = this.options.solutionColor;
      }
      
      if (fillColor !== this.options.backgroundColor) {
        svg += `  <rect x="${cellX}" y="${cellY}" width="${cellSize - wallWidth}" height="${cellSize - wallWidth}" fill="${fillColor}" opacity="0.3"/>\n`;
      }
    }
    
    // Draw walls
    svg += this.renderWalls(maze, grid, minX, minY);
    
    svg += '</svg>';
    return svg;
  }
  
  private renderSolutionPath(solution: CellId[], grid: Grid, minX: number, minY: number): string {
    if (solution.length < 2) return '';
    
    const { cellSize, wallWidth } = this.options;
    let path = '  <path d="';
    
    for (let i = 0; i < solution.length; i++) {
      const [x, y] = grid.position(solution[i]);
      const centerX = (x - minX) * cellSize + cellSize / 2;
      const centerY = (y - minY) * cellSize + cellSize / 2;
      
      if (i === 0) {
        path += `M ${centerX} ${centerY}`;
      } else {
        path += ` L ${centerX} ${centerY}`;
      }
    }
    
    path += `" stroke="${this.options.solutionColor}" stroke-width="${wallWidth * 2}" fill="none" opacity="0.6"/>\n`;
    return path;
  }
  
  private renderWalls(maze: Maze, grid: Grid, minX: number, minY: number): string {
    const { cellSize, wallWidth, strokeColor } = this.options;
    let walls = '';
    
    // Track which walls to draw (where passages DON'T exist)
    const passageSet = new Set<string>();
    for (const [cellA, cellB] of maze.passages) {
      if (maze.cells.has(cellA) && maze.cells.has(cellB)) {
        passageSet.add(`${cellA}|${cellB}`);
        passageSet.add(`${cellB}|${cellA}`);
      }
    }
    
    // Draw walls between adjacent cells where no passage exists
    for (const cell of maze.cells) {
      const [x, y] = grid.position(cell);
      const cellX = (x - minX) * cellSize;
      const cellY = (y - minY) * cellSize;
      
      // Check each direction for walls
      const neighbors = grid.neighbors(cell);
      
      // Right wall
      const rightNeighbor = `${x + 1},${y}`;
      if (!neighbors.includes(rightNeighbor) || !passageSet.has(`${cell}|${rightNeighbor}`)) {
        walls += `  <line x1="${cellX + cellSize}" y1="${cellY}" x2="${cellX + cellSize}" y2="${cellY + cellSize}" stroke="${strokeColor}" stroke-width="${wallWidth}"/>\n`;
      }
      
      // Bottom wall
      const bottomNeighbor = `${x},${y + 1}`;
      if (!neighbors.includes(bottomNeighbor) || !passageSet.has(`${cell}|${bottomNeighbor}`)) {
        walls += `  <line x1="${cellX}" y1="${cellY + cellSize}" x2="${cellX + cellSize}" y2="${cellY + cellSize}" stroke="${strokeColor}" stroke-width="${wallWidth}"/>\n`;
      }
      
      // Left wall (for leftmost cells)
      if (x === minX) {
        walls += `  <line x1="${cellX}" y1="${cellY}" x2="${cellX}" y2="${cellY + cellSize}" stroke="${strokeColor}" stroke-width="${wallWidth}"/>\n`;
      }
      
      // Top wall (for topmost cells)
      if (y === minY) {
        walls += `  <line x1="${cellX}" y1="${cellY}" x2="${cellX + cellSize}" y2="${cellY}" stroke="${strokeColor}" stroke-width="${wallWidth}"/>\n`;
      }
    }
    
    return walls;
  }
}
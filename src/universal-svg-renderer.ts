import { Grid, Maze, CellId } from './maze-core';

export class UniversalSVGRenderer {
  constructor(
    private cellSize: number = 30,
    private wallWidth: number = 2
  ) {}

  render(maze: Maze, grid: Grid, solution?: CellId[]): string {
    const solutionSet = new Set(solution || []);
    
    // Get all cell positions
    const positions = new Map<CellId, [number, number]>();
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const cell of maze.cells) {
      const [x, y] = grid.position(cell);
      positions.set(cell, [x, y]);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    
    // Calculate SVG dimensions
    const margin = this.cellSize;
    const svgWidth = (maxX - minX) * this.cellSize + 2 * margin;
    const svgHeight = (maxY - minY) * this.cellSize + 2 * margin;
    
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">\n`;
    svg += `  <rect width="100%" height="100%" fill="#ffffff"/>\n`;
    
    // Build passage set for quick lookup
    const passageSet = new Set<string>();
    for (const [cellA, cellB] of maze.passages) {
      if (maze.cells.has(cellA) && maze.cells.has(cellB)) {
        passageSet.add(`${cellA}|${cellB}`);
        passageSet.add(`${cellB}|${cellA}`);
      }
    }
    
    // Draw solution path
    if (solution && solution.length > 1) {
      svg += '  <path d="';
      for (let i = 0; i < solution.length; i++) {
        const [x, y] = positions.get(solution[i])!;
        const svgX = (x - minX) * this.cellSize + margin;
        const svgY = (y - minY) * this.cellSize + margin;
        
        svg += i === 0 ? `M ${svgX} ${svgY}` : ` L ${svgX} ${svgY}`;
      }
      svg += `" stroke="#ff0000" stroke-width="${this.wallWidth * 2}" fill="none" opacity="0.7"/>\n`;
    }
    
    // Draw walls between cells that don't have passages
    // This is topology-agnostic - just checks grid.neighbors()
    for (const cell of maze.cells) {
      const neighbors = grid.neighbors(cell);
      const [x1, y1] = positions.get(cell)!;
      
      for (const neighbor of neighbors) {
        if (maze.cells.has(neighbor) && cell < neighbor) {
          // Only draw each wall once
          if (!passageSet.has(`${cell}|${neighbor}`)) {
            const [x2, y2] = positions.get(neighbor)!;
            
            // Convert to SVG coordinates
            const svgX1 = (x1 - minX) * this.cellSize + margin;
            const svgY1 = (y1 - minY) * this.cellSize + margin;
            const svgX2 = (x2 - minX) * this.cellSize + margin;
            const svgY2 = (y2 - minY) * this.cellSize + margin;
            
            // Calculate wall position (midpoint between cells, perpendicular line)
            const midX = (svgX1 + svgX2) / 2;
            const midY = (svgY1 + svgY2) / 2;
            
            // Vector from cell1 to cell2
            const dx = svgX2 - svgX1;
            const dy = svgY2 - svgY1;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // Perpendicular vector (rotated 90 degrees)
            const perpX = -dy / length;
            const perpY = dx / length;
            
            // Wall endpoints (short line perpendicular to connection)
            const wallLength = this.cellSize * 0.4;
            const wallX1 = midX + perpX * wallLength / 2;
            const wallY1 = midY + perpY * wallLength / 2;
            const wallX2 = midX - perpX * wallLength / 2;
            const wallY2 = midY - perpY * wallLength / 2;
            
            svg += `  <line x1="${wallX1}" y1="${wallY1}" x2="${wallX2}" y2="${wallY2}" stroke="#000000" stroke-width="${this.wallWidth}"/>\n`;
          }
        }
      }
    }
    
    // Draw cells
    for (const cell of maze.cells) {
      const [x, y] = positions.get(cell)!;
      const svgX = (x - minX) * this.cellSize + margin;
      const svgY = (y - minY) * this.cellSize + margin;
      
      let fillColor = '#f8f8f8';
      if (cell === maze.entrance) fillColor = '#00ff00';
      else if (cell === maze.exit) fillColor = '#ff0000';
      else if (solutionSet.has(cell)) fillColor = '#ffff00';
      
      const radius = this.cellSize * 0.15;
      svg += `  <circle cx="${svgX}" cy="${svgY}" r="${radius}" fill="${fillColor}" stroke="#333" stroke-width="1"/>\n`;
    }
    
    svg += '</svg>';
    return svg;
  }
}
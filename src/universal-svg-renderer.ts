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
    
    // Draw boundary walls from maze data
    for (const [cellA, cellB] of maze.boundaryWalls) {
      // One cell is real (in maze), one is virtual (outside)
      const realCell = maze.cells.has(cellA) ? cellA : cellB;
      const virtualCell = cellA === realCell ? cellB : cellA;
      
      // Only render if we have position data for the real cell
      if (positions.has(realCell)) {
        svg += this.renderBoundaryWall(realCell, virtualCell, grid, positions, minX, minY);
      }
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
            // For hexagonal grids, walls need to span the proper distance for regular hexagons
            // Mathematical analysis shows √3 ≈ 1.732, but 2.0 works better to eliminate gaps
            // For rectangular grids, shorter walls look better
            const wallLengthMultiplier = this.isHexagonalGrid(grid) ? 2.0 : 0.4;
            const wallLength = length * wallLengthMultiplier;
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

  private renderBoundaryWall(
    realCell: CellId, 
    virtualCell: CellId, 
    grid: Grid, 
    positions: Map<CellId, [number, number]>, 
    minX: number, 
    minY: number
  ): string {
    const [cellX, cellY] = positions.get(realCell)!;
    const margin = this.cellSize;
    const svgX = (cellX - minX) * this.cellSize + margin;
    const svgY = (cellY - minY) * this.cellSize + margin;
    
    // For boundary walls, draw a wall segment extending outward from the cell
    // Use same wall length as internal walls for consistency
    const wallLength = this.cellSize * (this.isHexagonalGrid(grid) ? 2.0 : 0.4);
    
    // Calculate direction to the virtual cell (outward from the maze)
    if (virtualCell.startsWith('outside-')) {
      try {
        // Extract coordinates from virtual cell name like "outside--2,0"
        const coordsPart = virtualCell.replace('outside-', '');
        const [vq, vr] = coordsPart.split(',').map(Number);
        const [rq, rr] = realCell.split(',').map(Number);
        
        // Direction vector from real cell toward virtual cell
        const dirQ = vq - rq;
        const dirR = vr - rr;
        
        // Convert to screen coordinates (simplified)
        const dirX = dirQ + dirR / 2;
        const dirY = dirR * Math.sqrt(3) / 2;
        const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
        
        if (dirLength > 0) {
          // Normalize direction
          const normalizedDirX = dirX / dirLength;
          const normalizedDirY = dirY / dirLength;
          
          // Create wall perpendicular to the outward direction
          const perpX = -normalizedDirY;
          const perpY = normalizedDirX;
          
          // Position wall at the edge of the cell, extending perpendicular
          const edgeX = svgX + normalizedDirX * this.cellSize * 0.3;
          const edgeY = svgY + normalizedDirY * this.cellSize * 0.3;
          
          const wallX1 = edgeX + perpX * wallLength / 2;
          const wallY1 = edgeY + perpY * wallLength / 2;
          const wallX2 = edgeX - perpX * wallLength / 2;
          const wallY2 = edgeY - perpY * wallLength / 2;
          
          return `  <line x1="${wallX1}" y1="${wallY1}" x2="${wallX2}" y2="${wallY2}" stroke="#000000" stroke-width="${this.wallWidth}"/>\n`;
        }
      } catch (error) {
        // Fallback: draw a boundary marker
        return `  <circle cx="${svgX}" cy="${svgY}" r="3" fill="#ff0000" opacity="0.5"/>\n`;
      }
    }
    return '';
  }

  private isHexagonalGrid(grid: Grid): boolean {
    // Check if this is a hexagonal grid by examining cell ID format
    // Hexagonal grids use axial coordinates with negative values
    const cells = Array.from(grid.cells());
    if (cells.length === 0) return false;
    
    // Sample a few cells to see if any have the hexagonal pattern
    const sampleCells = cells.slice(0, Math.min(5, cells.length));
    for (const cell of sampleCells) {
      const neighbors = grid.neighbors(cell);
      // Hexagonal cells can have up to 6 neighbors
      if (neighbors.length > 4) {
        return true;
      }
    }
    return false;
  }
}
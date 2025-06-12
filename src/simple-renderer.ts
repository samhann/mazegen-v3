import { RenderableMaze } from './maze-core';

export class SimpleRenderer {
  constructor(
    private cellSize: number = 30,
    private wallWidth: number = 2
  ) {}

  render(renderableMaze: RenderableMaze): string {
    // Calculate bounds from cells
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const cell of renderableMaze.cells) {
      minX = Math.min(minX, cell.x);
      maxX = Math.max(maxX, cell.x);
      minY = Math.min(minY, cell.y);
      maxY = Math.max(maxY, cell.y);
    }
    
    // Calculate SVG dimensions with margin
    const margin = this.cellSize;
    const svgWidth = (maxX - minX) * this.cellSize + 2 * margin;
    const svgHeight = (maxY - minY) * this.cellSize + 2 * margin;
    
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">\n`;
    svg += `  <rect width="100%" height="100%" fill="#ffffff"/>\n`;
    
    // Draw solution path first (underneath everything else)
    if (renderableMaze.solutionPath && renderableMaze.solutionPath.points.length > 1) {
      svg += '  <path d="';
      for (let i = 0; i < renderableMaze.solutionPath.points.length; i++) {
        const point = renderableMaze.solutionPath.points[i];
        const svgX = (point.x - minX) * this.cellSize + margin;
        const svgY = (point.y - minY) * this.cellSize + margin;
        
        svg += i === 0 ? `M ${svgX} ${svgY}` : ` L ${svgX} ${svgY}`;
      }
      svg += `" stroke="#ff0000" stroke-width="${this.wallWidth * 2}" fill="none" opacity="0.7"/>\n`;
    }
    
    // Draw walls
    for (const edge of renderableMaze.edges) {
      const svgX1 = (edge.x1 - minX) * this.cellSize + margin;
      const svgY1 = (edge.y1 - minY) * this.cellSize + margin;
      const svgX2 = (edge.x2 - minX) * this.cellSize + margin;
      const svgY2 = (edge.y2 - minY) * this.cellSize + margin;
      
      svg += `  <line x1="${svgX1}" y1="${svgY1}" x2="${svgX2}" y2="${svgY2}" stroke="#000000" stroke-width="${this.wallWidth}"/>\n`;
    }
    
    // Draw cells
    for (const cell of renderableMaze.cells) {
      const svgX = (cell.x - minX) * this.cellSize + margin;
      const svgY = (cell.y - minY) * this.cellSize + margin;
      
      let fillColor = '#f8f8f8';
      if (cell.type === 'entrance') fillColor = '#00ff00';
      else if (cell.type === 'exit') fillColor = '#ff0000';
      else if (cell.type === 'solution') fillColor = '#ffff00';
      
      const radius = this.cellSize * 0.15;
      svg += `  <circle cx="${svgX}" cy="${svgY}" r="${radius}" fill="${fillColor}" stroke="#333" stroke-width="1"/>\n`;
    }
    
    svg += '</svg>';
    return svg;
  }
}
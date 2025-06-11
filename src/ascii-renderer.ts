import { Grid, Maze, CellId, makePassage } from './maze-core';

export class ASCIIRenderer {
  // Render just a grid (showing all walls)
  renderGrid(grid: Grid): string {
    const cells = grid.cells();
    if (cells.length === 0) return '';

    // Find bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const cell of cells) {
      const [x, y] = grid.position(cell);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    // Create a 2D grid for ASCII art (each cell is 3x3 in ASCII)
    const asciiHeight = height * 2 + 1;
    const asciiWidth = width * 4 + 1;
    const ascii: string[][] = Array(asciiHeight).fill(null).map(() => 
      Array(asciiWidth).fill(' ')
    );

    // Draw all walls initially
    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        const ay = y * 2;
        const ax = x * 4;
        
        // Corners
        ascii[ay][ax] = '+';
        
        // Horizontal walls
        if (x < width) {
          ascii[ay][ax + 1] = '-';
          ascii[ay][ax + 2] = '-';
          ascii[ay][ax + 3] = '-';
        }
        
        // Vertical walls
        if (y < height) {
          ascii[ay + 1][ax] = '|';
        }
      }
    }

    // Mark entrance and exit
    const entrance = grid.entranceCell();
    const exit = grid.exitCell();
    const [ex, ey] = grid.position(entrance);
    const [xx, xy] = grid.position(exit);
    
    // Place E and X in the cells
    ascii[ey * 2 + 1][ex * 4 + 2] = 'E';
    ascii[xy * 2 + 1][xx * 4 + 2] = 'X';

    return ascii.map(row => row.join('')).join('\n');
  }

  // Render a maze (with passages open)
  renderMaze(maze: Maze, grid: Grid, solution?: CellId[]): string {
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

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    // Create ASCII grid
    const asciiHeight = height * 2 + 1;
    const asciiWidth = width * 4 + 1;
    const ascii: string[][] = Array(asciiHeight).fill(null).map(() => 
      Array(asciiWidth).fill(' ')
    );

    // Draw all walls first
    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        const ay = y * 2;
        const ax = x * 4;
        
        ascii[ay][ax] = '+';
        
        if (x < width) {
          ascii[ay][ax + 1] = '-';
          ascii[ay][ax + 2] = '-';
          ascii[ay][ax + 3] = '-';
        }
        
        if (y < height) {
          ascii[ay + 1][ax] = '|';
        }
      }
    }

    // Remove walls where passages exist
    for (const [cellA, cellB] of maze.passages) {
      // Skip virtual boundary passages
      if (!maze.cells.has(cellA) || !maze.cells.has(cellB)) {
        continue;
      }
      
      const [ax, ay] = grid.position(cellA);
      const [bx, by] = grid.position(cellB);
      
      if (ax === bx) {
        // Vertical passage
        const x = ax;
        const y = Math.min(ay, by);
        ascii[y * 2 + 1][x * 4] = ' ';
        ascii[y * 2 + 1][x * 4 + 1] = ' ';
        ascii[y * 2 + 1][x * 4 + 2] = ' ';
        ascii[y * 2 + 1][x * 4 + 3] = ' ';
        ascii[y * 2 + 1][x * 4 + 4] = ' ';
      } else {
        // Horizontal passage
        const x = Math.min(ax, bx);
        const y = ay;
        ascii[y * 2][x * 4 + 4] = ' ';
        ascii[y * 2 + 1][x * 4 + 4] = ' ';
        ascii[y * 2 + 2][x * 4 + 4] = ' ';
      }
    }

    // Mark cells
    for (const cell of maze.cells) {
      const [x, y] = grid.position(cell);
      const char = cell === maze.entrance ? 'E' :
                   cell === maze.exit ? 'X' :
                   solutionSet.has(cell) ? '*' : ' ';
      
      if (char !== ' ') {
        ascii[y * 2 + 1][x * 4 + 2] = char;
      }
    }

    return ascii.map(row => row.join('')).join('\n');
  }
}
import { CellId, Grid, Passage, makePassage } from './maze-core';

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

  boundaryPassages(cell: CellId): Passage[] {
    const [x, y] = cell.split(',').map(Number);
    const result: Passage[] = [];
    
    // Create virtual "outside" cells for boundary passages
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
}
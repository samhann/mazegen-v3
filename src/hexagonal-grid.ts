import { CellId, Grid, Passage, makePassage } from './maze-core';

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
}
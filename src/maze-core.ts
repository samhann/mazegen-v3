// Core types - minimal and elegant
export type CellId = string;
export type Passage = [CellId, CellId];  // Always sorted
export type Solution = CellId[];

export interface Maze {
  cells: Set<CellId>;
  passages: Set<Passage>;
  entrance: CellId;
  exit: CellId;
}

// Grid interface - defines topology
export interface Grid {
  cells(): CellId[];
  neighbors(cell: CellId): CellId[];
  entranceCell(): CellId;
  exitCell(): CellId;
  boundaryPassages(cell: CellId): Passage[];
  position(cell: CellId): [number, number];
}

// Helper to create sorted passage
export function makePassage(a: CellId, b: CellId): Passage {
  return a < b ? [a, b] : [b, a];
}
// Core types - minimal and elegant
export type CellId = string;
export type Passage = [CellId, CellId];  // Always sorted
export type Solution = CellId[];

export interface Maze {
  cells: Set<CellId>;
  passages: Set<Passage>;        // Internal walkable paths between cells
  boundaryWalls: Set<Passage>;   // Perimeter walls (closed unless at entrance/exit)
  entrance: CellId;
  exit: CellId;
}

// Grid interface - defines topology
export interface Grid {
  cells(): CellId[];
  neighbors(cell: CellId): CellId[];
  entranceCell(): CellId;
  exitCell(): CellId;
  
  // BOUNDARY WALLS (not passages!):
  // Returns wall edges that connect this cell to virtual "outside" cells.
  // These represent the perimeter walls that must ALWAYS exist to contain the maze.
  // They are NOT passages - they are walls that prevent movement to the outside.
  // The spanning tree algorithm should include these as FIXED edges (walls that cannot be removed).
  // Entry/exit openings are created by NOT including specific boundary walls at entrance/exit cells.
  boundaryWalls(cell: CellId): Passage[];
  
  position(cell: CellId): [number, number];
  
  // Convert maze to renderable format - grid handles all geometry and topology
  toRenderable(maze: Maze, solution?: CellId[]): RenderableMaze;
}

// Renderable maze types for simplified rendering
export interface RenderableEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RenderableCell {
  x: number;
  y: number;
  type: 'entrance' | 'exit' | 'solution' | 'normal';
}

export interface RenderablePath {
  points: Array<{ x: number; y: number }>;
}

export interface RenderableMaze {
  edges: RenderableEdge[];    // Only walls to draw
  cells: RenderableCell[];    // Cells with positions and types
  solutionPath?: RenderablePath;  // Connected solution line
}

// Helper to create sorted passage
export function makePassage(a: CellId, b: CellId): Passage {
  return a < b ? [a, b] : [b, a];
}
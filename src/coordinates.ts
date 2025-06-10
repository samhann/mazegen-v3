export interface Coordinates {
  row: number;
  col: number;
}

export enum Direction {
  North = 'north',
  South = 'south',
  East = 'east',
  West = 'west'
}

export const DIRECTION_DELTAS: Record<Direction, Coordinates> = {
  [Direction.North]: { row: -1, col: 0 },
  [Direction.South]: { row: 1, col: 0 },
  [Direction.East]: { row: 0, col: 1 },
  [Direction.West]: { row: 0, col: -1 }
};

export function coordinatesEqual(a: Coordinates, b: Coordinates): boolean {
  return a.row === b.row && a.col === b.col;
}

export function coordinatesToString(coords: Coordinates): string {
  return `${coords.row},${coords.col}`;
}

export function addCoordinates(a: Coordinates, b: Coordinates): Coordinates {
  return { row: a.row + b.row, col: a.col + b.col };
}
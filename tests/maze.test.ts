import { RectangularGrid, Coordinates, Direction } from '../src/maze';

describe('Maze Module Exports', () => {
  test('should export RectangularGrid', () => {
    const grid = new RectangularGrid(3, 3);
    expect(grid).toBeInstanceOf(RectangularGrid);
  });

  test('should export coordinate types', () => {
    const coords: Coordinates = { row: 1, col: 2 };
    expect(coords.row).toBe(1);
    expect(coords.col).toBe(2);
  });

  test('should export Direction enum', () => {
    expect(Direction.North).toBeDefined();
    expect(Direction.South).toBeDefined();
    expect(Direction.East).toBeDefined();
    expect(Direction.West).toBeDefined();
  });
});
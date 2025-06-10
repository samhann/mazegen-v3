"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maze_1 = require("../src/maze");
describe('Maze Module Exports', () => {
    test('should export RectangularGrid', () => {
        const grid = new maze_1.RectangularGrid(3, 3);
        expect(grid).toBeInstanceOf(maze_1.RectangularGrid);
    });
    test('should export coordinate types', () => {
        const coords = { row: 1, col: 2 };
        expect(coords.row).toBe(1);
        expect(coords.col).toBe(2);
    });
    test('should export Direction enum', () => {
        expect(maze_1.Direction.North).toBeDefined();
        expect(maze_1.Direction.South).toBeDefined();
        expect(maze_1.Direction.East).toBeDefined();
        expect(maze_1.Direction.West).toBeDefined();
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maze_1 = require("../src/maze");
describe('MazeGenerator', () => {
    describe('DFS Algorithm', () => {
        test('should generate maze for small grid', () => {
            const grid = new maze_1.RectangularGrid(3, 3);
            const generator = new maze_1.MazeGenerator();
            // Should not throw
            expect(() => generator.generateWithDFS(grid)).not.toThrow();
        });
        test('should generate maze for 1x1 grid', () => {
            const grid = new maze_1.RectangularGrid(1, 1);
            const generator = new maze_1.MazeGenerator();
            expect(() => generator.generateWithDFS(grid)).not.toThrow();
        });
        test('should accept custom start cell', () => {
            const grid = new maze_1.RectangularGrid(5, 5);
            const generator = new maze_1.MazeGenerator();
            const startCell = { row: 2, col: 2 };
            expect(() => generator.generateWithDFS(grid, { startCell })).not.toThrow();
        });
        test('should reject invalid start cell', () => {
            const grid = new maze_1.RectangularGrid(3, 3);
            const generator = new maze_1.MazeGenerator();
            const invalidStartCell = { row: 5, col: 5 };
            expect(() => generator.generateWithDFS(grid, { startCell: invalidStartCell }))
                .toThrow('Invalid start cell coordinates');
        });
        test('should produce reproducible results with seed', () => {
            const seed = 12345;
            // Generate first maze
            const grid1 = new maze_1.RectangularGrid(4, 4);
            const generator1 = new maze_1.MazeGenerator(seed);
            generator1.generateWithDFS(grid1);
            // Generate second maze with same seed
            const grid2 = new maze_1.RectangularGrid(4, 4);
            const generator2 = new maze_1.MazeGenerator(seed);
            generator2.generateWithDFS(grid2);
            // Compare wall states for all adjacent cell pairs
            const cells = grid1.getAllCells();
            for (const cell of cells) {
                const neighbors = grid1.getNeighbors(cell);
                for (const neighbor of neighbors) {
                    const hasWall1 = grid1.hasWall(cell, neighbor);
                    const hasWall2 = grid2.hasWall(cell, neighbor);
                    expect(hasWall1).toBe(hasWall2);
                }
            }
        });
        test('should produce different results with different seeds', () => {
            const grid1 = new maze_1.RectangularGrid(5, 5);
            const generator1 = new maze_1.MazeGenerator(111);
            generator1.generateWithDFS(grid1);
            const grid2 = new maze_1.RectangularGrid(5, 5);
            const generator2 = new maze_1.MazeGenerator(222);
            generator2.generateWithDFS(grid2);
            // Check if there's at least one difference in wall states
            const cells = grid1.getAllCells();
            let foundDifference = false;
            for (const cell of cells) {
                const neighbors = grid1.getNeighbors(cell);
                for (const neighbor of neighbors) {
                    const hasWall1 = grid1.hasWall(cell, neighbor);
                    const hasWall2 = grid2.hasWall(cell, neighbor);
                    if (hasWall1 !== hasWall2) {
                        foundDifference = true;
                        break;
                    }
                }
                if (foundDifference)
                    break;
            }
            expect(foundDifference).toBe(true);
        });
    });
    describe('Static Factory Method', () => {
        test('should create complete maze with factory method', () => {
            const maze = maze_1.MazeGenerator.createMaze(4, 4);
            expect(maze).toBeInstanceOf(maze_1.RectangularGrid);
            expect(maze.width).toBe(4);
            expect(maze.height).toBe(4);
        });
        test('should create reproducible maze with seed', () => {
            const seed = 54321;
            const maze1 = maze_1.MazeGenerator.createMaze(3, 3, { seed });
            const maze2 = maze_1.MazeGenerator.createMaze(3, 3, { seed });
            // Compare wall states
            const cells = maze1.getAllCells();
            for (const cell of cells) {
                const neighbors = maze1.getNeighbors(cell);
                for (const neighbor of neighbors) {
                    expect(maze1.hasWall(cell, neighbor)).toBe(maze2.hasWall(cell, neighbor));
                }
            }
        });
        test('should accept custom start cell in factory method', () => {
            const startCell = { row: 1, col: 1 };
            const maze = maze_1.MazeGenerator.createMaze(3, 3, { startCell });
            expect(maze).toBeInstanceOf(maze_1.RectangularGrid);
        });
    });
});

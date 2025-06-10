"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rectangular_grid_1 = require("../src/rectangular-grid");
const coordinates_1 = require("../src/coordinates");
describe('RectangularGrid', () => {
    describe('Grid Creation', () => {
        test('should create grid with valid dimensions', () => {
            const grid = new rectangular_grid_1.RectangularGrid(5, 3);
            expect(grid.width).toBe(5);
            expect(grid.height).toBe(3);
            expect(grid.getCellCount()).toBe(15);
        });
        test('should throw error for invalid dimensions', () => {
            expect(() => new rectangular_grid_1.RectangularGrid(0, 5)).toThrow('Grid dimensions must be positive');
            expect(() => new rectangular_grid_1.RectangularGrid(5, 0)).toThrow('Grid dimensions must be positive');
            expect(() => new rectangular_grid_1.RectangularGrid(-1, 5)).toThrow('Grid dimensions must be positive');
        });
        test('should create 1x1 grid', () => {
            const grid = new rectangular_grid_1.RectangularGrid(1, 1);
            expect(grid.getCellCount()).toBe(1);
        });
    });
    describe('Coordinate Validation', () => {
        const grid = new rectangular_grid_1.RectangularGrid(3, 4);
        test('should validate coordinates within grid', () => {
            expect(grid.isValidCoordinate({ row: 0, col: 0 })).toBe(true);
            expect(grid.isValidCoordinate({ row: 3, col: 2 })).toBe(true);
            expect(grid.isValidCoordinate({ row: 1, col: 1 })).toBe(true);
        });
        test('should reject coordinates outside grid', () => {
            expect(grid.isValidCoordinate({ row: -1, col: 0 })).toBe(false);
            expect(grid.isValidCoordinate({ row: 0, col: -1 })).toBe(false);
            expect(grid.isValidCoordinate({ row: 4, col: 0 })).toBe(false);
            expect(grid.isValidCoordinate({ row: 0, col: 3 })).toBe(false);
        });
    });
    describe('Neighbor Finding', () => {
        const grid = new rectangular_grid_1.RectangularGrid(3, 3);
        test('should find all 4 neighbors for center cell', () => {
            const neighbors = grid.getNeighbors({ row: 1, col: 1 });
            expect(neighbors).toHaveLength(4);
            const expectedNeighbors = [
                { row: 0, col: 1 }, // North
                { row: 2, col: 1 }, // South
                { row: 1, col: 2 }, // East
                { row: 1, col: 0 } // West
            ];
            expectedNeighbors.forEach(expected => {
                expect(neighbors.some(neighbor => (0, coordinates_1.coordinatesEqual)(neighbor, expected))).toBe(true);
            });
        });
        test('should find 2 neighbors for corner cell', () => {
            const neighbors = grid.getNeighbors({ row: 0, col: 0 });
            expect(neighbors).toHaveLength(2);
            const expectedNeighbors = [
                { row: 1, col: 0 }, // South
                { row: 0, col: 1 } // East
            ];
            expectedNeighbors.forEach(expected => {
                expect(neighbors.some(neighbor => (0, coordinates_1.coordinatesEqual)(neighbor, expected))).toBe(true);
            });
        });
        test('should find 3 neighbors for edge cell', () => {
            const neighbors = grid.getNeighbors({ row: 0, col: 1 });
            expect(neighbors).toHaveLength(3);
            const expectedNeighbors = [
                { row: 1, col: 1 }, // South
                { row: 0, col: 2 }, // East
                { row: 0, col: 0 } // West
            ];
            expectedNeighbors.forEach(expected => {
                expect(neighbors.some(neighbor => (0, coordinates_1.coordinatesEqual)(neighbor, expected))).toBe(true);
            });
        });
        test('should find 0 neighbors for 1x1 grid', () => {
            const smallGrid = new rectangular_grid_1.RectangularGrid(1, 1);
            const neighbors = smallGrid.getNeighbors({ row: 0, col: 0 });
            expect(neighbors).toHaveLength(0);
        });
    });
    describe('Wall Management', () => {
        let grid;
        beforeEach(() => {
            grid = new rectangular_grid_1.RectangularGrid(3, 3);
        });
        test('should initialize with all walls present', () => {
            // Test that adjacent cells have walls between them
            expect(grid.hasWall({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true);
            expect(grid.hasWall({ row: 0, col: 0 }, { row: 1, col: 0 })).toBe(true);
            expect(grid.hasWall({ row: 1, col: 1 }, { row: 1, col: 2 })).toBe(true);
        });
        test('should have walls at grid boundaries', () => {
            // Test that cells at boundaries have walls to outside
            expect(grid.hasWall({ row: 0, col: 0 }, { row: -1, col: 0 })).toBe(true);
            expect(grid.hasWall({ row: 0, col: 0 }, { row: 0, col: -1 })).toBe(true);
            expect(grid.hasWall({ row: 2, col: 2 }, { row: 3, col: 2 })).toBe(true);
            expect(grid.hasWall({ row: 2, col: 2 }, { row: 2, col: 3 })).toBe(true);
        });
        test('should remove walls between adjacent cells', () => {
            const from = { row: 0, col: 0 };
            const to = { row: 0, col: 1 };
            expect(grid.hasWall(from, to)).toBe(true);
            grid.removeWall(from, to);
            expect(grid.hasWall(from, to)).toBe(false);
            expect(grid.hasWall(to, from)).toBe(false); // Should be symmetric
        });
        test('should not remove walls for non-adjacent cells', () => {
            const from = { row: 0, col: 0 };
            const to = { row: 2, col: 2 };
            grid.removeWall(from, to);
            // Wall state should be unchanged for non-adjacent cells
            expect(grid.hasWall(from, to)).toBe(true);
        });
        test('should throw error when trying to remove border walls', () => {
            const validCell = { row: 1, col: 1 };
            const invalidCell = { row: -1, col: 0 };
            expect(grid.hasWall(validCell, invalidCell)).toBe(true);
            expect(() => grid.removeWall(validCell, invalidCell))
                .toThrow('Cannot remove border walls directly. Use addEntryPoint() for entry/exit points.');
        });
    });
    describe('Cell Operations', () => {
        test('should return all cells in correct order', () => {
            const grid = new rectangular_grid_1.RectangularGrid(2, 2);
            const cells = grid.getAllCells();
            expect(cells).toHaveLength(4);
            expect(cells).toEqual([
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 1, col: 0 },
                { row: 1, col: 1 }
            ]);
        });
        test('should return correct cell count', () => {
            expect(new rectangular_grid_1.RectangularGrid(3, 4).getCellCount()).toBe(12);
            expect(new rectangular_grid_1.RectangularGrid(1, 1).getCellCount()).toBe(1);
            expect(new rectangular_grid_1.RectangularGrid(10, 5).getCellCount()).toBe(50);
        });
    });
    describe('Border Wall Management', () => {
        const grid = new rectangular_grid_1.RectangularGrid(3, 3);
        test('should identify border cells correctly', () => {
            expect(grid.isBorderCell({ row: 0, col: 0 })).toBe(true); // corner
            expect(grid.isBorderCell({ row: 0, col: 1 })).toBe(true); // top edge
            expect(grid.isBorderCell({ row: 1, col: 0 })).toBe(true); // left edge
            expect(grid.isBorderCell({ row: 2, col: 2 })).toBe(true); // corner
            expect(grid.isBorderCell({ row: 1, col: 1 })).toBe(false); // center
        });
        n;
        n;
        test('should identify border directions correctly', () => { n; expect(grid.isBorderDirection({ row: 0, col: 0 }, coordinates_1.Direction.North)).toBe(true); n; expect(grid.isBorderDirection({ row: 0, col: 0 }, coordinates_1.Direction.West)).toBe(true); n; expect(grid.isBorderDirection({ row: 0, col: 0 }, coordinates_1.Direction.South)).toBe(false); n; expect(grid.isBorderDirection({ row: 0, col: 0 }, coordinates_1.Direction.East)).toBe(false); n; n; expect(grid.isBorderDirection({ row: 1, col: 1 }, coordinates_1.Direction.North)).toBe(false); n; expect(grid.isBorderDirection({ row: 1, col: 1 }, coordinates_1.Direction.South)).toBe(false); n; });
        n;
        n;
        test('should get all border cells', () => {
            n;
            const borderCells = grid.getBorderCells();
            n;
            expect(borderCells).toHaveLength(8); // 3x3 grid has 8 border cells\n      \n      // Check that all border cells are actually on the border\n      borderCells.forEach(cell => {\n        expect(grid.isBorderCell(cell)).toBe(true);\n      });\n    });\n\n    test('should get border directions for corner cell', () => {\n      const borderDirections = grid.getBorderDirections({ row: 0, col: 0 });\n      expect(borderDirections).toHaveLength(2);\n      expect(borderDirections).toContain(Direction.North);\n      expect(borderDirections).toContain(Direction.West);\n    });\n\n    test('should get border directions for edge cell', () => {\n      const borderDirections = grid.getBorderDirections({ row: 0, col: 1 });\n      expect(borderDirections).toHaveLength(1);\n      expect(borderDirections).toContain(Direction.North);\n    });\n\n    test('should get no border directions for center cell', () => {\n      const borderDirections = grid.getBorderDirections({ row: 1, col: 1 });\n      expect(borderDirections).toHaveLength(0);\n    });\n  });\n\n  describe('Entry/Exit Point Management', () => {\n    let grid: RectangularGrid;\n\n    beforeEach(() => {\n      grid = new RectangularGrid(3, 3);\n    });\n\n    test('should add entry point and remove border wall', () => {\n      const cell = { row: 0, col: 1 };\n      const outsideCell = { row: -1, col: 1 };\n      \n      // Initially should have border wall\n      expect(grid.hasWall(cell, outsideCell)).toBe(true);\n      \n      // Add entry point\n      grid.addEntryPoint(cell, Direction.North);\n      \n      // Should no longer have border wall\n      expect(grid.hasWall(cell, outsideCell)).toBe(false);\n    });\n\n    test('should remove entry point and restore border wall', () => {\n      const cell = { row: 0, col: 1 };\n      const outsideCell = { row: -1, col: 1 };\n      \n      grid.addEntryPoint(cell, Direction.North);\n      expect(grid.hasWall(cell, outsideCell)).toBe(false);\n      \n      grid.removeEntryPoint(cell, Direction.North);\n      expect(grid.hasWall(cell, outsideCell)).toBe(true);\n    });\n\n    test('should track all entry points', () => {\n      grid.addEntryPoint({ row: 0, col: 0 }, Direction.North);\n      grid.addEntryPoint({ row: 2, col: 2 }, Direction.South);\n      \n      const entryPoints = grid.getEntryPoints();\n      expect(entryPoints).toHaveLength(2);\n      \n      expect(entryPoints).toContainEqual({\n        cell: { row: 0, col: 0 },\n        direction: Direction.North\n      });\n      \n      expect(entryPoints).toContainEqual({\n        cell: { row: 2, col: 2 },\n        direction: Direction.South\n      });\n    });\n\n    test('should throw error for invalid cell in entry point', () => {\n      expect(() => grid.addEntryPoint({ row: -1, col: 0 }, Direction.North))\n        .toThrow('Cell must be inside the grid');\n    });\n\n    test('should throw error for non-border direction', () => {\n      expect(() => grid.addEntryPoint({ row: 1, col: 1 }, Direction.North))\n        .toThrow('Direction must point toward grid border');\n    });\n  });\n\n  describe('Wall State Debugging', () => {\n    test('should provide wall information for debugging', () => {\n      const grid = new RectangularGrid(2, 2);\n      const cellWalls = grid.getWallsForCell({ row: 0, col: 0 });\n      \n      expect(cellWalls).toBeDefined();\n      expect(cellWalls?.size).toBe(4); // All 4 walls initially present\n      expect(cellWalls?.has(Direction.North)).toBe(true);\n      expect(cellWalls?.has(Direction.South)).toBe(true);\n      expect(cellWalls?.has(Direction.East)).toBe(true);\n      expect(cellWalls?.has(Direction.West)).toBe(true);\n    });\n  });
        });
    });
});

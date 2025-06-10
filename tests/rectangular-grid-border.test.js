"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rectangular_grid_1 = require("../src/rectangular-grid");
const coordinates_1 = require("../src/coordinates");
describe('RectangularGrid Border Functionality', () => {
    describe('Border Wall Management', () => {
        const grid = new rectangular_grid_1.RectangularGrid(3, 3);
        test('should identify border cells correctly', () => {
            expect(grid.isBorderCell({ row: 0, col: 0 })).toBe(true); // corner
            expect(grid.isBorderCell({ row: 0, col: 1 })).toBe(true); // top edge
            expect(grid.isBorderCell({ row: 1, col: 0 })).toBe(true); // left edge
            expect(grid.isBorderCell({ row: 2, col: 2 })).toBe(true); // corner
            expect(grid.isBorderCell({ row: 1, col: 1 })).toBe(false); // center
        });
        test('should identify border directions correctly', () => {
            expect(grid.isBorderDirection({ row: 0, col: 0 }, coordinates_1.Direction.North)).toBe(true);
            expect(grid.isBorderDirection({ row: 0, col: 0 }, coordinates_1.Direction.West)).toBe(true);
            expect(grid.isBorderDirection({ row: 0, col: 0 }, coordinates_1.Direction.South)).toBe(false);
            expect(grid.isBorderDirection({ row: 0, col: 0 }, coordinates_1.Direction.East)).toBe(false);
            expect(grid.isBorderDirection({ row: 1, col: 1 }, coordinates_1.Direction.North)).toBe(false);
            expect(grid.isBorderDirection({ row: 1, col: 1 }, coordinates_1.Direction.South)).toBe(false);
        });
        test('should get all border cells', () => {
            const borderCells = grid.getBorderCells();
            expect(borderCells).toHaveLength(8); // 3x3 grid has 8 border cells
            // Check that all border cells are actually on the border
            borderCells.forEach(cell => {
                expect(grid.isBorderCell(cell)).toBe(true);
            });
        });
        test('should get border directions for corner cell', () => {
            const borderDirections = grid.getBorderDirections({ row: 0, col: 0 });
            expect(borderDirections).toHaveLength(2);
            expect(borderDirections).toContain(coordinates_1.Direction.North);
            expect(borderDirections).toContain(coordinates_1.Direction.West);
        });
        test('should get border directions for edge cell', () => {
            const borderDirections = grid.getBorderDirections({ row: 0, col: 1 });
            expect(borderDirections).toHaveLength(1);
            expect(borderDirections).toContain(coordinates_1.Direction.North);
        });
        test('should get no border directions for center cell', () => {
            const borderDirections = grid.getBorderDirections({ row: 1, col: 1 });
            expect(borderDirections).toHaveLength(0);
        });
    });
    describe('Entry/Exit Point Management', () => {
        let grid;
        beforeEach(() => {
            grid = new rectangular_grid_1.RectangularGrid(3, 3);
        });
        test('should add entry point and remove border wall', () => {
            const cell = { row: 0, col: 1 };
            const outsideCell = { row: -1, col: 1 };
            // Initially should have border wall
            expect(grid.hasWall(cell, outsideCell)).toBe(true);
            // Add entry point
            grid.addEntryPoint(cell, coordinates_1.Direction.North);
            // Should no longer have border wall
            expect(grid.hasWall(cell, outsideCell)).toBe(false);
        });
        test('should remove entry point and restore border wall', () => {
            const cell = { row: 0, col: 1 };
            const outsideCell = { row: -1, col: 1 };
            grid.addEntryPoint(cell, coordinates_1.Direction.North);
            expect(grid.hasWall(cell, outsideCell)).toBe(false);
            grid.removeEntryPoint(cell, coordinates_1.Direction.North);
            expect(grid.hasWall(cell, outsideCell)).toBe(true);
        });
        test('should track all entry points', () => {
            grid.addEntryPoint({ row: 0, col: 0 }, coordinates_1.Direction.North);
            grid.addEntryPoint({ row: 2, col: 2 }, coordinates_1.Direction.South);
            const entryPoints = grid.getEntryPoints();
            expect(entryPoints).toHaveLength(2);
            expect(entryPoints).toContainEqual({
                cell: { row: 0, col: 0 },
                direction: coordinates_1.Direction.North
            });
            expect(entryPoints).toContainEqual({
                cell: { row: 2, col: 2 },
                direction: coordinates_1.Direction.South
            });
        });
        test('should throw error for invalid cell in entry point', () => {
            expect(() => grid.addEntryPoint({ row: -1, col: 0 }, coordinates_1.Direction.North))
                .toThrow('Cell must be inside the grid');
        });
        test('should throw error for non-border direction', () => {
            expect(() => grid.addEntryPoint({ row: 1, col: 1 }, coordinates_1.Direction.North))
                .toThrow('Direction must point toward grid border');
        });
    });
});

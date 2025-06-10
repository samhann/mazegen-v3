"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RectangularGrid = void 0;
const coordinates_1 = require("./coordinates");
class RectangularGrid {
    constructor(width, height) {
        if (width < 1 || height < 1) {
            throw new Error('Grid dimensions must be positive');
        }
        this.width = width;
        this.height = height;
        this.walls = new Map();
        this.entryPoints = new Set();
        this.initializeGrid();
    }
    initializeGrid() {
        // Initialize all cells with all walls present
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const cellKey = (0, coordinates_1.coordinatesToString)({ row, col });
                this.walls.set(cellKey, new Set(Object.values(coordinates_1.Direction)));
            }
        }
    }
    isValidCoordinate(coords) {
        return coords.row >= 0 && coords.row < this.height &&
            coords.col >= 0 && coords.col < this.width;
    }
    getNeighbors(coords) {
        const neighbors = [];
        for (const direction of Object.values(coordinates_1.Direction)) {
            const delta = coordinates_1.DIRECTION_DELTAS[direction];
            const neighbor = (0, coordinates_1.addCoordinates)(coords, delta);
            if (this.isValidCoordinate(neighbor)) {
                neighbors.push(neighbor);
            }
        }
        return neighbors;
    }
    hasWall(from, to) {
        var _a;
        // Handle border walls (between cell and outside grid)
        if (!this.isValidCoordinate(from) || !this.isValidCoordinate(to)) {
            return this.hasBorderWall(from, to);
        }
        const direction = this.getDirection(from, to);
        if (!direction) {
            return true; // Not adjacent cells
        }
        const fromKey = (0, coordinates_1.coordinatesToString)(from);
        const fromWalls = this.walls.get(fromKey);
        return (_a = fromWalls === null || fromWalls === void 0 ? void 0 : fromWalls.has(direction)) !== null && _a !== void 0 ? _a : true;
    }
    removeWall(from, to) {
        var _a, _b;
        // Only allow removing internal walls (between two valid cells)
        if (!this.isValidCoordinate(from) || !this.isValidCoordinate(to)) {
            throw new Error('Cannot remove border walls directly. Use addEntryPoint() for entry/exit points.');
        }
        const direction = this.getDirection(from, to);
        const reverseDirection = this.getReverseDirection(direction);
        if (!direction || !reverseDirection) {
            return;
        }
        const fromKey = (0, coordinates_1.coordinatesToString)(from);
        const toKey = (0, coordinates_1.coordinatesToString)(to);
        (_a = this.walls.get(fromKey)) === null || _a === void 0 ? void 0 : _a.delete(direction);
        (_b = this.walls.get(toKey)) === null || _b === void 0 ? void 0 : _b.delete(reverseDirection);
    }
    getDirection(from, to) {
        const delta = { row: to.row - from.row, col: to.col - from.col };
        for (const [direction, directionDelta] of Object.entries(coordinates_1.DIRECTION_DELTAS)) {
            if (delta.row === directionDelta.row && delta.col === directionDelta.col) {
                return direction;
            }
        }
        return null;
    }
    getReverseDirection(direction) {
        if (!direction)
            return null;
        const reverseMap = {
            [coordinates_1.Direction.North]: coordinates_1.Direction.South,
            [coordinates_1.Direction.South]: coordinates_1.Direction.North,
            [coordinates_1.Direction.East]: coordinates_1.Direction.West,
            [coordinates_1.Direction.West]: coordinates_1.Direction.East
        };
        return reverseMap[direction];
    }
    getAllCells() {
        const cells = [];
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                cells.push({ row, col });
            }
        }
        return cells;
    }
    getCellCount() {
        return this.width * this.height;
    }
    /**
     * Checks if there's a border wall between a cell and the outside of the grid
     */
    hasBorderWall(from, to) {
        const validFrom = this.isValidCoordinate(from);
        const validTo = this.isValidCoordinate(to);
        if (validFrom && validTo) {
            return false; // Both cells are inside, this is an internal wall
        }
        if (!validFrom && !validTo) {
            return true; // Both outside grid
        }
        // One cell is inside, one is outside - check for entry points
        const insideCell = validFrom ? from : to;
        const outsideCell = validFrom ? to : from;
        const direction = this.getDirection(insideCell, outsideCell);
        if (!direction) {
            return true;
        }
        // Check if this border location has been marked as an entry point
        const entryKey = this.getBorderEntryKey(insideCell, direction);
        return !this.entryPoints.has(entryKey);
    }
    /**
     * Creates an entry/exit point by removing a border wall
     */
    addEntryPoint(cell, direction) {
        if (!this.isValidCoordinate(cell)) {
            throw new Error('Cell must be inside the grid');
        }
        if (!this.isBorderDirection(cell, direction)) {
            throw new Error('Direction must point toward grid border');
        }
        const entryKey = this.getBorderEntryKey(cell, direction);
        this.entryPoints.add(entryKey);
    }
    /**
     * Removes an entry/exit point, restoring the border wall
     */
    removeEntryPoint(cell, direction) {
        const entryKey = this.getBorderEntryKey(cell, direction);
        this.entryPoints.delete(entryKey);
    }
    /**
     * Checks if a direction from a cell points toward the grid border
     */
    isBorderDirection(cell, direction) {
        if (!this.isValidCoordinate(cell)) {
            return false;
        }
        const delta = coordinates_1.DIRECTION_DELTAS[direction];
        const targetCell = (0, coordinates_1.addCoordinates)(cell, delta);
        return !this.isValidCoordinate(targetCell);
    }
    /**
     * Gets all cells that are on the border of the grid
     */
    getBorderCells() {
        const borderCells = [];
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const cell = { row, col };
                if (this.isBorderCell(cell)) {
                    borderCells.push(cell);
                }
            }
        }
        return borderCells;
    }
    /**
     * Checks if a cell is on the border of the grid
     */
    isBorderCell(cell) {
        return cell.row === 0 || cell.row === this.height - 1 ||
            cell.col === 0 || cell.col === this.width - 1;
    }
    /**
     * Gets the directions that point toward the border from a given cell
     */
    getBorderDirections(cell) {
        const directions = [];
        for (const direction of Object.values(coordinates_1.Direction)) {
            if (this.isBorderDirection(cell, direction)) {
                directions.push(direction);
            }
        }
        return directions;
    }
    getBorderEntryKey(cell, direction) {
        return `${(0, coordinates_1.coordinatesToString)(cell)}:${direction}`;
    }
    /**
     * Gets all current entry points
     */
    getEntryPoints() {
        return Array.from(this.entryPoints).map(entryKey => {
            const [cellStr, direction] = entryKey.split(':');
            const [row, col] = cellStr.split(',').map(Number);
            return {
                cell: { row, col },
                direction: direction
            };
        });
    }
    // For debugging
    getWallsForCell(coords) {
        const key = (0, coordinates_1.coordinatesToString)(coords);
        return this.walls.get(key);
    }
}
exports.RectangularGrid = RectangularGrid;

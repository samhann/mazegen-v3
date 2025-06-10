"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MazeGenerator = void 0;
const rectangular_grid_1 = require("./rectangular-grid");
const coordinates_1 = require("./coordinates");
class MazeGenerator {
    constructor(seed) {
        // Simple seeded random number generator for reproducible results
        if (seed !== undefined) {
            let state = seed;
            this.rng = () => {
                state = (state * 1103515245 + 12345) % 2147483648;
                return state / 2147483648;
            };
        }
        else {
            this.rng = Math.random;
        }
    }
    /**
     * Generates a maze using Depth-First Search (Recursive Backtracker) algorithm
     */
    generateWithDFS(grid, options = {}) {
        const visited = new Set();
        const stack = [];
        // Choose starting cell (default to top-left)
        const startCell = options.startCell || { row: 0, col: 0 };
        if (!grid.isValidCoordinate(startCell)) {
            throw new Error('Invalid start cell coordinates');
        }
        // Start DFS from the chosen cell
        let currentCell = startCell;
        visited.add((0, coordinates_1.coordinatesToString)(currentCell));
        const totalCells = grid.getCellCount();
        while (visited.size < totalCells) {
            const unvisitedNeighbors = this.getUnvisitedNeighbors(grid, currentCell, visited);
            if (unvisitedNeighbors.length > 0) {
                // Choose a random unvisited neighbor
                const randomIndex = Math.floor(this.rng() * unvisitedNeighbors.length);
                const chosenNeighbor = unvisitedNeighbors[randomIndex];
                // Push current cell to stack for backtracking
                stack.push(currentCell);
                // Remove wall between current cell and chosen neighbor
                grid.removeWall(currentCell, chosenNeighbor);
                // Move to chosen neighbor
                currentCell = chosenNeighbor;
                visited.add((0, coordinates_1.coordinatesToString)(currentCell));
            }
            else {
                // Backtrack: no unvisited neighbors, go back to previous cell
                if (stack.length > 0) {
                    currentCell = stack.pop();
                }
                else {
                    // This should not happen if the grid is connected
                    break;
                }
            }
        }
    }
    getUnvisitedNeighbors(grid, cell, visited) {
        // Only consider neighbors that are valid cells (internal to the grid)
        // This automatically excludes border walls since getNeighbors only returns valid coordinates
        return grid.getNeighbors(cell).filter(neighbor => !visited.has((0, coordinates_1.coordinatesToString)(neighbor)));
    }
    /**
     * Adds default entry and exit points to a maze
     */
    addDefaultEntryExit(grid) {
        // Add entry at top-left
        grid.addEntryPoint({ row: 0, col: 0 }, coordinates_1.Direction.North);
        // Add exit at bottom-right
        const exitRow = grid.height - 1;
        const exitCol = grid.width - 1;
        grid.addEntryPoint({ row: exitRow, col: exitCol }, coordinates_1.Direction.South);
    }
    /**
     * Utility method to create a complete maze from grid dimensions
     */
    static createMaze(width, height, options = {}) {
        const grid = new rectangular_grid_1.RectangularGrid(width, height);
        const generator = new MazeGenerator(options.seed);
        generator.generateWithDFS(grid, options);
        // Add default entry/exit points unless explicitly disabled
        if (options.addDefaultEntryExit !== false) {
            generator.addDefaultEntryExit(grid);
        }
        return grid;
    }
}
exports.MazeGenerator = MazeGenerator;

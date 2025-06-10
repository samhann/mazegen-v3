"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maze_1 = require("../src/maze");
describe('Maze', () => {
    test('should create a maze instance', () => {
        const maze = new maze_1.Maze();
        expect(maze).toBeInstanceOf(maze_1.Maze);
    });
});

import { Maze } from '../src/maze';

describe('Maze', () => {
  test('should create a maze instance', () => {
    const maze = new Maze();
    expect(maze).toBeInstanceOf(Maze);
  });
});
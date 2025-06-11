import { ASCIIRenderer } from '../src/ascii-renderer';
import { RectangularGrid } from '../src/rectangular-grid';
import { Maze } from '../src/maze-core';

describe('ASCIIRenderer', () => {
  const renderer = new ASCIIRenderer();

  test('renders empty grid with all walls', () => {
    const grid = new RectangularGrid(2, 2);
    const output = renderer.renderGrid(grid);
    
    // Should show a 2x2 grid with E at top-left and X at bottom-right
    expect(output).toContain('E');
    expect(output).toContain('X');
    expect(output.split('\n').length).toBe(5); // 2*2+1 rows
    
    console.log('2x2 Grid:');
    console.log(output);
  });

  test('renders 3x3 grid correctly', () => {
    const grid = new RectangularGrid(3, 3);
    const output = renderer.renderGrid(grid);
    
    console.log('\n3x3 Grid:');
    console.log(output);
    
    // Check dimensions
    const lines = output.split('\n');
    expect(lines.length).toBe(7); // 3*2+1
    expect(lines[0].length).toBe(13); // 3*4+1
  });

  test('renders maze with passages', () => {
    const grid = new RectangularGrid(3, 3);
    
    // Create a simple maze with some passages
    const maze: Maze = {
      cells: new Set(grid.cells()),
      passages: new Set([
        ['0,0', '1,0'],
        ['1,0', '2,0'],
        ['2,0', '2,1'],
        ['2,1', '2,2'],
        ['2,2', '1,2'],
        ['1,2', '0,2'],
        ['0,2', '0,1'],
        ['0,1', '0,0'],
        ['1,1', '1,2'] // Center connection
      ]),
      boundaryWalls: new Set<[string, string]>(),  // No boundary walls for this test
      entrance: '0,0',
      exit: '2,2'
    };
    
    const output = renderer.renderMaze(maze, grid);
    
    console.log('\n3x3 Maze with passages:');
    console.log(output);
    
    expect(output).toContain('E');
    expect(output).toContain('X');
  });

  test('renders solution path', () => {
    const grid = new RectangularGrid(3, 3);
    
    const maze: Maze = {
      cells: new Set(grid.cells()),
      passages: new Set([
        ['0,0', '1,0'],
        ['1,0', '1,1'],
        ['1,1', '2,1'],
        ['2,1', '2,2']
      ]),
      boundaryWalls: new Set<[string, string]>(),  // No boundary walls for this test
      entrance: '0,0',
      exit: '2,2'
    };
    
    const solution = ['0,0', '1,0', '1,1', '2,1', '2,2'];
    const output = renderer.renderMaze(maze, grid, solution);
    
    console.log('\n3x3 Maze with solution:');
    console.log(output);
    
    // Solution cells should be marked with *
    expect(output.match(/\*/g)?.length).toBe(3); // 3 cells between E and X
  });
});
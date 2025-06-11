import { solveMaze, validateSolution } from '../src/maze-solver';
import { generateMaze } from '../src/maze-generator';
import { RectangularGrid } from '../src/rectangular-grid';
import { ASCIIRenderer } from '../src/ascii-renderer';
import { Maze } from '../src/maze-core';

describe('solveMaze', () => {
  const renderer = new ASCIIRenderer();
  
  test('solves simple 3x3 maze', () => {
    const grid = new RectangularGrid(3, 3);
    const maze = generateMaze(grid, () => 0.5);
    
    const solution = solveMaze(maze);
    
    console.log('\n3x3 Maze with solution:');
    console.log(renderer.renderMaze(maze, grid, solution || []));
    
    expect(solution).not.toBeNull();
    expect(solution![0]).toBe('0,0');
    expect(solution![solution!.length - 1]).toBe('2,2');
    
    // Validate the solution
    const errors = validateSolution(maze, solution!);
    expect(errors).toEqual([]);
  });
  
  test('solves larger 5x5 maze', () => {
    const grid = new RectangularGrid(5, 5);
    const maze = generateMaze(grid, () => 0.3);
    
    const solution = solveMaze(maze);
    
    console.log('\n5x5 Maze with solution:');
    console.log(renderer.renderMaze(maze, grid, solution || []));
    
    expect(solution).not.toBeNull();
    expect(solution![0]).toBe('0,0');
    expect(solution![solution!.length - 1]).toBe('4,4');
    
    const errors = validateSolution(maze, solution!);
    expect(errors).toEqual([]);
  });
  
  test('all generated mazes are solvable', () => {
    const grid = new RectangularGrid(4, 4);
    
    // Test many random mazes
    for (let i = 0; i < 20; i++) {
      const maze = generateMaze(grid, Math.random);
      const solution = solveMaze(maze);
      
      expect(solution).not.toBeNull();
      if (solution) {
        const errors = validateSolution(maze, solution);
        expect(errors).toEqual([]);
      }
    }
  });
  
  test('returns null for unsolvable maze', () => {
    // Create a disconnected maze
    const unsolvableMaze: Maze = {
      cells: new Set(['0,0', '1,0', '2,0', '0,1', '1,1', '2,1']),
      passages: new Set([
        ['0,0', '1,0'] as [string, string],
        // Missing connection to exit at 2,1
      ]),
      boundaryWalls: new Set<[string, string]>(),  // No boundary walls for this test
      entrance: '0,0',
      exit: '2,1'
    };
    
    const solution = solveMaze(unsolvableMaze);
    expect(solution).toBeNull();
  });
  
  test('finds shortest path', () => {
    // Create a simple maze with known shortest path
    const simpleMaze: Maze = {
      cells: new Set(['0,0', '1,0', '2,0', '0,1', '1,1', '2,1']),
      passages: new Set([
        ['0,0', '1,0'] as [string, string],
        ['1,0', '2,0'] as [string, string],
        ['2,0', '2,1'] as [string, string],
        ['0,0', '0,1'] as [string, string],  // Alternative longer path
        ['0,1', '1,1'] as [string, string],
        ['1,1', '2,1'] as [string, string]
      ]),
      boundaryWalls: new Set<[string, string]>(),  // No boundary walls for this test
      entrance: '0,0',
      exit: '2,1'
    };
    
    const solution = solveMaze(simpleMaze);
    
    expect(solution).not.toBeNull();
    // Should find shortest path: 0,0 -> 1,0 -> 2,0 -> 2,1
    expect(solution!.length).toBe(4);
    expect(solution).toEqual(['0,0', '1,0', '2,0', '2,1']);
  });
});

describe('validateSolution', () => {
  test('validates correct solution', () => {
    const maze: Maze = {
      cells: new Set(['0,0', '1,0', '2,0']),
      passages: new Set([
        ['0,0', '1,0'] as [string, string],
        ['1,0', '2,0'] as [string, string]
      ]),
      boundaryWalls: new Set<[string, string]>(),  // No boundary walls for this test
      entrance: '0,0',
      exit: '2,0'
    };
    
    const solution = ['0,0', '1,0', '2,0'];
    const errors = validateSolution(maze, solution);
    
    expect(errors).toEqual([]);
  });
  
  test('detects invalid solution', () => {
    const maze: Maze = {
      cells: new Set(['0,0', '1,0', '2,0']),
      passages: new Set([
        ['0,0', '1,0'] as [string, string]
        // Missing passage from 1,0 to 2,0
      ]),
      boundaryWalls: new Set<[string, string]>(),  // No boundary walls for this test
      entrance: '0,0',
      exit: '2,0'
    };
    
    const solution = ['0,0', '1,0', '2,0'];
    const errors = validateSolution(maze, solution);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('no passage'))).toBe(true);
  });
  
  test('detects wrong start/end', () => {
    const maze: Maze = {
      cells: new Set(['0,0', '1,0', '2,0']),
      passages: new Set([
        ['0,0', '1,0'] as [string, string],
        ['1,0', '2,0'] as [string, string]
      ]),
      boundaryWalls: new Set<[string, string]>(),  // No boundary walls for this test
      entrance: '0,0',
      exit: '2,0'
    };
    
    const badSolution = ['1,0', '2,0'];  // Doesn't start at entrance
    const errors = validateSolution(maze, badSolution);
    
    expect(errors.some(e => e.includes("doesn't start at entrance"))).toBe(true);
  });
});
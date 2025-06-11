import { generateMaze, validateMaze } from '../src/maze-generator';
import { RectangularGrid } from '../src/rectangular-grid';
import { ASCIIRenderer } from '../src/ascii-renderer';

describe('generateMaze', () => {
  const deterministicRandom = () => 0.5;
  const renderer = new ASCIIRenderer();
  
  test('generates valid 3x3 maze', () => {
    const grid = new RectangularGrid(3, 3);
    const maze = generateMaze(grid, deterministicRandom);
    
    console.log('\n3x3 Generated Maze:');
    console.log(renderer.renderMaze(maze, grid));
    
    // Validate the maze
    const errors = validateMaze(maze, grid);
    expect(errors).toEqual([]);
    
    // Check basic properties
    expect(maze.cells.size).toBe(9);
    expect(maze.entrance).toBe('0,0');
    expect(maze.exit).toBe('2,2');
    
    // Should have exactly n-1 internal passages for connectivity
    const internalPassages = Array.from(maze.passages).filter(
      ([a, b]) => maze.cells.has(a) && maze.cells.has(b)
    );
    expect(internalPassages.length).toBe(8); // 9 cells - 1
  });
  
  test('generates valid 5x5 maze', () => {
    const grid = new RectangularGrid(5, 5);
    const maze = generateMaze(grid, deterministicRandom);
    
    console.log('\n5x5 Generated Maze:');
    console.log(renderer.renderMaze(maze, grid));
    
    const errors = validateMaze(maze, grid);
    expect(errors).toEqual([]);
    
    expect(maze.cells.size).toBe(25);
    expect(maze.entrance).toBe('0,0');
    expect(maze.exit).toBe('4,4');
  });
  
  test('different random seeds produce different mazes', () => {
    const grid = new RectangularGrid(4, 4);
    
    const maze1 = generateMaze(grid, () => 0.1);
    const maze2 = generateMaze(grid, () => 0.9);
    
    // Convert passages to strings for comparison
    const passages1 = Array.from(maze1.passages).map(p => `${p[0]}-${p[1]}`).sort();
    const passages2 = Array.from(maze2.passages).map(p => `${p[0]}-${p[1]}`).sort();
    
    // Should be different (very likely with good random distribution)
    expect(passages1).not.toEqual(passages2);
  });
  
  test('all generated mazes are valid', () => {
    const grid = new RectangularGrid(4, 4);
    
    // Generate many random mazes and validate all
    for (let i = 0; i < 20; i++) {
      const maze = generateMaze(grid, Math.random);
      const errors = validateMaze(maze, grid);
      
      if (errors.length > 0) {
        console.log(`Maze ${i} errors:`, errors);
        console.log(renderer.renderMaze(maze, grid));
      }
      
      expect(errors).toEqual([]);
    }
  });
  
  test('validates invalid maze correctly', () => {
    const grid = new RectangularGrid(3, 3);
    
    // Create an invalid maze with disconnected cells
    const invalidMaze = {
      cells: new Set(['0,0', '1,0', '2,0', '0,1', '1,1', '2,1', '0,2', '1,2', '2,2']),
      passages: new Set([
        ['0,0', '1,0'] as [string, string],  // Only connect first row
        ['1,0', '2,0'] as [string, string]
        // Missing connections to other rows
      ]),
      entrance: '0,0',
      exit: '2,2'
    };
    
    const errors = validateMaze(invalidMaze, grid);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('not reachable'))).toBe(true);
  });
  
  test('throws for invalid entrance/exit', () => {
    const grid = new RectangularGrid(3, 3);
    
    // Create a mock grid with invalid entrance but proper cells() method
    const badGrid = {
      cells: () => grid.cells(),
      neighbors: (cell: string) => grid.neighbors(cell),
      entranceCell: () => 'invalid',
      exitCell: () => '2,2',
      boundaryWalls: (cell: string) => grid.boundaryWalls(cell),
      position: (cell: string) => grid.position(cell)
    };
    
    expect(() => generateMaze(badGrid, Math.random)).toThrow('Entrance cell not in grid');
  });
});
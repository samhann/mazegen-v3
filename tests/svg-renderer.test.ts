import { SVGRenderer } from '../src/svg-renderer';
import { generateMaze } from '../src/maze-generator';
import { solveMaze } from '../src/maze-solver';
import { RectangularGrid } from '../src/rectangular-grid';

describe('SVGRenderer', () => {
  test('renders basic maze to SVG', () => {
    const grid = new RectangularGrid(3, 3);
    const maze = generateMaze(grid, () => 0.5);
    const solution = solveMaze(maze);
    
    const renderer = new SVGRenderer();
    const svg = renderer.render(maze, grid, solution || undefined);
    
    // Basic SVG structure checks
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('width=');
    expect(svg).toContain('height=');
    
    // Should contain lines for walls
    expect(svg).toContain('<line');
    
    // Should contain solution path if provided
    if (solution) {
      expect(svg).toContain('<path');
    }
    
    console.log('\n3x3 SVG Maze:');
    console.log(svg);
  });
  
  test('renders with custom options', () => {
    const grid = new RectangularGrid(2, 2);
    const maze = generateMaze(grid, () => 0.5);
    
    const renderer = new SVGRenderer({
      cellSize: 50,
      wallWidth: 4,
      strokeColor: '#ff0000',
      backgroundColor: '#f0f0f0'
    });
    
    const svg = renderer.render(maze, grid);
    
    expect(svg).toContain('width="104"');  // 2*50 + 4
    expect(svg).toContain('height="104"');
    expect(svg).toContain('#ff0000');
    expect(svg).toContain('#f0f0f0');
  });
  
  test('creates valid SVG for larger maze', () => {
    const grid = new RectangularGrid(5, 5);
    const maze = generateMaze(grid, Math.random);
    const solution = solveMaze(maze);
    
    const renderer = new SVGRenderer({
      cellSize: 20,
      solutionColor: '#0000ff'
    });
    
    const svg = renderer.render(maze, grid, solution || undefined);
    
    // Should be valid SVG
    expect(svg).toMatch(/^<svg[^>]*>/);
    expect(svg).toMatch(/<\/svg>$/);
    
    // Should have correct dimensions
    expect(svg).toContain('width="102"');  // 5*20 + 2
    expect(svg).toContain('height="102"');
    
    console.log('\n5x5 SVG with solution (first 500 chars):');
    console.log(svg.substring(0, 500) + '...');
  });
  
  test('handles maze without solution', () => {
    const grid = new RectangularGrid(3, 3);
    const maze = generateMaze(grid, () => 0.3);
    
    const renderer = new SVGRenderer();
    const svg = renderer.render(maze, grid);
    
    // Should render without errors
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    
    // Should not contain solution path
    expect(svg).not.toContain('<path');
  });
});
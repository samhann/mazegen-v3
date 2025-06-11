import { RectangularGrid, generateMaze, solveMaze, ASCIIRenderer, SVGRenderer } from './src';

// Demo the complete maze system
console.log('🌟 Elegant Maze Generator Demo 🌟\n');

// Create a 6x6 grid
const grid = new RectangularGrid(6, 6);
console.log(`Grid: ${grid.cells().length} cells`);
console.log(`Entrance: ${grid.entranceCell()}`);
console.log(`Exit: ${grid.exitCell()}\n`);

// Generate a random maze
const maze = generateMaze(grid);
console.log(`Generated maze with ${maze.passages.size} passages\n`);

// Solve the maze
const solution = solveMaze(maze);
console.log(`Solution found: ${solution ? solution.length : 0} steps\n`);

// Render in ASCII
const asciiRenderer = new ASCIIRenderer();
console.log('ASCII Maze with Solution:');
console.log(asciiRenderer.renderMaze(maze, grid, solution || []));
console.log();

// Render as SVG
const svgRenderer = new SVGRenderer({
  cellSize: 40,
  solutionColor: '#ff6b6b',
  entranceColor: '#51cf66',
  exitColor: '#ffd43b'
});

const svg = svgRenderer.render(maze, grid, solution || []);

// Save SVG to file
import * as fs from 'fs';
fs.writeFileSync('maze-demo.svg', svg);
console.log('SVG saved to maze-demo.svg');

// Some stats
console.log('\n📊 Stats:');
console.log(`• Total cells: ${maze.cells.size}`);
console.log(`• Total passages: ${maze.passages.size}`);
console.log(`• Internal passages: ${Array.from(maze.passages).filter(([a, b]) => maze.cells.has(a) && maze.cells.has(b)).length}`);
console.log(`• Solution length: ${solution?.length || 0} steps`);
console.log(`• Code lines: ~${countCodeLines()} lines total`);

function countCodeLines(): number {
  // Rough estimate of our implementation
  return [
    'maze-core.ts',
    'rectangular-grid.ts', 
    'spanning-tree.ts',
    'maze-generator.ts',
    'maze-solver.ts',
    'ascii-renderer.ts',
    'svg-renderer.ts'
  ].reduce((total, file) => {
    try {
      const content = fs.readFileSync(`src/${file}`, 'utf8');
      const lines = content.split('\n').filter(line => 
        line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('*')
      );
      return total + lines.length;
    } catch {
      return total;
    }
  }, 0);
}
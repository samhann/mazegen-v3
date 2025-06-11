import { generateMaze } from './src/maze-generator';
import { solveMaze } from './src/maze-solver';
import { RectangularGrid } from './src/rectangular-grid';
import { HexagonalGrid } from './src/hexagonal-grid';
import { SVGRenderer } from './src/svg-renderer';
import { UniversalSVGRenderer } from './src/universal-svg-renderer';
import * as fs from 'fs';

// Generate rectangular maze
console.log('Generating rectangular maze...');
const rectGrid = new RectangularGrid(15, 15);
const rectMaze = generateMaze(rectGrid);
const rectSolution = solveMaze(rectMaze);

// Render rectangular maze
const rectRenderer = new SVGRenderer();
const rectSvg = rectRenderer.render(rectMaze, rectGrid, rectSolution || undefined);
fs.writeFileSync('rectangular-maze-with-walls.svg', rectSvg);
console.log('Rectangular maze saved to rectangular-maze-with-walls.svg');

// Generate hexagonal maze
console.log('\nGenerating hexagonal maze...');
const hexGrid = new HexagonalGrid(5);
const hexMaze = generateMaze(hexGrid);
const hexSolution = solveMaze(hexMaze);

// Render hexagonal maze
const hexRenderer = new UniversalSVGRenderer();
const hexSvg = hexRenderer.render(hexMaze, hexGrid, hexSolution || undefined);
fs.writeFileSync('hexagonal-maze-with-walls.svg', hexSvg);
console.log('Hexagonal maze saved to hexagonal-maze-with-walls.svg');

// Also create a simple HTML file to view both
const html = `<!DOCTYPE html>
<html>
<head>
    <title>Maze Examples with Boundary Walls</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f0f0f0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .maze-container {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1, h2 {
            color: #333;
        }
        .description {
            color: #666;
            margin: 10px 0;
        }
        img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Maze Generation with Proper Boundary Walls</h1>
        <p class="description">
            These mazes demonstrate the corrected boundary wall implementation. 
            The perimeter is completely solid except for openings at the entrance (green) and exit (red).
        </p>
        
        <div class="maze-container">
            <h2>Rectangular Maze (15x15)</h2>
            <p class="description">
                Entrance at top-left (0,0), exit at bottom-right (14,14). 
                Notice the solid perimeter walls with openings only at entrance and exit.
            </p>
            <img src="rectangular-maze-with-walls.svg" alt="Rectangular Maze">
        </div>
        
        <div class="maze-container">
            <h2>Hexagonal Maze (radius 5)</h2>
            <p class="description">
                Entrance on the left edge, exit on the right edge.
                The hexagonal perimeter is solid except at the designated openings.
            </p>
            <img src="hexagonal-maze-with-walls.svg" alt="Hexagonal Maze">
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('maze-boundary-demo.html', html);
console.log('\nHTML demo page saved to maze-boundary-demo.html');
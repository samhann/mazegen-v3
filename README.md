# Maze Generation v3

A TypeScript library for generating mazes and testing their completeness.

## Features

- **Library**: Core maze generation algorithms with completeness validation
- **CLI**: Command-line interface for maze generation and testing
- **Web Interface**: Interactive web page for easy maze creation and visualization

## Project Structure

- `src/` - Core maze generation library
- `lib/` - Compiled library output
- `web/` - Web interface files
- `tests/` - Test suites for maze algorithms

## Development

```bash
npm install
npm run build
npm test
```

## Quick Testing

Generate and view hexagonal mazes for debugging:

```bash
# Generate SVG maze file
npx ts-node -e "
import { generateMaze } from './src/maze-generator';
import { HexagonalGrid } from './src/hexagonal-grid';
import { UniversalSVGRenderer } from './src/universal-svg-renderer';
import { solveMaze } from './src/maze-solver';
import { writeFileSync } from 'fs';

const grid = new HexagonalGrid(3);
const maze = generateMaze(grid);
const solution = solveMaze(maze);
const renderer = new UniversalSVGRenderer();
const svg = renderer.render(maze, grid, solution || undefined);
writeFileSync('test-output/test-maze.svg', svg);
console.log('Generated test-output/test-maze.svg');
"

# View in browser
open test-output/test-maze.svg
```

Convert SVG to PNG for visual debugging:
```bash
npx ts-node svg-to-png-rsvg.ts test-output/test-maze.svg test-output/test-maze.png
```

*Note: Requires ImageMagick (`brew install imagemagick`). The PNG can then be read by Claude Code for visual inspection and debugging.*

## Known Issues

- **Hexagonal wall gaps**: Small gaps remain between wall segments despite mathematical fixes
- **Boundary wall rendering**: Perimeter walls are computed correctly but rendering is incomplete
- Both issues affect visual quality but not maze logic or connectivity
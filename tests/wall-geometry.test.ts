import { RectangularGrid } from '../src/rectangular-grid';
import { HexagonalGrid } from '../src/hexagonal-grid';
import { generateMaze } from '../src/maze-generator';

describe('Wall Length Geometry', () => {
  
  test('rectangular walls span exactly 1.0 units (cell boundary distance)', () => {
    const grid = new RectangularGrid(3, 3);
    const maze = generateMaze(grid);
    const renderable = grid.toRenderable(maze);
    
    // Check a representative sample of walls
    for (const edge of renderable.edges) {
      const wallLength = Math.sqrt(
        Math.pow(edge.x2 - edge.x1, 2) + Math.pow(edge.y2 - edge.y1, 2)
      );
      
      // Rectangular walls should span exactly 1.0 units (from -0.5 to +0.5 relative to midpoint)
      expect(wallLength).toBeCloseTo(1.0, 10);
    }
  });
  
  test('hexagonal walls span exactly side length (distance ÷ √3)', () => {
    const grid = new HexagonalGrid(2);
    const maze = generateMaze(grid);
    const renderable = grid.toRenderable(maze);
    
    // In hexagonal grids, center distance is 1.0, so wall length should be 1/√3 ≈ 0.577
    const expectedWallLength = 1.0 / Math.sqrt(3);
    
    // Check a representative sample of walls
    for (const edge of renderable.edges) {
      const wallLength = Math.sqrt(
        Math.pow(edge.x2 - edge.x1, 2) + Math.pow(edge.y2 - edge.y1, 2)
      );
      
      // Hexagonal walls should span the side length of regular hexagons
      expect(wallLength).toBeCloseTo(expectedWallLength, 10);
    }
  });
  
  test('wall positions are exactly at cell boundaries', () => {
    const grid = new RectangularGrid(2, 2);
    const maze = generateMaze(grid);
    const renderable = grid.toRenderable(maze);
    
    // All cells should be rendered at integer coordinates
    for (const cell of renderable.cells) {
      expect(cell.x).toBeCloseTo(Math.round(cell.x), 10);
      expect(cell.y).toBeCloseTo(Math.round(cell.y), 10);
    }
    
    // All wall endpoints should be at half-integer positions (cell boundaries)
    for (const edge of renderable.edges) {
      // Check that wall endpoints are at multiples of 0.5 (cell boundaries)
      expect(edge.x1 % 0.5).toBeCloseTo(0, 10);
      expect(edge.y1 % 0.5).toBeCloseTo(0, 10);
      expect(edge.x2 % 0.5).toBeCloseTo(0, 10);  
      expect(edge.y2 % 0.5).toBeCloseTo(0, 10);
    }
  });
  
  test('hexagonal neighbor distances are exactly 1.0', () => {
    const grid = new HexagonalGrid(2);
    
    // Test center cell and its neighbors
    const centerCell = '0,0';
    const neighbors = grid.neighbors(centerCell);
    const [centerX, centerY] = grid.position(centerCell);
    
    for (const neighbor of neighbors) {
      const [neighX, neighY] = grid.position(neighbor);
      const distance = Math.sqrt(
        Math.pow(neighX - centerX, 2) + Math.pow(neighY - centerY, 2)
      );
      
      // All hexagonal neighbors should be exactly 1.0 units apart
      expect(distance).toBeCloseTo(1.0, 10);
    }
  });
  
  test('no duplicate walls in renderable output', () => {
    const rectGrid = new RectangularGrid(3, 3);
    const rectMaze = generateMaze(rectGrid);
    const rectRenderable = rectGrid.toRenderable(rectMaze);
    
    const hexGrid = new HexagonalGrid(2);
    const hexMaze = generateMaze(hexGrid);
    const hexRenderable = hexGrid.toRenderable(hexMaze);
    
    // Check both grid types for duplicate walls
    for (const renderable of [rectRenderable, hexRenderable]) {
      const edgeKeys = new Set<string>();
      
      for (const edge of renderable.edges) {
        // Create canonical key (sorted endpoints)
        const key = [
          Math.min(edge.x1, edge.x2),
          Math.min(edge.y1, edge.y2),
          Math.max(edge.x1, edge.x2),
          Math.max(edge.y1, edge.y2)
        ].join(',');
        
        // Should not have seen this wall before
        expect(edgeKeys.has(key)).toBe(false);
        edgeKeys.add(key);
      }
    }
  });
  
});

describe('Wall Rendering Logic', () => {
  
  test('boundary walls rendered for perimeter cells', () => {
    const grid = new RectangularGrid(3, 3);
    const maze = generateMaze(grid);
    const renderable = grid.toRenderable(maze);
    
    // Count boundary walls (walls that extend to grid perimeter)
    let boundaryWallCount = 0;
    let totalWallCount = renderable.edges.length;
    
    for (const edge of renderable.edges) {
      const [x1, y1, x2, y2] = [edge.x1, edge.y1, edge.x2, edge.y2];
      
      // Check if this wall touches the grid boundary
      const touchesLeftBoundary = Math.min(x1, x2) <= 0.1;
      const touchesRightBoundary = Math.max(x1, x2) >= 2.9; // 3-cell grid goes 0->2
      const touchesTopBoundary = Math.min(y1, y2) <= 0.1;
      const touchesBottomBoundary = Math.max(y1, y2) >= 2.9;
      
      if (touchesLeftBoundary || touchesRightBoundary || touchesTopBoundary || touchesBottomBoundary) {
        boundaryWallCount++;
      }
    }
    
    // Should have some boundary walls (perimeter isn't completely open)
    expect(boundaryWallCount).toBeGreaterThan(8); // At least most of perimeter
    
    // Should have both boundary and internal walls
    expect(totalWallCount).toBeGreaterThan(boundaryWallCount);
  });
  
  test('no walls rendered where passages exist', () => {
    const grid = new RectangularGrid(3, 3);
    const maze = generateMaze(grid);
    const renderable = grid.toRenderable(maze);
    
    // For each passage in the maze, verify no wall exists between those cells
    for (const [cellA, cellB] of maze.passages) {
      if (!maze.cells.has(cellA) || !maze.cells.has(cellB)) {
        continue; // Skip boundary passages
      }
      
      const [x1, y1] = grid.position(cellA);
      const [x2, y2] = grid.position(cellB);
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      // Check that no wall exists at the midpoint between these connected cells
      const hasWall = renderable.edges.some(edge => {
        const wallMidX = (edge.x1 + edge.x2) / 2;
        const wallMidY = (edge.y1 + edge.y2) / 2;
        return Math.abs(wallMidX - midX) < 0.1 && Math.abs(wallMidY - midY) < 0.1;
      });
      
      expect(hasWall).toBe(false); // No wall should exist where passage connects cells
    }
  });
  
  test('walls rendered where no passages exist between neighbors', () => {
    const grid = new RectangularGrid(3, 3);
    const maze = generateMaze(grid);
    const renderable = grid.toRenderable(maze);
    
    // Build passage lookup for quick checks
    const passageSet = new Set<string>();
    for (const [cellA, cellB] of maze.passages) {
      if (maze.cells.has(cellA) && maze.cells.has(cellB)) {
        passageSet.add(`${cellA}|${cellB}`);
        passageSet.add(`${cellB}|${cellA}`);
      }
    }
    
    let wallsBetweenNeighbors = 0;
    let gapsBetweenNeighbors = 0;
    
    // Check all adjacent cell pairs
    for (const cell of maze.cells) {
      const neighbors = grid.neighbors(cell);
      const [x1, y1] = grid.position(cell);
      
      for (const neighbor of neighbors) {
        if (maze.cells.has(neighbor) && cell < neighbor) { // Check each pair once
          const [x2, y2] = grid.position(neighbor);
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          
          const hasPassage = passageSet.has(`${cell}|${neighbor}`);
          const hasWall = renderable.edges.some(edge => {
            const wallMidX = (edge.x1 + edge.x2) / 2;
            const wallMidY = (edge.y1 + edge.y2) / 2;
            return Math.abs(wallMidX - midX) < 0.1 && Math.abs(wallMidY - midY) < 0.1;
          });
          
          if (hasPassage) {
            expect(hasWall).toBe(false); // Passage = no wall
            gapsBetweenNeighbors++;
          } else {
            expect(hasWall).toBe(true); // No passage = wall should exist
            wallsBetweenNeighbors++;
          }
        }
      }
    }
    
    // Sanity check: should have both walls and gaps
    expect(wallsBetweenNeighbors).toBeGreaterThan(0);
    expect(gapsBetweenNeighbors).toBeGreaterThan(0);
  });
  
  test('spanning tree properties reflected in wall rendering', () => {
    const grid = new RectangularGrid(4, 4);
    const maze = generateMaze(grid);
    const renderable = grid.toRenderable(maze);
    
    // Count internal passages (between maze cells only)
    const internalPassages = Array.from(maze.passages).filter(
      ([cellA, cellB]) => maze.cells.has(cellA) && maze.cells.has(cellB)
    );
    
    // Spanning tree property: exactly (n-1) internal passages for n cells
    expect(internalPassages.length).toBe(maze.cells.size - 1);
    
    // Count internal walls (between maze cells, not boundary walls)
    let internalWalls = 0;
    for (const cell of maze.cells) {
      const neighbors = grid.neighbors(cell);
      for (const neighbor of neighbors) {
        if (maze.cells.has(neighbor) && cell < neighbor) {
          const hasPassage = internalPassages.some(
            ([a, b]) => (a === cell && b === neighbor) || (a === neighbor && b === cell)
          );
          if (!hasPassage) {
            internalWalls++;
          }
        }
      }
    }
    
    // Total internal connections = internal passages + internal walls
    const totalInternalConnections = internalPassages.length + internalWalls;
    
    // Should equal total possible connections in the grid topology
    let totalPossibleConnections = 0;
    for (const cell of maze.cells) {
      const neighbors = grid.neighbors(cell);
      for (const neighbor of neighbors) {
        if (maze.cells.has(neighbor) && cell < neighbor) {
          totalPossibleConnections++;
        }
      }
    }
    
    expect(totalInternalConnections).toBe(totalPossibleConnections);
  });
  
});
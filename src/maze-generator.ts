import { Grid, Maze, CellId, makePassage } from './maze-core';
import { spanningTree, Graph, Edge } from './spanning-tree';

// Generate a maze from a grid using spanning tree algorithm
export function generateMaze(grid: Grid, random: () => number = Math.random): Maze {
  const cells = new Set(grid.cells());
  const entrance = grid.entranceCell();
  const exit = grid.exitCell();
  
  if (!cells.has(entrance)) {
    throw new Error('Entrance cell not in grid');
  }
  
  if (!cells.has(exit)) {
    throw new Error('Exit cell not in grid');
  }
  
  // Build graph from grid topology
  const edges: Edge<CellId>[] = [];
  
  // Add all internal edges (between grid cells)
  for (const cell of cells) {
    for (const neighbor of grid.neighbors(cell)) {
      if (cell < neighbor) {  // Avoid duplicates
        edges.push({
          from: cell,
          to: neighbor,
          isFixed: false
        });
      }
    }
  }
  
  // Add boundary wall edges for all cells (to create perimeter walls)
  // These are fixed edges EXCEPT at entrance/exit where we want openings
  for (const cell of cells) {
    const boundaries = grid.boundaryWalls(cell);
    for (const [from, to] of boundaries) {
      // Skip entrance and exit - we want openings there
      if (cell === entrance || cell === exit) {
        continue;
      }
      // Add as fixed edge - creates wall
      edges.push({
        from,
        to,
        isFixed: true
      });
    }
  }
  
  // Create graph for spanning tree algorithm
  const allNodes = new Set(cells);
  // Add virtual boundary nodes
  for (const edge of edges) {
    allNodes.add(edge.from);
    allNodes.add(edge.to);
  }
  
  const graph: Graph<CellId> = {
    nodes: allNodes,
    edges
  };
  
  // Generate spanning tree
  const treeEdges = spanningTree(graph, random);
  
  // Separate internal passages from boundary walls
  const passages = new Set<[CellId, CellId]>();
  const boundaryWalls = new Set<[CellId, CellId]>();
  
  for (const edge of treeEdges) {
    if (cells.has(edge.from) && cells.has(edge.to)) {
      // Internal passage between real cells
      passages.add(makePassage(edge.from, edge.to));
    } else if (cells.has(edge.from) || cells.has(edge.to)) {
      // Boundary wall between real cell and virtual "outside" cell
      boundaryWalls.add(makePassage(edge.from, edge.to));
    }
    // Note: edges between two virtual cells (if any) are ignored
  }
  
  return {
    cells,
    passages,
    boundaryWalls,
    entrance,
    exit
  };
}

// Validate a maze
export function validateMaze(maze: Maze, grid: Grid): string[] {
  const errors: string[] = [];
  
  // Check entrance and exit are in maze
  if (!maze.cells.has(maze.entrance)) {
    errors.push('Entrance not in maze cells');
  }
  
  if (!maze.cells.has(maze.exit)) {
    errors.push('Exit not in maze cells');
  }
  
  // Check passages are between valid cells
  for (const [cellA, cellB] of maze.passages) {
    if (!maze.cells.has(cellA) || !maze.cells.has(cellB)) {
      continue; // Skip boundary passages
    }
    
    // Check cells are neighbors in grid
    const neighborsA = grid.neighbors(cellA);
    if (!neighborsA.includes(cellB)) {
      errors.push(`Invalid passage between non-neighbors: ${cellA} - ${cellB}`);
    }
  }
  
  // Check connectivity by building adjacency and doing BFS
  const adj = new Map<CellId, Set<CellId>>();
  for (const cell of maze.cells) {
    adj.set(cell, new Set());
  }
  
  // Add adjacencies from passages
  for (const [cellA, cellB] of maze.passages) {
    if (maze.cells.has(cellA) && maze.cells.has(cellB)) {
      adj.get(cellA)!.add(cellB);
      adj.get(cellB)!.add(cellA);
    }
  }
  
  // BFS from entrance
  const visited = new Set<CellId>();
  const queue = [maze.entrance];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    
    visited.add(current);
    
    for (const neighbor of adj.get(current) || []) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }
  
  // Check all cells are reachable
  if (visited.size !== maze.cells.size) {
    errors.push(`Not all cells reachable: ${visited.size}/${maze.cells.size}`);
  }
  
  // Check exit is reachable
  if (!visited.has(maze.exit)) {
    errors.push('Exit not reachable from entrance');
  }
  
  return errors;
}
import { Maze, CellId, Solution } from './maze-core';

// Solve a maze using BFS to find shortest path
export function solveMaze(maze: Maze): Solution | null {
  // Build adjacency list from passages
  const adj = new Map<CellId, Set<CellId>>();
  
  for (const cell of maze.cells) {
    adj.set(cell, new Set());
  }
  
  // Add connections from passages (only between maze cells)
  for (const [cellA, cellB] of maze.passages) {
    if (maze.cells.has(cellA) && maze.cells.has(cellB)) {
      adj.get(cellA)!.add(cellB);
      adj.get(cellB)!.add(cellA);
    }
  }
  
  // BFS from entrance to exit
  const queue: CellId[] = [maze.entrance];
  const parent = new Map<CellId, CellId>();
  parent.set(maze.entrance, maze.entrance);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current === maze.exit) {
      // Reconstruct path
      const path: CellId[] = [];
      let node = maze.exit;
      
      while (node !== maze.entrance) {
        path.unshift(node);
        node = parent.get(node)!;
      }
      path.unshift(maze.entrance);
      
      return path;
    }
    
    // Explore neighbors
    for (const neighbor of adj.get(current) || []) {
      if (!parent.has(neighbor)) {
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }
  
  return null; // No path found
}

// Check if a path is valid in the maze
export function validateSolution(maze: Maze, solution: Solution): string[] {
  const errors: string[] = [];
  
  if (solution.length === 0) {
    errors.push('Empty solution');
    return errors;
  }
  
  // Check starts at entrance
  if (solution[0] !== maze.entrance) {
    errors.push(`Solution doesn't start at entrance: ${solution[0]} != ${maze.entrance}`);
  }
  
  // Check ends at exit
  if (solution[solution.length - 1] !== maze.exit) {
    errors.push(`Solution doesn't end at exit: ${solution[solution.length - 1]} != ${maze.exit}`);
  }
  
  // Check all cells are in maze
  for (const cell of solution) {
    if (!maze.cells.has(cell)) {
      errors.push(`Solution contains invalid cell: ${cell}`);
    }
  }
  
  // Build adjacency from passages
  const adj = new Map<CellId, Set<CellId>>();
  for (const cell of maze.cells) {
    adj.set(cell, new Set());
  }
  
  for (const [cellA, cellB] of maze.passages) {
    if (maze.cells.has(cellA) && maze.cells.has(cellB)) {
      adj.get(cellA)!.add(cellB);
      adj.get(cellB)!.add(cellA);
    }
  }
  
  // Check each step is valid (adjacent cells with passage)
  for (let i = 0; i < solution.length - 1; i++) {
    const current = solution[i];
    const next = solution[i + 1];
    
    if (!adj.get(current)?.has(next)) {
      errors.push(`Invalid step: no passage from ${current} to ${next}`);
    }
  }
  
  return errors;
}
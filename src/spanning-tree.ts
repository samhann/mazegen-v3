// Pure graph algorithms - know nothing about mazes

export interface Edge<T> {
  from: T;
  to: T;
  isFixed?: boolean;  // Cannot be removed
}

export interface Graph<T> {
  nodes: Set<T>;
  edges: Edge<T>[];
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Kruskal's algorithm with union-find
export function spanningTree<T>(graph: Graph<T>, random: () => number): Edge<T>[] {
  if (graph.nodes.size === 0) return [];
  
  // Separate fixed and removable edges
  const fixedEdges = graph.edges.filter(e => e.isFixed);
  const removableEdges = graph.edges.filter(e => !e.isFixed);
  
  // Shuffle removable edges for randomness
  const shuffled = shuffle(removableEdges, random);
  
  // Union-find data structure
  const parent = new Map<T, T>();
  const rank = new Map<T, number>();
  
  function find(x: T): T {
    if (!parent.has(x)) {
      parent.set(x, x);
      rank.set(x, 0);
    }
    
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)!));  // Path compression
    }
    
    return parent.get(x)!;
  }
  
  function union(x: T, y: T): boolean {
    const rootX = find(x);
    const rootY = find(y);
    
    if (rootX === rootY) return false;
    
    // Union by rank
    const rankX = rank.get(rootX) || 0;
    const rankY = rank.get(rootY) || 0;
    
    if (rankX < rankY) {
      parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      parent.set(rootY, rootX);
    } else {
      parent.set(rootY, rootX);
      rank.set(rootX, rankX + 1);
    }
    
    return true;
  }
  
  const result: Edge<T>[] = [];
  
  // Add all fixed edges first
  for (const edge of fixedEdges) {
    union(edge.from, edge.to);
    result.push(edge);
  }
  
  // Add removable edges that don't create cycles
  for (const edge of shuffled) {
    if (union(edge.from, edge.to)) {
      result.push(edge);
    }
  }
  
  return result;
}

// Check if a graph is connected
export function isConnected<T>(nodes: Set<T>, edges: Edge<T>[]): boolean {
  if (nodes.size === 0) return true;
  if (nodes.size === 1) return true;
  
  // Build adjacency list
  const adj = new Map<T, Set<T>>();
  for (const node of nodes) {
    adj.set(node, new Set());
  }
  
  for (const edge of edges) {
    adj.get(edge.from)?.add(edge.to);
    adj.get(edge.to)?.add(edge.from);
  }
  
  // BFS from first node
  const start = nodes.values().next().value;
  const visited = new Set<T>();
  const queue = [start];
  
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
  
  return visited.size === nodes.size;
}
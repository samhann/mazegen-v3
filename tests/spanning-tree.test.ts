import { spanningTree, isConnected, Graph, Edge } from '../src/spanning-tree';

describe('spanningTree', () => {
  // Deterministic random for testing
  const deterministicRandom = () => 0.5;
  
  test('empty graph returns empty tree', () => {
    const graph: Graph<string> = {
      nodes: new Set(),
      edges: []
    };
    
    expect(spanningTree(graph, Math.random)).toEqual([]);
  });
  
  test('single node returns empty tree', () => {
    const graph: Graph<string> = {
      nodes: new Set(['A']),
      edges: []
    };
    
    expect(spanningTree(graph, Math.random)).toEqual([]);
  });
  
  test('simple connected graph', () => {
    const graph: Graph<string> = {
      nodes: new Set(['A', 'B', 'C']),
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'A', to: 'C' }
      ]
    };
    
    const tree = spanningTree(graph, deterministicRandom);
    
    // Should have n-1 edges for n nodes
    expect(tree.length).toBe(2);
    
    // Should be connected
    expect(isConnected(graph.nodes, tree)).toBe(true);
  });
  
  test('respects fixed edges', () => {
    const graph: Graph<string> = {
      nodes: new Set(['A', 'B', 'C', 'D']),
      edges: [
        { from: 'A', to: 'B', isFixed: true },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'A' },
        { from: 'A', to: 'C' }
      ]
    };
    
    const tree = spanningTree(graph, deterministicRandom);
    
    // Fixed edge should be included
    expect(tree.some(e => e.from === 'A' && e.to === 'B' && e.isFixed)).toBe(true);
    
    // Should have exactly n-1 edges
    expect(tree.length).toBe(3);
    
    // Should be connected
    expect(isConnected(graph.nodes, tree)).toBe(true);
  });
  
  test('grid-like graph produces spanning tree', () => {
    // 3x3 grid
    const nodes = new Set<string>();
    const edges: Edge<string>[] = [];
    
    // Create nodes
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        nodes.add(`${x},${y}`);
      }
    }
    
    // Create edges (horizontal and vertical connections)
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (x < 2) edges.push({ from: `${x},${y}`, to: `${x+1},${y}` });
        if (y < 2) edges.push({ from: `${x},${y}`, to: `${x},${y+1}` });
      }
    }
    
    const graph: Graph<string> = { nodes, edges };
    const tree = spanningTree(graph, Math.random);
    
    // Should have exactly 8 edges for 9 nodes
    expect(tree.length).toBe(8);
    
    // Should be connected
    expect(isConnected(nodes, tree)).toBe(true);
    
    // No duplicate edges
    const edgeSet = new Set(tree.map(e => `${e.from}-${e.to}`));
    expect(edgeSet.size).toBe(tree.length);
  });
  
  test('randomness produces different trees', () => {
    const graph: Graph<string> = {
      nodes: new Set(['A', 'B', 'C', 'D']),
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'A' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'D' }
      ]
    };
    
    // Generate multiple trees
    const trees = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const tree = spanningTree(graph, Math.random);
      const treeStr = tree.map(e => `${e.from}-${e.to}`).sort().join(',');
      trees.add(treeStr);
    }
    
    // Should produce at least 2 different trees (very likely with 6 edges choose 3)
    expect(trees.size).toBeGreaterThan(1);
  });
});

describe('isConnected', () => {
  test('empty graph is connected', () => {
    expect(isConnected(new Set(), [])).toBe(true);
  });
  
  test('single node is connected', () => {
    expect(isConnected(new Set(['A']), [])).toBe(true);
  });
  
  test('simple connected graph', () => {
    const nodes = new Set(['A', 'B', 'C']);
    const edges: Edge<string>[] = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' }
    ];
    
    expect(isConnected(nodes, edges)).toBe(true);
  });
  
  test('disconnected graph', () => {
    const nodes = new Set(['A', 'B', 'C', 'D']);
    const edges: Edge<string>[] = [
      { from: 'A', to: 'B' },
      { from: 'C', to: 'D' }
    ];
    
    expect(isConnected(nodes, edges)).toBe(false);
  });
  
  test('cycle is connected', () => {
    const nodes = new Set(['A', 'B', 'C', 'D']);
    const edges: Edge<string>[] = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' },
      { from: 'D', to: 'A' }
    ];
    
    expect(isConnected(nodes, edges)).toBe(true);
  });
});
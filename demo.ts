#!/usr/bin/env tsx

import { MazeGenerator, MazeValidator, MazeSolver, SVGRenderer } from './src/maze';

/**
 * Demonstrates the complete maze generation pipeline
 */
function runMazeDemo() {
  console.log('🌟 Maze Generation Demo\n');
  
  // Generate a maze
  console.log('1. Generating 8x8 maze...');
  const maze = MazeGenerator.createMaze(8, 8, {
    seed: 42,
    addDefaultEntryExit: true
  });
  
  // Validate the maze
  console.log('2. Validating maze structure...');
  const validation = MazeValidator.validate(maze);
  console.log(`   ✅ Valid: ${validation.isValid}`);
  console.log(`   🔗 Connected: ${validation.isConnected}`);
  console.log(`   🚫 No cycles: ${validation.hasNoCycles}`);
  console.log(`   📊 Cells: ${validation.cellCount}, Passages: ${validation.passageCount}`);
  
  // Solve the maze
  console.log('3. Finding solution path...');
  const solution = MazeSolver.findSolutionPath(maze);
  console.log(`   🎯 Solvable: ${solution.found}`);
  if (solution.found) {
    console.log(`   📏 Solution length: ${solution.length} steps`);
    console.log(`   🛤️  Path: ${solution.path.length} cells`);
  }
  
  // Analyze difficulty
  console.log('4. Analyzing maze difficulty...');
  const difficulty = MazeSolver.analyzeDifficulty(maze);
  console.log(`   💀 Dead ends: ${difficulty.deadEnds}`);
  console.log(`   📈 Solution ratio: ${(difficulty.solutionRatio * 100).toFixed(1)}%`);
  
  // Generate HTML visualization
  console.log('5. Generating HTML visualization...');
  const html = SVGRenderer.createHTMLPage(maze, {
    cellSize: 25,
    showSolution: true,
    solutionColor: '#ff0000',
    wallColor: '#333333'
  });
  
  console.log('\n📄 HTML Output:');
  console.log('================');
  console.log(html);
  
  console.log('\n✨ Demo completed successfully!');
  console.log('💡 Copy the HTML output above to a .html file and open in browser to view the maze.');
}

if (require.main === module) {
  runMazeDemo();
}

export { runMazeDemo };
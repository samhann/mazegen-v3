# Claude Engineering Principles

Code like a senior engineer: minimize code (treat as liability), test thoroughly, make small incremental changes, validate hypotheses, think adversarially, commit incrementally.

Write elegant functional code where possible without going too functional or esoteric.

## Project Setup Learnings
- TypeScript + Jest setup: `npm init -y`, install deps, `tsc--init`, create dirs, test build/test pipeline
- Test commands: `npm run build`, `npm test` - both must pass before committing

## Maze Implementation: Metacognitive Insights

### Key Design Breakthrough: "Passages, Not Walls"
The critical insight that made everything elegant was representing mazes as **open passages** rather than **removed walls**. This simple representation shift eliminated countless edge cases and made the code fall out naturally.

### Architecture Philosophy: "Correct by Construction"
- **Choose representations that make invalid states impossible**
- **Use pure functions everywhere** - no side effects, easy to test
- **Uniform interfaces** - string IDs work universally across grid types
- **Single responsibility** - each component does exactly one thing

### Testing Strategy: "Property-Based Validation" 
Instead of testing specific outputs, we validate invariants:
- All generated mazes are connected (BFS reaches all cells)
- Exact spanning tree property (n-1 edges for n cells)
- Boundary walls preserved except entrance/exit
- Solutions are valid paths through passages

### Implementation Order: "Build on Solid Foundations"
1. **Core types first** - Get the data model right
2. **Grid topology** - Test neighbor relationships thoroughly  
3. **Graph algorithms** - Pure spanning tree, isolated from maze concepts
4. **ASCII renderer early** - Visual debugging prevents errors
5. **Composition** - Combine pieces only after each is solid

### Norvig-Style Elegance Principles
- **Right representation eliminates complexity** (passages vs walls)
- **Uniform abstractions** (string IDs, sorted pairs) 
- **Pure functions compose naturally**
- **Simple parts, emergent behavior**

### Trade-offs Made
- **String IDs over type safety** - Simplicity beats performance
- **BFS over A*** - Mazes are small, clarity matters more
- **Sorted pairs over complex equality** - Prevent duplicates by design
- **ASCII + SVG over complex renderers** - Cover 90% of use cases simply

### Hexagonal Grid Lessons
Previous attempts failed because:
- **Mixed coordinate systems** - Leaked axial coords into renderers
- **Complex wall tracking** - Should have used passages from start
- **No incremental testing** - Built too much before validating foundations

For hexagonal implementation: Use axial coordinates internally, convert to x,y only for rendering. Same Grid interface, different neighbor logic.
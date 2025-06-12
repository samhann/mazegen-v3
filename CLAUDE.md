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

## Engineering Humility

**All code is suspect until proven correct through multiple validation layers:**

1. **Implementation** - Assume bugs exist, write defensively
2. **Unit tests pass** - Good sign, but tests can be wrong too  
3. **Integration tests pass** - Better, but still not certain
4. **Visual validation** - See the output, does it look right?
5. **End-to-end verification** - Generate, solve, render - works completely?

**Only after ALL validation layers pass should confidence increase.**

**CRITICAL: Visual validation is mandatory, not optional.**
- Unit tests passing ≠ correctness
- Integration tests passing ≠ correctness  
- Code that "should work" ≠ correctness
- Only when you can SEE the output working correctly should confidence increase
- If you cannot visually validate, you have NOT validated at all

**LESSON: Beware of hidden interdependencies**
- Changing one component may break others in unexpected ways
- Renderers may assume specific coordinate systems/topologies
- "Reusing existing code" doesn't mean it will work with new data
- Always test the FULL pipeline, not just individual pieces
- Start with the simplest possible case and verify each layer

**Common overconfidence traps:**
- "This should work because the logic seems right"
- "Tests pass so it must be correct" 
- "The algorithm is standard so implementation must be fine"
- "It worked for rectangular so hex will be similar"

**Defensive coding practices:**
- Add assertions for assumptions
- Test edge cases explicitly  
- Visual inspection of small examples
- Manual verification of key calculations
- Incremental testing at each step

## SVG to PNG Conversion Tool

For visual debugging of maze rendering, use the SVG to PNG conversion tool:

```bash
# Convert SVG to PNG for visual inspection
npx ts-node svg-to-png-rsvg.ts input.svg output.png [width]
```

**Requirements:** Install ImageMagick or librsvg:
- macOS: `brew install imagemagick` or `brew install librsvg` 
- The tool will automatically try both and fall back gracefully

**Claude Code Integration:**
- Use the Read tool on generated PNG files to visually inspect maze rendering
- This enables Claude to debug visual issues independently
- Particularly useful for geometric problems like wall lengths and boundary rendering

## Mathematical Wall Length Derivation: Critical Learning

**LESSON: Derive, don't guess at geometric constants**

### The Wall Length Problem
Multiple attempts to "fix" wall rendering by guessing multiplier values (0.4, 0.7, 0.8, 1.0) led to frustration. The breakthrough came from mathematical first principles.

### Correct Mathematical Derivations:

**Rectangular Grids:**
- Cells occupy 1×1 squares at integer coordinates  
- Cell boundaries extend ±0.5 from center
- **Wall length = 1.0** (spans exactly between boundaries)
- Implementation: `±0.5` from midpoint

**Hexagonal Grids:**  
- Centers are 1.0 units apart (axial coordinates)
- But hexagons have **side length = center_distance ÷ √3**
- Walls connect hexagon edges, NOT center-to-center
- **Wall length = distance ÷ √3 ≈ 0.577** (the hexagon side length)
- Implementation: `length / Math.sqrt(3)`

### Key Insight: Wall ≠ Center Distance
The critical error was assuming walls should span the full distance between centers. Actually:
- **Rectangular**: Walls span cell boundaries (1.0 units)
- **Hexagonal**: Walls span hexagon edges (0.577 × center distance)

### Metacognitive Lesson
- **Visual feedback beats theoretical reasoning** - User's "it looks wrong" trumped mathematical confidence
- **Geometry has exact answers** - No need for magic numbers or trial-and-error
- **Test assumptions about coordinate systems** - "Obviously correct" formulas may be wrong
- **When math disagrees with visual reality, question the math first**
# Maze Generator Architecture Diagrams

## 📐 **Overall System Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                        MAZE GENERATION SYSTEM                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   GRID LAYER    │    │  ALGORITHM LAYER │    │ RENDER LAYER │ │
│  │                 │    │                  │    │              │ │
│  │ • RectangularGrid│───▶│ • MazeGenerator │───▶│ • ASCIIRender│ │
│  │ • HexagonalGrid │    │ • SpanningTree  │    │ • SVGRender  │ │
│  │                 │    │ • MazeSolver    │    │ • Universal  │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                       │                       │     │
│           ▼                       ▼                       ▼     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │  Grid Interface │    │  Pure Functions │    │  Visualization│ │
│  │                 │    │                 │    │              │ │
│  │ • cells()       │    │ • No side effects │  │ • SVG/ASCII  │ │
│  │ • neighbors()   │    │ • Testable      │    │ • Browser    │ │
│  │ • position()    │    │ • Composable    │    │ • Files      │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 **Component Relationships**

```
                    MAZE CORE TYPES
         ┌─────────────────────────────────────┐
         │  type CellId = string               │
         │  type Passage = [CellId, CellId]    │
         │  interface Maze {                   │
         │    cells: Set<CellId>               │
         │    passages: Set<Passage>           │
         │    entrance: CellId                 │
         │    exit: CellId                     │
         │  }                                  │
         └─────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │    GRID     │ │ ALGORITHMS  │ │  RENDERERS  │
    │             │ │             │ │             │
    │Grid Interface│ │ ┌─────────┐ │ │┌─────────┐  │
    │             │ │ │Spanning │ │ ││ASCII    │  │
    │┌──────────┐ │ │ │Tree     │ │ ││Renderer │  │
    ││Rectangular││ │ │Algorithm│ │ ││         │  │
    ││Grid      ││ │ └─────────┘ │ │└─────────┘  │
    │└──────────┘ │ │ ┌─────────┐ │ │┌─────────┐  │
    │┌──────────┐ │ │ │Maze     │ │ ││SVG      │  │
    ││Hexagonal ││ │ │Generator│ │ ││Renderer │  │
    ││Grid      ││ │ └─────────┘ │ ││         │  │
    │└──────────┘ │ │ ┌─────────┐ │ │└─────────┘  │
    └─────────────┘ │ │Maze     │ │ │┌─────────┐  │
                    │ │Solver   │ │ ││Universal│  │
                    │ └─────────┘ │ ││SVG      │  │
                    └─────────────┘ │└─────────┘  │
                                    └─────────────┘
```

## 🔄 **Data Flow: Maze Generation**

```
1. GRID CREATION
   ┌──────────────┐
   │Grid(width,   │
   │     height)  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ cells()      │
   │ neighbors()  │
   │ entrance()   │
   │ exit()       │
   └──────┬───────┘

2. GRAPH BUILDING                3. SPANNING TREE
   ┌──────────────┐                ┌──────────────┐
   │ For each cell│──────────────▶ │ Kruskal's    │
   │   For each   │                │ Algorithm    │
   │   neighbor   │                │              │
   │     Create   │                │ Union-Find   │
   │     Edge     │                │ Data Struct  │
   └──────┬───────┘                └──────┬───────┘
          │                               │
          ▼                               ▼
   ┌──────────────┐                ┌──────────────┐
   │ Graph<CellId>│                │ Tree Edges   │
   │ {            │                │ (n-1 edges  │
   │   nodes,     │                │  for n nodes)│
   │   edges      │                │              │
   │ }            │                │              │
   └──────────────┘                └──────┬───────┘

4. MAZE CREATION                  5. SOLUTION FINDING
   ┌──────────────┐                ┌──────────────┐
   │ Convert tree │                │ BFS from     │
   │ edges to     │──────────────▶ │ entrance to  │
   │ passages     │                │ exit         │
   │              │                │              │
   │ Add entrance/│                │ Return path  │
   │ exit passages│                │ of CellIds   │
   └──────┬───────┘                └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ Maze {       │
   │   cells,     │
   │   passages,  │
   │   entrance,  │
   │   exit       │
   │ }            │
   └──────────────┘
```

## 🏗️ **Grid Interface Design**

```
                         Grid Interface
    ┌────────────────────────────────────────────────────┐
    │                                                    │
    │  cells(): CellId[]           ◄── Topology         │
    │  neighbors(cell): CellId[]   ◄── Adjacency        │
    │  entranceCell(): CellId      ◄── Entry point      │
    │  exitCell(): CellId          ◄── Exit point       │
    │  boundaryPassages(cell)      ◄── Boundary logic   │
    │  position(cell): [x, y]      ◄── Rendering coords │
    │                                                    │
    └────────────────┬───────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Rectangular│ │Hexagonal│ │Future   │
    │Grid       │ │Grid     │ │Grid     │
    │           │ │         │ │Types    │
    │4 neighbors│ │6 neighbors│ │...      │
    │(x,y) coords│ │(q,r) coords│ │        │
    │Integer pos│ │Fractional│ │         │
    └─────────┘ └─────────┘ └─────────┘

KEY INSIGHT: Same interface, different implementations
             Algorithms work unchanged across all grid types
```

## 🔀 **Spanning Tree Algorithm Flow**

```
INPUT: Graph<CellId>
┌─────────────────────────────────────────────────────────┐
│ nodes: Set<CellId>                                      │
│ edges: Edge<CellId>[] {                                 │
│   { from: CellId, to: CellId, isFixed?: boolean }      │
│ }                                                       │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│               KRUSKAL'S ALGORITHM                       │
│                                                         │
│ 1. Separate fixed and removable edges                  │
│    ┌─────────────────┐    ┌─────────────────┐         │
│    │ Fixed Edges     │    │ Removable Edges │         │
│    │ (entrance/exit) │    │ (internal walls)│         │
│    └─────────────────┘    └─────────────────┘         │
│                                    │                   │
│ 2. Shuffle removable edges  ◄──────┘                   │
│    (for randomization)                                 │
│                                                         │
│ 3. Union-Find Data Structure                           │
│    ┌─────────────────────────────────────────────────┐ │
│    │ parent: Map<CellId, CellId>                     │ │
│    │ rank: Map<CellId, number>                       │ │
│    │                                                 │ │
│    │ find(x): CellId  ◄─── Path compression          │ │
│    │ union(x, y): boolean ◄─── Union by rank         │ │
│    └─────────────────────────────────────────────────┘ │
│                                                         │
│ 4. Build spanning tree                                  │
│    ┌─────────────┐                                     │
│    │ For each    │──┐                                  │
│    │ edge in     │  │  ┌──────────────────────┐        │
│    │ shuffled    │  └─▶│ if find(a) != find(b)│        │
│    │ order       │     │   union(a, b)        │        │
│    └─────────────┘     │   add to result      │        │
│                        └──────────────────────┘        │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
OUTPUT: Edge<CellId>[]
┌─────────────────────────────────────────────────────────┐
│ Exactly (n-1) + boundary edges                         │
│ All nodes connected                                     │
│ No cycles                                              │
│ Random spanning tree (different each run)              │
└─────────────────────────────────────────────────────────┘
```

## 🎨 **Rendering Architecture**

```
CURRENT STATE: Multiple Renderers

┌─────────────────────────────────────────────────────────────┐
│                     INPUT: Maze + Grid                     │
└─────────────┬───────────────────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌─────────┐ ┌──────────┐ ┌─────────────┐
│ ASCII   │ │   SVG    │ │ Universal   │
│Renderer │ │ Renderer │ │ SVG Renderer│
│         │ │          │ │             │
│✅ Works │ │✅ Works  │ │⚠️ Partial   │
│for Rect │ │for Rect  │ │Works        │
│         │ │          │ │             │
│❌ Fails │ │❌ Hardcoded│ │✅ Topology │
│for Hex  │ │Rect logic│ │  Agnostic   │
│(fractional│ │         │ │             │
│coords)   │ │         │ │❌ Missing   │
└─────────┘ └──────────┘ │ Boundary    │
     │            │      │ Walls       │
     │            │      │             │
     ▼            ▼      │❌ Wall Gaps │
┌─────────┐ ┌──────────┐ └─────────────┘
│Terminal │ │Browser   │        │
│Output   │ │SVG       │        ▼
└─────────┘ └──────────┘ ┌─────────────┐
                         │Browser SVG  │
                         │(with issues)│
                         └─────────────┘

RENDERING CHALLENGES:
┌─────────────────────────────────────────────────────────────┐
│ 1. BOUNDARY WALLS                                           │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ Current: Only draws walls between internal cells    │ │
│    │ Needed:  Draw perimeter walls around grid boundary  │ │
│    └─────────────────────────────────────────────────────┘ │
│                                                             │
│ 2. WALL INTERSECTIONS                                      │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ Current: Draws perpendicular segments at midpoints  │ │
│    │ Result:  Gaps between wall segments                 │ │
│    │ Needed:  Walls that connect at proper vertices     │ │
│    └─────────────────────────────────────────────────────┘ │
│                                                             │
│ 3. TOPOLOGY AGNOSTICISM                                    │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ Goal: Same renderer works for any grid type         │ │
│    │ Challenge: Different coordinate systems              │ │
│    │ Solution: Use Grid.position() and Grid.neighbors()  │ │
│    └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🧪 **Testing Architecture**

```
                            TEST STRUCTURE
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   UNIT TESTS    │  │ INTEGRATION     │  │  PROPERTY       │ │
│  │                 │  │ TESTS           │  │  TESTS          │ │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │ │
│  │ │Grid         │ │  │ │Maze         │ │  │ │Spanning     │ │ │
│  │ │components   │ │  │ │generation   │ │  │ │tree         │ │ │
│  │ │• neighbors  │ │  │ │end-to-end   │ │  │ │properties   │ │ │
│  │ │• positions  │ │  │ │             │ │  │ │• n-1 edges  │ │ │
│  │ │• boundaries │ │  │ │ ┌─────────┐ │ │  │ │• connected  │ │ │
│  │ └─────────────┘ │  │ │ │Generate │ │ │  │ │• acyclic    │ │ │
│  │ ┌─────────────┐ │  │ │ │    ▼    │ │ │  │ └─────────────┘ │ │
│  │ │Algorithm    │ │  │ │ │Validate │ │ │  │ ┌─────────────┐ │ │
│  │ │components   │ │  │ │ │    ▼    │ │ │  │ │Maze         │ │ │
│  │ │• spanning   │ │  │ │ │Solve    │ │ │  │ │invariants   │ │ │
│  │ │• solving    │ │  │ │ │    ▼    │ │ │  │ │• solvable   │ │ │
│  │ │• validation │ │  │ │ │Render   │ │ │  │ │• boundaries │ │ │
│  │ └─────────────┘ │  │ └─────────┘ │ │  │ │  preserved  │ │ │
│  └─────────────────┘  └─────────────┘ │  │ └─────────────┘ │ │
│                                       │  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────┐ │                      │
│  │  VISUAL TESTS   │  │  MANUAL     │ │                      │
│  │                 │  │  VERIFICATION│ │                      │
│  │ • ASCII output  │  │             │ │                      │
│  │ • SVG output    │  │ • Browser   │ │                      │
│  │ • Solution      │  │   inspection │ │                      │
│  │   paths visible │  │ • Print     │ │                      │
│  │                 │  │   debug info│ │                      │
│  └─────────────────┘  └─────────────┘ │                      │
└─────────────────────────────────────────────────────────────────┘

TEST RESULTS: 54/54 passing ✅
```

## 🔧 **Key Architectural Decisions**

```
1. REPRESENTATION: "Passages, Not Walls"
   ┌─────────────────────────────────────────────────────────┐
   │ Traditional: Track which walls to remove               │
   │ Our choice:  Track which connections are open          │
   │                                                         │
   │ Benefits:                                               │
   │ • Spanning tree gives exact number of passages         │
   │ • No wall duplication issues                           │
   │ • Solution rendering is trivial                        │
   │ • Invalid states unrepresentable                       │
   └─────────────────────────────────────────────────────────┘

2. COORDINATE SYSTEMS: Internal vs External
   ┌─────────────────────────────────────────────────────────┐
   │ Grid implementations use optimal internal coordinates:  │
   │ • Rectangular: (x,y) integers                          │
   │ • Hexagonal:   (q,r) axial coordinates                 │
   │                                                         │
   │ Only Grid.position() converts to cartesian for render  │
   │ Algorithms never see coordinate details                 │
   └─────────────────────────────────────────────────────────┘

3. PURE FUNCTIONS: No Side Effects
   ┌─────────────────────────────────────────────────────────┐
   │ All algorithms are pure functions:                      │
   │ • generateMaze(grid, random) → maze                     │
   │ • solveMaze(maze) → solution                           │
   │ • validateMaze(maze, grid) → errors                    │
   │                                                         │
   │ Benefits: Testable, composable, predictable            │
   └─────────────────────────────────────────────────────────┘

4. INTERFACE SEGREGATION: Minimal APIs
   ┌─────────────────────────────────────────────────────────┐
   │ Grid interface has only essential methods:              │
   │ • Topology: cells(), neighbors()                       │
   │ • Special points: entrance(), exit()                   │
   │ • Boundaries: boundaryPassages()                       │
   │ • Rendering: position()                                │
   │                                                         │
   │ Each method has single responsibility                   │
   └─────────────────────────────────────────────────────────┘
```
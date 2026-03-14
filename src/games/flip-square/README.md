# Flip Square

A solver for a "lights out" style puzzle on a 3×3 grid.

## The game

Each cell has two states (ON/OFF). Clicking a cell flips it **and its orthogonal neighbours**. The goal is to get every
cell to ON.

This is a well-known family of puzzles — sometimes called "Lights Out" after the 1995 Tiger Electronics toy. The 3×3
variant has a small enough state space (2⁹ = 512 configurations) that brute-force search is perfectly viable.

## How the solver works

The solver uses **breadth-first search** over grid states. Starting from the input configuration, it tries every
possible single-cell flip, tracks visited states (serialised as strings) to avoid revisiting, and returns the first (
i.e. shortest) sequence of moves that reaches the solved state.

Because each cell only ever needs to be flipped zero or one times (flipping twice cancels out), the search space is
bounded and the solver always terminates.

## Coordinate system

(0, 0) is the **bottom-left** corner, with Y increasing upward — matching mathematical convention rather than screen
convention. The flat array stores cells top-to-bottom, so `indexFromCoordinate` / `coordinateFromIndex` handle the
mapping between the two.

## Possible improvements

- **Larger grids** — generalise beyond 3×3. The BFS approach won't scale well; larger grids would benefit from a linear
  algebra approach (solving over GF(2)).
- **More than two states** — cells that cycle through multiple states instead of toggling.
- **Different flip patterns** — diagonal neighbours, knight moves, or other non-orthogonal patterns.
- **Step-by-step playback** — animate the solution sequence rather than just highlighting which cells to click.

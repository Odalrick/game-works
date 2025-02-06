import { describe, expect, it } from "@jest/globals"

import * as game from "./lumberjackGame"

describe("lumberjackGame", () => {
  it("should create a new game", () => {
    const state = game.newGame({
      seed: "42",
      width: 3,
      height: 3,
      trees: 3,
    })

    expect(game.present(state)).toEqual(
      `Score: 0
52.
5..
...`,
    )

    expect(state).toEqual({
      grid: [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "tree", height: 5 },
        { type: "empty" },
        { type: "empty" },
        { type: "tree", height: 5 },
        { type: "tree", height: 2 },
        { type: "empty" },
      ],
      width: 3,
      height: 3,
      score: 0,
    })
  })

  it("should create a new game with correct properties", () => {
    const width = 10
    const height = 10
    const trees = 75
    const state = game.newGame({
      seed: "test",
      width,
      height,
      trees,
    })

    // console.log(game.present(state))

    expect(state.score).toBe(0)
    expect(state.width).toBe(width)
    expect(state.height).toBe(height)
    expect(state.grid.length).toBe(width * height)

    const treeTiles = state.grid.filter((t) => t.type === "tree")
    expect(treeTiles.length).toBe(trees)

    treeTiles.forEach((tile) => {
      const treeTile = tile as game.TreeTile
      expect(treeTile.height).toBeGreaterThanOrEqual(2)
      expect(treeTile.height).toBeLessThanOrEqual(6)
    })

    const nonTreeTiles = state.grid.filter((t) => t.type !== "tree")
    expect(nonTreeTiles.every((t) => t.type === "empty")).toBe(true)
  })

  // The sample state is now defined using a flat grid.
  // Recall: index = x + y * width, with y = 0 at the bottom.
  // For a 3x3 grid, we build the flat grid so that present() prints:
  // top row (y = 2): .5.
  // middle row (y = 1): .5.
  // bottom row (y = 0): ..2
  const sampleState: game.Game = {
    grid: [
      // Row 0 (bottom row, y = 0)
      { type: "empty" },
      { type: "empty" },
      { type: "tree", height: 2 },
      // Row 1 (middle row, y = 1)
      { type: "empty" },
      { type: "tree", height: 5 },
      { type: "empty" },
      // Row 2 (top row, y = 2)
      { type: "empty" },
      { type: "tree", height: 5 },
      { type: "empty" },
    ],
    width: 3,
    height: 3,
    score: 0,
  }

  it("should predict a chop", () => {
    // Plan an action on the tile at [2, 0] (x=2, y=0).
    // In sampleState, index = 2 + 0*3 = 2 contains { type: "tree", height: 2 }
    const action = game.action("W", [2, 0])
    const state = game.planAction(sampleState, action)

    // The grid remains unchanged.
    expect({ ...state, prediction: undefined, plan: undefined }).toEqual(
      sampleState,
    )
    expect(state.plan).toEqual(action)
    expect(state.prediction).toEqual([
      { tile: { type: "empty" }, position: [2, 0] },
      { tile: { type: "log", orientation: "W" }, position: [1, 0] },
      { tile: { type: "log", orientation: "E" }, position: [0, 0] },
    ])
  })

  it("should predict nothing for an empty tile", () => {
    const action = game.action("W", [0, 0])
    const state = game.planAction(sampleState, action)

    expect(state.plan).toEqual(action)
    expect(state.prediction).toBe(undefined)
    expect(state).toEqual({ ...sampleState, plan: action })
  })

  it("should present the game state in a human readable format", () => {
    const presentation = game.present(sampleState)

    // TODO: present logs
    expect(presentation).toEqual(
      `Score: 0
.5.
.5.
..2`,
    )
  })
})

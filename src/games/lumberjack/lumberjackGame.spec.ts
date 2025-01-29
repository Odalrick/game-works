import { describe, expect, it } from "@jest/globals"

import * as game from "./lumberjackGame"

describe("lumberjackGame", () => {
  it("should create a new game", () => {
    const state = game.newGame({
      seed: "test",
      width: 3,
      height: 3,
      trees: 3,
    })

    // console.log(JSON.stringify(state))
    // return
    // Abusing seeded random number generator to make test deterministic
    expect(state).toEqual({
      grid: [
        // < S ---- N >  Array literals are in the wrong orientation for the grid
        [{ type: "empty" }, { type: "tree", height: 5 }, { type: "empty" }], // ^ W
        [{ type: "empty" }, { type: "tree", height: 5 }, { type: "empty" }], // |
        [{ type: "empty" }, { type: "tree", height: 2 }, { type: "empty" }], // v E
      ],
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

    expect(state.grid.length).toBe(width)
    state.grid.forEach((row) => {
      expect(row.length).toBe(height)
    })

    const allTiles = state.grid.flat()
    const treeTiles = allTiles.filter((t) => t.type === "tree")
    expect(treeTiles.length).toBe(trees)

    treeTiles.forEach((tile) => {
      // We know tile.type === "tree" here, so cast or check
      const treeTile = tile as game.TreeTile
      expect(treeTile.height).toBeGreaterThanOrEqual(2)
      expect(treeTile.height).toBeLessThanOrEqual(6)
    })

    const nonTreeTiles = allTiles.filter((t) => t.type !== "tree")
    expect(nonTreeTiles.every((t) => t.type === "empty")).toBe(true)
  })

  const sampleState: game.Game = {
    grid: [
      [{ type: "empty" }, { type: "tree", height: 5 }, { type: "empty" }],
      [{ type: "empty" }, { type: "tree", height: 5 }, { type: "empty" }],
      [{ type: "tree", height: 2 }, { type: "empty" }, { type: "empty" }],
    ],
    score: 0,
  }

  it("should predict a chop", () => {
    const action = game.action("W", [2, 0])
    const state = game.planAction(sampleState, action)

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

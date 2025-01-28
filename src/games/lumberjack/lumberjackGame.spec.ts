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
        [{ type: "empty" }, { type: "tree", height: 4 }, { type: "empty" }],
        [{ type: "empty" }, { type: "tree", height: 5 }, { type: "empty" }],
        [{ type: "empty" }, { type: "tree", height: 5 }, { type: "empty" }],
      ],
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
      expect(treeTile.height).toBeGreaterThanOrEqual(1)
      expect(treeTile.height).toBeLessThanOrEqual(6)
    })

    const nonTreeTiles = allTiles.filter((t) => t.type !== "tree")
    expect(nonTreeTiles.every((t) => t.type === "empty")).toBe(true)
  })
})

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
    const action = game.action("W", [2, 0])
    const state = game.planAction(sampleState, action)

    // The grid remains unchanged.
    expect({ ...state, prediction: undefined, plan: undefined }).toEqual(
      sampleState,
    )
    expect(state.plan).toEqual(action)
    expect(state.prediction?.tiles).toEqual([
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

    expect(presentation).toEqual(
      `Score: 0
.5.
.5.
..2`,
    )
  })
  describe("chopping trees", () => {
    it("should chop a tree", () => {
      const action = game.action("W", [2, 0])
      const newState = game.executeAction(sampleState, action)

      expect(game.present(newState)).toEqual(
        `Score: 2
.5.
.5.
<>.`,
      )

      expect(newState.score).toBe(2)
    })

    it("should predict a blocked chop, but set error", () => {
      const action = game.action("N", [1, 1])
      const state = game.planAction(sampleState, action)

      expect(state.plan).toEqual(action)
      expect(state.prediction?.tiles).toEqual([
        { tile: { type: "empty" }, position: [1, 1] },
        { tile: { type: "log", orientation: "N" }, position: [1, 2] },
        {
          position: [1, 3],
          tile: {
            orientation: "NS",
            type: "log",
          },
        },
        {
          position: [1, 4],
          tile: {
            orientation: "NS",
            type: "log",
          },
        },
        {
          position: [1, 5],
          tile: {
            orientation: "NS",
            type: "log",
          },
        },
        {
          position: [1, 6],
          tile: {
            orientation: "S",
            type: "log",
          },
        },
      ])
      expect(state.prediction?.valid).toBe("invalid")
    })

    it("should not chop a blocked tree", () => {
      const action = game.action("N", [1, 1])
      const newState = game.executeAction(sampleState, action)

      expect(game.present(newState)).toEqual(
        `Score: 0
.5.
.5.
..2`,
      )
    })

    it("should allow chopping trees to out of bounds", () => {
      const action = game.action("W", [1, 1])
      const newState = game.executeAction(sampleState, action)

      expect(game.present(newState)).toEqual(
        `Score: 1
.5.
>..
..2`,
      )
    })
    it("should fell in sequence", () => {
      const finalState = [
        game.action("W", [2, 0]),
        game.action("E", [1, 1]),
        game.action("S", [1, 2]),
      ].reduce(game.executeAction, sampleState)

      expect(game.present(finalState)).toEqual(
        `Score: 4
...
.^<
<|.`,
      )
    })
  })

  describe("rolling logs", () => {
    const rollingBaseSampleState: game.Game = game.newGame({
      seed: "rolling!",
      width: 6,
      height: 6,
      trees: 6,
    })

    const rollingSampleState: game.Game = [game.action("S", [2, 5])].reduce(
      game.executeAction,
      rollingBaseSampleState,
    )

    it("should present the base state in a human readable format", () => {
      const presentation = game.present(rollingBaseSampleState)

      expect(presentation).toEqual(
        `Score: 0
2.3...
5...2.
45....
......
......
......`,
      )
    })
    it("should present the example state in a human readable format", () => {
      const presentation = game.present(rollingSampleState)

      expect(presentation).toEqual(
        `Score: 6
2.....
5.^.2.
45|...
..v...
......
......`,
      )
    })

    // TODO: add prediction for rolling logs
  })

  describe("large sample state", () => {
    const largeSampleState: game.Game = game.newGame({
      seed: "large!!!",
      width: 10,
      height: 10,
      trees: 25,
    })
    it("should present the game state in a human readable format", () => {
      const presentation = game.present(largeSampleState)

      expect(presentation).toEqual(
        `Score: 0
........6.
32......63
.......253
..5.32....
........3.
3....4.25.
5.........
...2.....3
.5..4.35..
.2.......5`,
      )
    })
    it("should double points for long logs", () => {
      const finalState = [game.action("W", [8, 9])].reduce(
        game.executeAction,
        largeSampleState,
      )

      expect(game.present(finalState)).toEqual(
        `Score: 12
..<---->..
32......63
.......253
..5.32....
........3.
3....4.25.
5.........
...2.....3
.5..4.35..
.2.......5`,
      )
    })

    it("should fell in sequence", () => {
      const finalState = [
        game.action("W", [8, 9]),
        game.action("W", [8, 8]),
        game.action("N", [8, 7]),
      ].reduce(game.executeAction, largeSampleState)

      expect(game.present(finalState)).toEqual(
        `Score: 26
..<---->|.
32<---->v3
.......2.3
..5.32....
........3.
3....4.25.
5.........
...2.....3
.5..4.35..
.2.......5`,
      )
    })
  })
})

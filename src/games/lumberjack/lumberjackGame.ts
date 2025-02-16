import * as R from "ramda"
import prand, { RandomGenerator } from "pure-rand"

// Types
export interface TreeTile {
  type: "tree"
  height: number
}

export interface EmptyTile {
  type: "empty"
}

export type LogOrientation = "N" | "S" | "E" | "W" | "NS" | "EW"
export interface LogTile {
  type: "log"
  orientation: LogOrientation
}

export type Tile = EmptyTile | TreeTile | LogTile

export type Direction = "N" | "S" | "E" | "W"
export type Position = [number, number]
export interface Action {
  type: "action"
  direction: Direction
  position: Position
}

export function action(direction: Direction, position: Position): Action {
  return { type: "action", direction, position }
}

export interface PredictedTile {
  tile: Tile
  position: Position
}

export type Game = {
  grid: Tile[] // one-dimensional array
  width: number
  height: number
  plan?: Action
  prediction?: PredictedTile[]
  score: number
}

export type Init = {
  seed: string
  width: number
  height: number
  trees: number
}

// Game functions
// These functions are the core of the game logic

export const emptyTile: EmptyTile = { type: "empty" }

// Might expose configuration in the future, but for now it's just here for easy tweaking.
const config = {
  tree: {
    height: {
      min: 2,
      max: 6,
    },
  },
  log: {
    doublePoints: 3,
  },
}

export function newGame(init: Init): Game {
  const { width, height, trees } = init
  const seed = stringToSeed(init.seed)
  const randomGenerator: RandomGenerator = prand.xoroshiro128plus(seed)

  // Create a one-dimensional grid of size width * height
  const grid: Tile[] = R.times(() => emptyTile, width * height)

  // Choose a set of distinct cell indices in the grid
  chooseCount(randomGenerator, trees, R.range(0, width * height)).forEach(
    (i) => {
      const x = i % width
      const y = Math.floor(i / width)
      const tallness = prand.unsafeUniformIntDistribution(
        config.tree.height.min,
        config.tree.height.max,
        randomGenerator,
      )
      const index = x + y * width
      grid[index] = { type: "tree", height: tallness }
    },
  )

  return calculateScore({ grid, width, height, score: 0 })
}

export function planAction(state: Game, action: Action): Game {
  // Note: getTile now needs the grid, the target position, and the grid width.
  const targetTile = getTile(state.width, state.grid, action.position)
  switch (targetTile.type) {
    case "empty":
      return { ...state, plan: action }
    case "tree":
      return {
        ...state,
        plan: action,
        prediction: chopTree(targetTile, action),
      }
    case "log":
      console.log("log")
      // TODO: Implement log handling
      return { ...state, plan: action }
  }
}
export function executeAction(state: Game, action: Action): Game {
  const targetTile = getTile(state.width, state.grid, action.position)
  switch (targetTile.type) {
    case "empty":
      return state
    case "tree": {
      const prediction = chopTree(targetTile, action)
      const newGrid = [...state.grid]
      prediction.forEach(({ tile, position }) => {
        newGrid[indexFromPosition(state.width, position)] = tile
      })
      return calculateScore({
        ...state,
        grid: newGrid,
        prediction: undefined,
        plan: undefined,
      })
    }
    case "log":
      // TODO: Implement log handling
      return state
  }
}

function calculateScore(game: Game): Game {
  let toVisit: number[] = R.range(0, game.grid.length)
  let score = 0
  while (toVisit.length > 0) {
    const index: number = toVisit.pop()!
    const logIndices: number[] = findLog(game, index)
    score += logIndices.length
    toVisit = R.without(logIndices, toVisit)
  }
  return { ...game, score }
}

function findLog(game: Game, index: number): number[] {
  const logTile = game.grid[index]
  if (logTile.type !== "log") {
    return []
  }
  const log: number[] = [index]
  const searchDirection = (
    validOrientations: LogOrientation[],
    dx: number,
    dy: number,
  ): void => {
    let [x, y] = positionFromIndex(game.width, index)
    // The first tile is already added.
    x += dx
    y += dy
    while (x >= 0 && x < game.width && y >= 0 && y < game.height) {
      const newIndex = indexFromPosition(game.width, [x, y])
      if (game.grid[newIndex].type === "log") {
        const newLogTile = game.grid[newIndex] as LogTile
        if (validOrientations.includes(newLogTile.orientation)) {
          log.push(newIndex)
        } else {
          return
        }
      } else {
        return
      }
      x += dx
      y += dy
    }
  }

  switch (logTile.orientation) {
    case "N":
      searchDirection(
        ["NS", "S"],
        offsetXFromDirection("N"),
        offsetYFromDirection("N"),
      )
      break
    case "S":
      searchDirection(
        ["NS", "N"],
        offsetXFromDirection("S"),
        offsetYFromDirection("S"),
      )
      break
    case "E":
      searchDirection(
        ["EW", "W"],
        offsetXFromDirection("E"),
        offsetYFromDirection("E"),
      )
      break
    case "W":
      searchDirection(
        ["EW", "E"],
        offsetXFromDirection("W"),
        offsetYFromDirection("W"),
      )
      break
    case "NS":
      searchDirection(
        ["NS", "S"],
        offsetXFromDirection("N"),
        offsetYFromDirection("N"),
      )

      searchDirection(
        ["NS", "N"],
        offsetXFromDirection("S"),
        offsetYFromDirection("S"),
      )
      break
    case "EW":
      searchDirection(
        ["EW", "W"],
        offsetXFromDirection("E"),
        offsetYFromDirection("E"),
      )
      searchDirection(
        ["EW", "E"],
        offsetXFromDirection("W"),
        offsetYFromDirection("W"),
      )
      break
  }
  return log
}

// Info functions
// not directly related to the game, but might be useful in a way that the internal helper functions are not

export function present(game: Game): string {
  const { grid, width, height, score } = game
  const rows: string[] = []
  // Since north is positive y, print from top row (y = height - 1) down to 0.
  for (let y = height - 1; y >= 0; y--) {
    let row = ""
    for (let x = 0; x < width; x++) {
      const index = x + y * width
      row += presentTile(grid[index])
    }
    rows.push(row)
  }
  return `Score: ${score}\n${rows.join("\n")}`
}

function presentTile(tile: Tile): string {
  switch (tile.type) {
    case "empty":
      return "."
    case "tree":
      return tile.height.toString()
    case "log":
      switch (tile.orientation) {
        case "N":
          return "v"
        case "S":
          return "^"
        case "E":
          return "<"
        case "W":
          return ">"
        case "NS":
          return "|"
        case "EW":
          return "-"
      }
  }
}

export function offsetXFromDirection(direction: Direction): number {
  switch (direction) {
    case "E":
      return 1
    case "W":
      return -1
    default:
      return 0
  }
}

export function offsetYFromDirection(direction: Direction): number {
  switch (direction) {
    case "N":
      return 1
    case "S":
      return -1
    default:
      return 0
  }
}

export function positionFromDirection(
  direction: Direction,
  position: Position,
): Position {
  const [x, y] = position
  return [
    x + offsetXFromDirection(direction),
    y + offsetYFromDirection(direction),
  ]
}

export const indexFromPosition = R.curry(
  (width: number, coordinate: Position): number => {
    const [x, y] = coordinate
    return x + y * width
  },
)

export const positionFromIndex = R.curry(
  (width: number, index: number): Position => {
    const x = index % width
    const y = Math.floor(index / width)
    return [x, y]
  },
)

export const getTile = R.curry(
  (width: number, grid: Tile[], position: Position): Tile =>
    grid[indexFromPosition(width, position)],
)

// Helper functions

type LogOrientations = [LogOrientation, LogOrientation, LogOrientation]

const logOrientationsFromDirection: {
  N: LogOrientations
  S: LogOrientations
  E: LogOrientations
  W: LogOrientations
} = {
  N: ["N", "NS", "S"],
  S: ["S", "NS", "N"],
  E: ["E", "EW", "W"],
  W: ["W", "EW", "E"],
}

function chopTree(
  tree: TreeTile,
  { position, direction }: Action,
): PredictedTile[] {
  const log: PredictedTile[] = []
  const xOffset = offsetXFromDirection(direction)
  const yOffset = offsetYFromDirection(direction)
  const [x, y] = position
  const [startOrientation, innerOrientation, endOrientation] =
    logOrientationsFromDirection[direction]
  for (let i = 0; i < tree.height; i++) {
    const distance = i + 1
    const pos: Position = [x + distance * xOffset, y + distance * yOffset]
    const orientation =
      i === 0
        ? startOrientation
        : i === tree.height - 1
          ? endOrientation
          : innerOrientation
    log.push({
      tile: { type: "log", orientation },
      position: pos,
    })
  }
  // The first predicted tile represents the chopped (empty) tree base.
  return [{ tile: emptyTile, position }, ...log]
}

// Random number functions

/**
 * Convert a string into a 32-bit integer seed.
 * This example uses a simple sdbm-like hash.
 */
function stringToSeed(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    h = (h << 5) - h + chr
    h |= 0 // Convert to 32-bit integer
  }
  return h
}

function chooseCount<T>(rng: RandomGenerator, count: number, arr: T[]): T[] {
  const copy = arr.slice()

  // Fisher–Yates shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    // Pick a random j in [0..i]
    const j = prand.unsafeUniformIntDistribution(0, i, rng)
    // Swap elements at positions i and j
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  // Take the first `count` elements
  return copy.slice(0, count)
}

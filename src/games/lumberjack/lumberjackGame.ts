import * as R from "ramda"
import prand, { RandomGenerator } from "pure-rand"

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

export type Game = {
  grid: Tile[][]
}

export type Init = {
  seed: string
  width: number
  height: number
  trees: number
}

export const emptyTile: EmptyTile = { type: "empty" }

export function newGame(init: Init): Game {
  const { width, height, trees } = init
  const seed = stringToSeed(init.seed)
  const randomGenerator: RandomGenerator = prand.xoroshiro128plus(seed)

  const grid: Tile[][] = R.times(() => R.times(() => emptyTile, height), width)
  chooseCount(randomGenerator, trees, R.range(0, width * height)).forEach(
    (i) => {
      const x = i % width
      const y = Math.floor(i / width)
      const tallness = prand.unsafeUniformIntDistribution(1, 6, randomGenerator)
      grid[x][y] = { type: "tree", height: tallness }
    },
  )

  return { grid }
}

/**
 * Convert a string into a 32-bit integer seed.
 * This example uses a simple sdbm-like hash,
 * though many approaches would work.
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
    // pick a random j in [0..i]
    const j = prand.unsafeUniformIntDistribution(0, i, rng)

    // swap elements at positions i and j
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  // Take the first `count` elements
  return copy.slice(0, count)
}

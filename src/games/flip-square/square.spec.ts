import { describe, expect, it } from "@jest/globals"
import * as R from "ramda"

import {
  indexFromCoordinate,
  coordinateFromIndex,
  presentCoordinates,
  flipNeighbors,
  solvedGrid,
  solve,
  createSquare,
  shouldFlip,
} from "./square"
import type { Coordinate } from "./square"

describe("grid functions", () => {
  it("should generate the correct order of indices", () => {
    // The y coordinate goes _up_, but is reversed in the array.
    expect(
      R.map(indexFromCoordinate, [
        [0, 0],
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [0, 2],
        [1, 2],
        [2, 2],
      ]),
    ).toEqual([6, 7, 8, 3, 4, 5, 0, 1, 2])
  })

  it("should generate the correct order of coordinates", () => {
    expect(R.map(coordinateFromIndex, [6, 7, 8, 3, 4, 5, 0, 1, 2])).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ])
  })

  const flipTests = [
    [1, 3, 4],
    [0, 2, 3, 4, 5],
    [1, 4, 5],
    [0, 1, 4, 6, 7],
    [0, 1, 2, 3, 5, 6, 7, 8],
    [1, 2, 4, 7, 8],
    [3, 4, 7],
  ]

  for (const indexFlips of flipTests) {
    const flips: Coordinate[] = R.map(coordinateFromIndex, indexFlips)
    const scrambled = R.reduce(
      (acc, elem) => flipNeighbors(elem, acc),
      solvedGrid,
      flips,
    )
    it(`should solve grid ${presentCoordinates(flips)}`, () => {
      const solution = solve(scrambled)
      indexFlips.forEach((doFlip) => {
        expect(solution).toContain(doFlip)
      })
      expect(solution).toHaveLength(flips.length)
    })
    it(`should expose a solved cell method for ${presentCoordinates(
      flips,
    )}`, () => {
      const square = createSquare(scrambled)

      indexFlips.forEach((doFlip) => {
        expect(
          shouldFlip(square, ...coordinateFromIndex(doFlip)),
        ).toBeTruthy()
      })
    })
  }
})

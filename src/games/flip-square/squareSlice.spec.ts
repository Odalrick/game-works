import { describe, expect, it } from "@jest/globals"

import reducer, {
  CellState,
  setGrid,
  flip,
  indexFromCoordinate,
  coordinateFromIndex,
  xoParser,
} from "./squareSlice"
import * as R from "ramda"

const g = R.pipe(
  R.filter(R.includes(R.__, ["x", "o"])),
  R.splitEvery(3),
  R.map(R.join("")),
  R.join("\n"),
)
describe("game reducer", () => {
  it("should start in fulfilled state", () => {
    const squareState = reducer(undefined, { type: "unknown" })
    expect(squareState.getCell(0, 0)).toEqual(CellState.ON)
    expect(squareState.getCell(1, 0)).toEqual(CellState.ON)
    expect(squareState.getCell(2, 0)).toEqual(CellState.ON)
    expect(squareState.getCell(0, 1)).toEqual(CellState.ON)
    expect(squareState.getCell(1, 1)).toEqual(CellState.ON)
    expect(squareState.getCell(2, 1)).toEqual(CellState.ON)
    expect(squareState.getCell(0, 2)).toEqual(CellState.ON)
    expect(squareState.getCell(1, 2)).toEqual(CellState.ON)
    expect(squareState.getCell(2, 2)).toEqual(CellState.ON)
  })

  it("should convert to string", () => {
    const squareState = reducer(undefined, { type: "unknown" })
    expect(squareState.toString()).toEqual(
      g(`
      xxx
      xxx
      xxx`),
    )
  })

  it("should set state", () => {
    const squareState = reducer(
      undefined,
      setGrid(
        xoParser(
          `
              xox
              ooo
              xxx`,
        ),
      ),
    )

    expect(squareState.toString()).toEqual(
      g(`
      xox
      ooo
      xxx`),
    )
  })

  const boards: { input: string; expected: string; flip: [number, number] }[] =
    [
      {
        flip: [0, 0],
        input: `
            xox
            ooo
            xxx`,
        expected: `
            xox
            xoo
            oox`,
      },
      {
        flip: [1, 1],
        input: `
            xox
            ooo
            xxx`,
        expected: `
            xxx
            xxx
            xox`,
      },
      {
        flip: [2, 2],
        input: `
            ooo
            ooo
            ooo`,
        expected: `
            oxx
            oox
            ooo`,
      },
    ]

  boards.forEach((board) => {
    it("should flip", () => {
      const squareState = reducer(
        reducer(undefined, setGrid(xoParser(board.input))),
        flip(board.flip),
      )

      expect(squareState.toString()).toEqual(g(board.expected))
    })
  })
})

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
})

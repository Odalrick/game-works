import { describe, expect, it } from "@jest/globals"

import reducer, { CellState, parseString, setGrid } from "./squareSlice"
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
        parseString(
          "x",
          "o",
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
})

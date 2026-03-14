import { describe, expect, it } from "@jest/globals"
import * as R from "ramda"

import reducer, { actions } from "./squareSlice"
import { CellState, getCell, gridAsString, xoParser } from "./square"

const { setGrid, flip } = actions
const g = R.pipe(
  R.filter(R.includes(R.__, ["x", "o"])),
  R.splitEvery(3),
  R.map(R.join("")),
  R.join("\n"),
)

describe("game reducer", () => {
  it("should start in fulfilled state", () => {
    const state = reducer(undefined, { type: "unknown" })
    expect(getCell(state.grid, 0, 0)).toEqual(CellState.ON)
    expect(getCell(state.grid, 1, 0)).toEqual(CellState.ON)
    expect(getCell(state.grid, 2, 0)).toEqual(CellState.ON)
    expect(getCell(state.grid, 0, 1)).toEqual(CellState.ON)
    expect(getCell(state.grid, 1, 1)).toEqual(CellState.ON)
    expect(getCell(state.grid, 2, 1)).toEqual(CellState.ON)
    expect(getCell(state.grid, 0, 2)).toEqual(CellState.ON)
    expect(getCell(state.grid, 1, 2)).toEqual(CellState.ON)
    expect(getCell(state.grid, 2, 2)).toEqual(CellState.ON)
  })

  it("should convert to string", () => {
    const state = reducer(undefined, { type: "unknown" })
    expect(gridAsString(state.grid)).toEqual(
      g(`
      xxx
      xxx
      xxx`),
    )
  })

  it("should set state", () => {
    const state = reducer(
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

    expect(gridAsString(state.grid)).toEqual(
      g(`
      xox
      ooo
      xxx`),
    )
  })

  it("should read correct coordinates", () => {
    // The y coordinate goes _up_.
    const state = reducer(
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

    expect(getCell(state.grid, 0, 0)).toEqual(CellState.ON)
    expect(getCell(state.grid, 1, 0)).toEqual(CellState.ON)
    expect(getCell(state.grid, 2, 0)).toEqual(CellState.ON)
    expect(getCell(state.grid, 0, 1)).toEqual(CellState.OFF)
    expect(getCell(state.grid, 1, 1)).toEqual(CellState.OFF)
    expect(getCell(state.grid, 2, 1)).toEqual(CellState.OFF)
    expect(getCell(state.grid, 0, 2)).toEqual(CellState.ON)
    expect(getCell(state.grid, 1, 2)).toEqual(CellState.OFF)
    expect(getCell(state.grid, 2, 2)).toEqual(CellState.ON)
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
      const state = reducer(
        reducer(undefined, setGrid(xoParser(board.input))),
        flip(board.flip),
      )

      expect(gridAsString(state.grid)).toEqual(g(board.expected))
    })
  })

  it("should mark a single square", () => {
    const state = reducer(
      reducer(
        undefined,
        setGrid(
          xoParser(`
          xox
          ooo
          xxx`),
        ),
      ),
      actions.toggle([1, 1]),
    )

    expect(gridAsString(state.grid)).toEqual(
      g(`
          xox
          oxo
          xxx`),
    )
  })
})

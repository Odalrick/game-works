import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import * as R from "ramda"

export enum CellState {
  ON = "ON",
  OFF = "OFF",
}

type Grid = CellState[]

type SquareState = {
  grid: Grid
}

function getCell(grid: Grid, x: number, y: number): CellState {
  return grid[x + y * 3]
}

function asString(grid: Grid): string {
  return R.pipe(
    R.map((cell: CellState) => (cell === CellState.ON ? "x" : "o")),
    R.splitEvery(3),
    R.map(R.join("")),
    R.join("\n"),
  )(grid)
}
export const parseString = (on: string, off: string, str: string): Grid => {
  return R.pipe(
    R.filter(R.includes(R.__, [on, off])),
    R.map((cell: string) => (cell === on ? CellState.ON : CellState.OFF)),
  )(str)
}

export const xoParser = (str: string): Grid => {
  return parseString("x", "o", str)
}

class Square {
  state: SquareState
  constructor(public grid: Grid) {
    this.state = { grid }
  }

  getCell(x: number, y: number): CellState {
    return getCell(this.state.grid, x, y)
  }

  toString(): string {
    return asString(this.state.grid)
  }
}

const initialState: Square = new Square([
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
])

export const squareSlice = createSlice({
  name: "square",
  initialState,
  reducers: {
    setGrid: (_state: Square, action: PayloadAction<Grid>) => {
      return new Square(action.payload)
    },
  },
})

export const { setGrid } = squareSlice.actions
export default squareSlice.reducer

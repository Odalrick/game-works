import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import * as R from "ramda"

export enum CellState {
  ON = "ON",
  OFF = "OFF",
}

export type Grid = CellState[]

type SquareState = {
  grid: Grid
}
export type Coordinate = [number, number]

export const solvedGrid = [
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
  CellState.ON,
]

export function indexFromCoordinate(c: Coordinate): number {
  const [x, y] = c
  return x + y * -3 + 6
}

export function coordinateFromIndex(i: number): Coordinate {
  const x = i % 3
  const y = Math.abs(Math.floor((i - 6) / 3) * -1)
  return [x, y]
}

function getCell(grid: Grid, x: number, y: number): CellState {
  return grid[indexFromCoordinate([x, y])]
}

export const presentCoordinate = (c: Coordinate): string => `(${c[0]}, ${c[1]})`
export const presentCoordinates = R.pipe(R.map(presentCoordinate), R.join(", "))

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

function flips(flips: Coordinate[], grid: Grid): Grid {
  const indices = R.map(indexFromCoordinate, flips)
  const mapIndexed = R.addIndex(R.map) as (
    fn: (cell: CellState, idx: number) => CellState,
    list: CellState[],
  ) => CellState[]

  return mapIndexed((cell: CellState, i: number) => {
    if (R.includes(i, indices)) {
      return cell === CellState.ON ? CellState.OFF : CellState.ON
    }
    return cell
  }, grid)
}

export function neighbors(c: Coordinate): Coordinate[] {
  const [x, y] = c
  return [
    [x, y],
    [x, y - 1],
    [x, y + 1],
    [x - 1, y],
    [x + 1, y],
  ]
}

const validCoordinate = (c: Coordinate): boolean => {
  const [x, y] = c
  return x >= 0 && x < 3 && y >= 0 && y < 3
}

const filterValidCoordinates = R.filter(validCoordinate)

export function toggleCell(c: Coordinate, grid: Grid): Grid {
  const [x, y] = c
  const cell = getCell(grid, x, y)
  return R.update(
    indexFromCoordinate(c),
    cell === CellState.ON ? CellState.OFF : CellState.ON,
    grid,
  )
}
export function flipNeighbors(c: Coordinate, grid: Grid): Grid {
  return flips(filterValidCoordinates(neighbors(c)), grid)
}

export function solve(grid: Grid): number[] | undefined {
  type GridState = {
    grid: Grid
    flips: number[]
  }

  const queue: GridState[] = [{ grid, flips: [] }]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const { grid: currentGrid, flips: currentFlips } = queue.shift()!
    if (isSolved(currentGrid)) {
      return currentFlips
    }

    for (const i of R.range(0, 9)) {
      if (!currentFlips.includes(i)) {
        const newGrid = flipNeighbors(coordinateFromIndex(i), currentGrid)
        const newGridString = asString(newGrid)
        if (!visited.has(newGridString)) {
          visited.add(newGridString)
          queue.push({ grid: newGrid, flips: [...currentFlips, i] })
        }
      }
    }
  }

  return undefined // If no solution is found
}

const isSolved = R.equals(solvedGrid)

export class Square {
  state: SquareState
  solution?: number[]

  constructor(public grid: Grid) {
    this.state = { grid }
    this.solution = solve(this.state.grid) ?? []
  }

  getCell(x: number, y: number): CellState {
    return getCell(this.state.grid, x, y)
  }

  toString(): string {
    return asString(this.state.grid)
  }

  shouldFlip(x: number, y: number): boolean {
    if (this.solution === undefined) {
      return false
    }
    return this.solution.includes(indexFromCoordinate([x, y]))
  }
}

export const initialState: Square = new Square(solvedGrid)

export const squareSlice = createSlice({
  name: "square",
  initialState,
  reducers: {
    setGrid: (_state: Square, action: PayloadAction<Grid>) => {
      return new Square(action.payload)
    },
    flip: (state: Square, action: PayloadAction<[number, number]>) => {
      return new Square(flipNeighbors(action.payload, state.state.grid))
    },
    toggle: (state: Square, action: PayloadAction<[number, number]>) => {
      return new Square(toggleCell(action.payload, state.state.grid))
    },
  },
})

export const actions = squareSlice.actions
export default squareSlice.reducer

export type Action = ReturnType<(typeof actions)[keyof typeof actions]>

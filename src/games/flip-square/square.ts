import * as R from "ramda"

export enum CellState {
  ON = "ON",
  OFF = "OFF",
}

export type Grid = CellState[]

export type Coordinate = [number, number]

export type Square = {
  grid: Grid
  solution: number[]
}

export const solvedGrid: Grid = [
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

export function getCell(grid: Grid, x: number, y: number): CellState {
  return grid[indexFromCoordinate([x, y])]
}

export const presentCoordinate = (c: Coordinate): string => `(${c[0]}, ${c[1]})`
export const presentCoordinates = R.pipe(R.map(presentCoordinate), R.join(", "))

export function gridAsString(grid: Grid): string {
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

function applyFlips(coordinates: Coordinate[], grid: Grid): Grid {
  const indices = R.map(indexFromCoordinate, coordinates)
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
  return applyFlips(filterValidCoordinates(neighbors(c)), grid)
}

const isSolved = R.equals(solvedGrid)

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
        const newGridString = gridAsString(newGrid)
        if (!visited.has(newGridString)) {
          visited.add(newGridString)
          queue.push({ grid: newGrid, flips: [...currentFlips, i] })
        }
      }
    }
  }

  return undefined
}

export function createSquare(grid: Grid): Square {
  return {
    grid,
    solution: solve(grid) ?? [],
  }
}

export function shouldFlip(square: Square, x: number, y: number): boolean {
  return square.solution.includes(indexFromCoordinate([x, y]))
}

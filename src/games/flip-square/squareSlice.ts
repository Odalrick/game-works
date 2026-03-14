import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
  type Square,
  type Grid,
  createSquare,
  flipNeighbors,
  toggleCell,
  solvedGrid,
} from "./square"

export type { Square }

const initialState: Square = createSquare(solvedGrid)

export const squareSlice = createSlice({
  name: "square",
  initialState,
  reducers: {
    setGrid: (_state: Square, action: PayloadAction<Grid>) => {
      return createSquare(action.payload)
    },
    flip: (state: Square, action: PayloadAction<[number, number]>) => {
      return createSquare(flipNeighbors(action.payload, state.grid))
    },
    toggle: (state: Square, action: PayloadAction<[number, number]>) => {
      return createSquare(toggleCell(action.payload, state.grid))
    },
    reset: () => {
      return createSquare(solvedGrid)
    },
  },
})

export const actions = squareSlice.actions
export default squareSlice.reducer

export type Action = ReturnType<(typeof actions)[keyof typeof actions]>

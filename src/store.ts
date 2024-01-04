import { configureStore } from "@reduxjs/toolkit"
import squareSlice from "@games/flip-square/squareSlice"

const store = configureStore({
  reducer: {
    square: squareSlice,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

export default store

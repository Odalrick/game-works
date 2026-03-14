import { configureStore } from "@reduxjs/toolkit"
import squareSlice from "@games/flip-square/squareSlice"
import wordleSlice from "@games/wordle-assistant/wordleSlice"

const store = configureStore({
  reducer: {
    square: squareSlice,
    wordle: wordleSlice,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

export default store

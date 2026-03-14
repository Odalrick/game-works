import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { TileState, type GuessRecord, type QuestRule } from "./types"

export type WordleState = {
  guesses: GuessRecord[]
  questRule: QuestRule
  previouslyCorrect: string[]
}

const initialState: WordleState = {
  guesses: [],
  questRule: { type: "none" },
  previouslyCorrect: [],
}

const cycleOrder: Record<TileState, TileState> = {
  [TileState.WHITE]: TileState.YELLOW,
  [TileState.YELLOW]: TileState.GREEN,
  [TileState.GREEN]: TileState.WHITE,
}

const wordleSlice = createSlice({
  name: "wordle",
  initialState,
  reducers: {
    addGuess(state, action: PayloadAction<GuessRecord>) {
      state.guesses.push(action.payload)
    },
    updateFeedback(
      state,
      action: PayloadAction<{ index: number; position: number }>,
    ) {
      const { index, position } = action.payload
      const current = state.guesses[index].feedback[position]
      state.guesses[index].feedback[position] = cycleOrder[current]
    },
    setQuestRule(state, action: PayloadAction<QuestRule>) {
      state.questRule = action.payload
    },
    markCorrect(state, action: PayloadAction<string>) {
      if (!state.previouslyCorrect.includes(action.payload)) {
        state.previouslyCorrect.push(action.payload)
      }
    },
    reset(state) {
      state.guesses = []
      state.questRule = { type: "none" }
    },
  },
})

export const { actions } = wordleSlice
export type Action = ReturnType<(typeof actions)[keyof typeof actions]>
export default wordleSlice.reducer

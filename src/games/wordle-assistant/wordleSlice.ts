import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { TileState, type GuessRecord, type QuestRule } from "./types"

const STORAGE_KEY = "wordle:previouslyCorrect"

function loadPreviouslyCorrect(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function savePreviouslyCorrect(words: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
  } catch {
    // localStorage unavailable (e.g. in tests)
  }
}

export type WordleState = {
  guesses: GuessRecord[]
  questRule: QuestRule
  previouslyCorrect: string[]
}

const initialState: WordleState = {
  guesses: [],
  questRule: { type: "none" },
  previouslyCorrect: loadPreviouslyCorrect(),
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
      const stored = loadPreviouslyCorrect()
      const merged = [
        ...new Set([...stored, ...state.previouslyCorrect, action.payload]),
      ]
      state.previouslyCorrect = merged
      savePreviouslyCorrect(merged)
    },
    setPreviouslyCorrect(state, action: PayloadAction<string[]>) {
      state.previouslyCorrect = action.payload
      savePreviouslyCorrect(action.payload)
    },
    reset(state) {
      state.guesses = []
      state.questRule = { type: "none" }
      state.previouslyCorrect = loadPreviouslyCorrect()
    },
  },
})

export { STORAGE_KEY }
export const { actions } = wordleSlice
export type Action = ReturnType<(typeof actions)[keyof typeof actions]>
export default wordleSlice.reducer

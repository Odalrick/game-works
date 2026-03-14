import { describe, expect, it } from "@jest/globals"

import reducer, { actions } from "./wordleSlice"
import { TileState, type GuessRecord } from "./types"

const { addGuess, updateFeedback, setQuestRule, markCorrect, reset } = actions

const makeGuess = (word: string): GuessRecord => ({
  word,
  feedback: [
    TileState.WHITE,
    TileState.WHITE,
    TileState.WHITE,
    TileState.WHITE,
    TileState.WHITE,
  ],
})

describe("wordle slice", () => {
  it("should have correct initial state", () => {
    const state = reducer(undefined, { type: "unknown" })
    expect(state.guesses).toEqual([])
    expect(state.questRule).toEqual({ type: "none" })
    expect(state.previouslyCorrect).toEqual([])
  })

  describe("addGuess", () => {
    it("should push a guess to the array", () => {
      const guess = makeGuess("crane")
      const state = reducer(undefined, addGuess(guess))
      expect(state.guesses).toEqual([guess])
    })

    it("should append multiple guesses in order", () => {
      const first = makeGuess("crane")
      const second = makeGuess("slate")
      const state = reducer(
        reducer(undefined, addGuess(first)),
        addGuess(second),
      )
      expect(state.guesses).toHaveLength(2)
      expect(state.guesses[0].word).toBe("crane")
      expect(state.guesses[1].word).toBe("slate")
    })
  })

  describe("updateFeedback", () => {
    it("should cycle white to yellow", () => {
      const guess = makeGuess("crane")
      const state = reducer(
        reducer(undefined, addGuess(guess)),
        updateFeedback({ index: 0, position: 2 }),
      )
      expect(state.guesses[0].feedback[2]).toBe(TileState.YELLOW)
    })

    it("should cycle yellow to green", () => {
      const guess: GuessRecord = {
        word: "crane",
        feedback: [
          TileState.WHITE,
          TileState.WHITE,
          TileState.YELLOW,
          TileState.WHITE,
          TileState.WHITE,
        ],
      }
      const state = reducer(
        reducer(undefined, addGuess(guess)),
        updateFeedback({ index: 0, position: 2 }),
      )
      expect(state.guesses[0].feedback[2]).toBe(TileState.GREEN)
    })

    it("should cycle green back to white", () => {
      const guess: GuessRecord = {
        word: "crane",
        feedback: [
          TileState.WHITE,
          TileState.WHITE,
          TileState.GREEN,
          TileState.WHITE,
          TileState.WHITE,
        ],
      }
      const state = reducer(
        reducer(undefined, addGuess(guess)),
        updateFeedback({ index: 0, position: 2 }),
      )
      expect(state.guesses[0].feedback[2]).toBe(TileState.WHITE)
    })

    it("should not affect other positions", () => {
      const guess = makeGuess("crane")
      const state = reducer(
        reducer(undefined, addGuess(guess)),
        updateFeedback({ index: 0, position: 0 }),
      )
      expect(state.guesses[0].feedback[0]).toBe(TileState.YELLOW)
      expect(state.guesses[0].feedback[1]).toBe(TileState.WHITE)
      expect(state.guesses[0].feedback[2]).toBe(TileState.WHITE)
      expect(state.guesses[0].feedback[3]).toBe(TileState.WHITE)
      expect(state.guesses[0].feedback[4]).toBe(TileState.WHITE)
    })
  })

  describe("setQuestRule", () => {
    it("should replace the quest rule", () => {
      const state = reducer(
        undefined,
        setQuestRule({ type: "endsWith", letter: "s" }),
      )
      expect(state.questRule).toEqual({ type: "endsWith", letter: "s" })
    })

    it("should overwrite a previous quest rule", () => {
      const state = reducer(
        reducer(undefined, setQuestRule({ type: "endsWith", letter: "s" })),
        setQuestRule({ type: "avoid", letter: "e" }),
      )
      expect(state.questRule).toEqual({
        type: "avoid",
        letter: "e",
      })
    })
  })

  describe("markCorrect", () => {
    it("should add a word to previouslyCorrect", () => {
      const state = reducer(undefined, markCorrect("crane"))
      expect(state.previouslyCorrect).toEqual(["crane"])
    })

    it("should not add duplicates", () => {
      const state = reducer(
        reducer(undefined, markCorrect("crane")),
        markCorrect("crane"),
      )
      expect(state.previouslyCorrect).toEqual(["crane"])
    })

    it("should add multiple distinct words", () => {
      const state = reducer(
        reducer(undefined, markCorrect("crane")),
        markCorrect("slate"),
      )
      expect(state.previouslyCorrect).toEqual(["crane", "slate"])
    })
  })

  describe("reset", () => {
    it("should clear guesses and quest rule", () => {
      let state = reducer(undefined, addGuess(makeGuess("crane")))
      state = reducer(state, setQuestRule({ type: "endsWith", letter: "s" }))
      state = reducer(state, reset())
      expect(state.guesses).toEqual([])
      expect(state.questRule).toEqual({ type: "none" })
    })

    it("should preserve previouslyCorrect", () => {
      let state = reducer(undefined, markCorrect("crane"))
      state = reducer(state, addGuess(makeGuess("slate")))
      state = reducer(state, reset())
      expect(state.previouslyCorrect).toEqual(["crane"])
    })
  })
})

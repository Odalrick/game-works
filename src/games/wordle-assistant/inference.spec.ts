import { describe, expect, it } from "@jest/globals"

import { deriveConstraints, filterCandidates } from "./inference"
import { GuessRecord, TileState } from "./types"

const { GREEN, WHITE } = TileState

describe("deriveConstraints", () => {
  it("should track green letters as locked positions", () => {
    const guesses: GuessRecord[] = [
      {
        word: "stone",
        feedback: [GREEN, WHITE, WHITE, WHITE, WHITE],
      },
    ]
    const constraints = deriveConstraints(guesses)
    expect(constraints.greenLetters.get(0)).toBe("s")
  })

  it("should exclude white letters", () => {
    const guesses: GuessRecord[] = [
      {
        word: "blunt",
        feedback: [WHITE, WHITE, WHITE, WHITE, WHITE],
      },
    ]
    const constraints = deriveConstraints(guesses)
    expect(constraints.excludedLetters.has("b")).toBe(true)
    expect(constraints.excludedLetters.has("l")).toBe(true)
    expect(constraints.excludedLetters.has("u")).toBe(true)
    expect(constraints.excludedLetters.has("n")).toBe(true)
    expect(constraints.excludedLetters.has("t")).toBe(true)
  })
})

describe("filterCandidates", () => {
  const wordList = ["stare", "stone", "spine", "crane", "blunt", "major"]

  it("should keep words matching green positions", () => {
    const candidates = ["stare", "stone", "spine", "crane", "blunt", "slyly"]
    const guesses: GuessRecord[] = [
      {
        word: "slyly",
        feedback: [GREEN, WHITE, WHITE, WHITE, WHITE],
      },
    ]
    const constraints = deriveConstraints(guesses)
    const result = filterCandidates(candidates, constraints)
    // s at pos 0 required; l and y excluded
    expect(result).toContain("stare")
    expect(result).toContain("stone")
    expect(result).toContain("spine")
    expect(result).not.toContain("crane")
    expect(result).not.toContain("blunt")
    expect(result).not.toContain("slyly")
  })

  it("should exclude words containing white letters", () => {
    const guesses: GuessRecord[] = [
      {
        word: "blunt",
        feedback: [WHITE, WHITE, WHITE, WHITE, WHITE],
      },
    ]
    const constraints = deriveConstraints(guesses)
    const result = filterCandidates(wordList, constraints)
    // b, l, u, n, t all excluded
    // "stare" has t — excluded
    // "stone" has t, n — excluded
    // "spine" has n — excluded
    // "crane" has n — excluded
    // "blunt" has all — excluded
    // "major" has none — kept
    expect(result).toEqual(["major"])
  })

  it("should apply both green and white constraints together", () => {
    const guesses: GuessRecord[] = [
      {
        word: "stone",
        feedback: [GREEN, WHITE, WHITE, WHITE, WHITE],
      },
    ]
    const constraints = deriveConstraints(guesses)
    const result = filterCandidates(wordList, constraints)
    // s at pos 0 required, t/o/n/e excluded
    // "stare" has t, e — excluded
    // "stone" has t, o, n, e — excluded
    // "spine" has n, e — excluded
    // "crane" — no s at pos 0 — excluded
    // "blunt" — no s at pos 0 — excluded
    // "major" — no s at pos 0 — excluded
    expect(result).toEqual([])
  })
})

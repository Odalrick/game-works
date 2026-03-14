import { describe, expect, it } from "@jest/globals"

import { deriveConstraints, filterCandidates } from "./inference"
import { GuessRecord, TileState } from "./types"

const { GREEN, YELLOW, WHITE } = TileState

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

  it("should require yellow letters present but not in that position", () => {
    const candidates = ["track", "stone", "tulip", "crane"]
    // Guess "stare": s=white, t=yellow(pos1), a=white, r=white, e=white
    const guesses: GuessRecord[] = [
      {
        word: "stare",
        feedback: [WHITE, YELLOW, WHITE, WHITE, WHITE],
      },
    ]
    const constraints = deriveConstraints(guesses)
    const result = filterCandidates(candidates, constraints)
    // s, a, r, e excluded globally; t required but not at pos 1
    // "track" — has t at pos 0 (not pos 1), but has a and r — excluded
    // "stone" — has s, e — excluded
    // "tulip" — has t at pos 0 (not pos 1), no s/a/r/e — passes
    // "crane" — has a, r, e — excluded
    expect(result).toEqual(["tulip"])
  })

  it("should not globally exclude a letter that has green/yellow elsewhere", () => {
    // Guess "sleep": s=white, l=white, e(pos2)=yellow, e(pos3)=white, p=white
    const candidates = ["fetch", "force", "index", "tweet"]
    const guesses: GuessRecord[] = [
      {
        word: "sleep",
        feedback: [WHITE, WHITE, YELLOW, WHITE, WHITE],
      },
    ]
    const constraints = deriveConstraints(guesses)
    const result = filterCandidates(candidates, constraints)
    // s, l, p excluded globally
    // e: pos 2 yellow, pos 3 white — e is required (count 1) but not at pos 2 or 3
    // "fetch" — e at pos 1, no s/l/p — passes
    // "force" — e at pos 4, no s/l/p — passes
    // "index" — e at pos 3 (excluded position) — fails
    // "tweet" — has t,w,e,e,t — e at pos 2 (excluded position) — fails
    expect(result).toContain("fetch")
    expect(result).toContain("force")
    expect(result).not.toContain("index")
    expect(result).not.toContain("tweet")
  })
})

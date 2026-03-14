import { describe, expect, it } from "@jest/globals"

import { letterFrequencies, rankWander } from "./ranker"
import { GuessRecord, TileState } from "./types"

const { WHITE } = TileState

describe("letterFrequencies", () => {
  it("should compute per-position letter frequency from a word pool", () => {
    const pool = ["crane", "crate", "craze"]
    const frequencies = letterFrequencies(pool)

    expect(frequencies.get(0)?.get("c")).toBe(3)
    expect(frequencies.get(4)?.get("e")).toBe(3)
    expect(frequencies.get(3)?.get("n")).toBe(1)
  })

  it("should return empty maps for an empty pool", () => {
    const frequencies = letterFrequencies([])
    expect(frequencies.size).toBe(0)
  })
})

describe("rankWander", () => {
  it("should rank words with untested letters above words with tested letters", () => {
    const pool = ["crane", "crate", "blind"]
    const guesses: GuessRecord[] = [
      { word: "stare", feedback: [WHITE, WHITE, WHITE, WHITE, WHITE] },
    ]
    const ranked = rankWander(pool, guesses, pool)
    expect(ranked[0]).toBe("blind")
  })

  it("should penalise words with duplicate letters", () => {
    const pool = ["bleed", "bland"]
    const guesses: GuessRecord[] = [
      { word: "stare", feedback: [WHITE, WHITE, WHITE, WHITE, WHITE] },
    ]
    const ranked = rankWander(pool, guesses, pool)
    expect(ranked.indexOf("bland")).toBeLessThan(ranked.indexOf("bleed"))
  })
})

import { describe, expect, it } from "@jest/globals"

import { letterFrequencies, rankQuest, rankSeek, rankWander } from "./ranker"
import { GuessRecord, QuestRule, TileState } from "./types"

const { YELLOW, WHITE } = TileState

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

describe("rankSeek", () => {
  it("should return all candidates ranked by frequency when all guessed letters are white", () => {
    const candidates = ["blind", "cloud", "guild"]
    const guesses: GuessRecord[] = [
      { word: "stare", feedback: [WHITE, WHITE, WHITE, WHITE, WHITE] },
    ]
    const ranked = rankSeek(candidates, guesses, candidates)
    expect(ranked).toHaveLength(3)
    expect(ranked).toEqual(expect.arrayContaining(["blind", "cloud", "guild"]))
  })

  it("should rank words that place yellow letters in new positions", () => {
    const candidates = ["dance", "notch"]
    const guesses: GuessRecord[] = [
      { word: "given", feedback: [WHITE, WHITE, WHITE, WHITE, YELLOW] },
    ]
    const ranked = rankSeek(candidates, guesses, candidates)
    // Both place n in a new position (not position 4), so both should be returned
    expect(ranked).toContain("dance")
    expect(ranked).toContain("notch")
  })
})

describe("rankQuest", () => {
  const endsWithY: QuestRule = { type: "endsWith", letter: "y" }

  it("should include only words satisfying the quest rule", () => {
    const pool = ["crazy", "daily", "crane", "stone"]
    const guesses: GuessRecord[] = []
    const ranked = rankQuest(pool, guesses, endsWithY, pool, [])
    expect(ranked).toContain("crazy")
    expect(ranked).toContain("daily")
    expect(ranked).not.toContain("crane")
    expect(ranked).not.toContain("stone")
  })

  it("should deprioritise words that are also candidate answers", () => {
    const pool = ["crazy", "daily", "foggy", "lumpy"]
    const candidates = ["crazy", "daily"]
    const guesses: GuessRecord[] = []
    const ranked = rankQuest(pool, guesses, endsWithY, pool, candidates)
    // foggy and lumpy (not candidates) should rank above crazy and daily (candidates)
    const foggyIndex = ranked.indexOf("foggy")
    const lumpyIndex = ranked.indexOf("lumpy")
    const crazyIndex = ranked.indexOf("crazy")
    const dailyIndex = ranked.indexOf("daily")
    expect(foggyIndex).toBeLessThan(crazyIndex)
    expect(foggyIndex).toBeLessThan(dailyIndex)
    expect(lumpyIndex).toBeLessThan(crazyIndex)
    expect(lumpyIndex).toBeLessThan(dailyIndex)
  })
})

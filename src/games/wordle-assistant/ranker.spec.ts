import { describe, expect, it } from "@jest/globals"

import { letterFrequencies, rankQuest, rankSeek, rankWander } from "./ranker"
import { GuessRecord, QuestRule, TileState } from "./types"

const { GREEN, YELLOW, WHITE } = TileState

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

  it("should penalise duplicate letters like wander does", () => {
    // After SEERS g...., candidates all start with S.
    // Seek should rank single-S words above multi-S words.
    const candidates = ["salsa", "snowy", "sassy"]
    const guesses: GuessRecord[] = [
      { word: "seers", feedback: [GREEN, WHITE, WHITE, WHITE, WHITE] },
    ]
    const ranked = rankSeek(candidates, guesses, candidates)
    expect(ranked.indexOf("snowy")).toBeLessThan(ranked.indexOf("salsa"))
    expect(ranked.indexOf("snowy")).toBeLessThan(ranked.indexOf("sassy"))
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
  it("should deprioritise candidate answers regardless of quest type", () => {
    const pool = ["crazy", "daily", "foggy", "lumpy"]
    const candidates = ["crazy", "daily"]
    const rule: QuestRule = {
      type: "lettersAt",
      letters: ["", "", "", "", "y"],
    }
    const guesses: GuessRecord[] = []
    const ranked = rankQuest(pool, guesses, rule, pool, candidates)
    const foggyIndex = ranked.indexOf("foggy")
    const lumpyIndex = ranked.indexOf("lumpy")
    const crazyIndex = ranked.indexOf("crazy")
    const dailyIndex = ranked.indexOf("daily")
    expect(foggyIndex).toBeLessThan(crazyIndex)
    expect(foggyIndex).toBeLessThan(dailyIndex)
    expect(lumpyIndex).toBeLessThan(crazyIndex)
    expect(lumpyIndex).toBeLessThan(dailyIndex)
  })

  describe("lettersAt", () => {
    it("should include only words matching required positions", () => {
      const pool = ["crazy", "daily", "crane", "stone"]
      const rule: QuestRule = {
        type: "lettersAt",
        letters: ["", "", "", "", "y"],
      }
      const ranked = rankQuest(pool, [], rule, pool, [])
      expect(ranked).toContain("crazy")
      expect(ranked).toContain("daily")
      expect(ranked).not.toContain("crane")
      expect(ranked).not.toContain("stone")
    })
  })

  describe("avoid", () => {
    it("should exclude words containing the avoided letter", () => {
      const pool = ["crane", "blind", "stone", "brake"]
      const rule: QuestRule = { type: "avoid", letter: "e" }
      const ranked = rankQuest(pool, [], rule, pool, [])
      expect(ranked).toContain("blind")
      expect(ranked).not.toContain("crane")
      expect(ranked).not.toContain("stone")
      expect(ranked).not.toContain("brake")
    })
  })

  describe("use", () => {
    it("should only include words containing the wanted letter", () => {
      const pool = ["crane", "blind", "stone", "creep"]
      const rule: QuestRule = { type: "use", letter: "e" }
      const ranked = rankQuest(pool, [], rule, pool, [])
      expect(ranked).toContain("crane")
      expect(ranked).toContain("stone")
      expect(ranked).toContain("creep")
      expect(ranked).not.toContain("blind")
    })

    it("should promote words with more occurrences of the wanted letter", () => {
      // creep has 2 e's, crane has 1 e — creep should rank higher
      // assuming wander scores them similarly otherwise
      const pool = ["crane", "creep", "three"]
      const guesses: GuessRecord[] = [
        { word: "slung", feedback: [WHITE, WHITE, WHITE, WHITE, WHITE] },
      ]
      const rule: QuestRule = { type: "use", letter: "e" }
      const ranked = rankQuest(pool, guesses, rule, pool, [])
      // three (2 e's) and creep (2 e's) should rank above crane (1 e)
      expect(ranked.indexOf("three")).toBeLessThan(ranked.indexOf("crane"))
      expect(ranked.indexOf("creep")).toBeLessThan(ranked.indexOf("crane"))
    })
  })
})

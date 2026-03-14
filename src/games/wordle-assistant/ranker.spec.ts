import { describe, expect, it } from "@jest/globals"

import { letterFrequencies } from "./ranker"

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

import { describe, expect, it } from "@jest/globals"
import { satisfiesRule } from "./questRule"
import type { QuestRule } from "./types"

describe("satisfiesRule", () => {
  it("always passes for rule type none", () => {
    const rule: QuestRule = { type: "none" }
    expect(satisfiesRule("crane", rule)).toBe(true)
  })

  it("checks lettersAt rule — matches required positions", () => {
    const rule: QuestRule = {
      type: "lettersAt",
      letters: ["c", "", "", "", "y"],
    }
    expect(satisfiesRule("crazy", rule)).toBe(true)
    expect(satisfiesRule("crane", rule)).toBe(false)
    expect(satisfiesRule("curly", rule)).toBe(true)
  })

  it("checks lettersAt rule — all empty passes any word", () => {
    const rule: QuestRule = {
      type: "lettersAt",
      letters: ["", "", "", "", ""],
    }
    expect(satisfiesRule("crane", rule)).toBe(true)
  })

  it("checks lettersAt rule — single position acts like startsWith/endsWith", () => {
    const endsWithY: QuestRule = {
      type: "lettersAt",
      letters: ["", "", "", "", "y"],
    }
    expect(satisfiesRule("crazy", endsWithY)).toBe(true)
    expect(satisfiesRule("crane", endsWithY)).toBe(false)

    const startsWithS: QuestRule = {
      type: "lettersAt",
      letters: ["s", "", "", "", ""],
    }
    expect(satisfiesRule("stone", startsWithS)).toBe(true)
    expect(satisfiesRule("crane", startsWithS)).toBe(false)
  })

  it("checks avoid rule — word must not contain the letter", () => {
    const rule: QuestRule = { type: "avoid", letter: "a" }
    expect(satisfiesRule("stone", rule)).toBe(true)
    expect(satisfiesRule("crane", rule)).toBe(false)
  })

  it("checks use rule — word must contain the letter", () => {
    const rule: QuestRule = { type: "use", letter: "e" }
    expect(satisfiesRule("crane", rule)).toBe(true)
    expect(satisfiesRule("awful", rule)).toBe(false)
  })
})

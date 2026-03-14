import { describe, expect, it } from "@jest/globals"
import { satisfiesRule } from "./questRule"
import type { QuestRule } from "./types"

describe("satisfiesRule", () => {
  it("always passes for rule type none", () => {
    const rule: QuestRule = { type: "none" }
    expect(satisfiesRule("crane", rule)).toBe(true)
  })

  it("checks endsWith rule", () => {
    const rule: QuestRule = { type: "endsWith", letter: "y" }
    expect(satisfiesRule("crazy", rule)).toBe(true)
    expect(satisfiesRule("crane", rule)).toBe(false)
  })

  it("checks maxLetter rule", () => {
    const rule: QuestRule = { type: "maxLetter", letter: "e", count: 1 }
    expect(satisfiesRule("crane", rule)).toBe(true)
    expect(satisfiesRule("eerie", rule)).toBe(false)
  })

  it("checks minLetter rule", () => {
    const rule: QuestRule = { type: "minLetter", letter: "e", count: 2 }
    expect(satisfiesRule("crane", rule)).toBe(false)
    expect(satisfiesRule("eerie", rule)).toBe(true)
  })
})

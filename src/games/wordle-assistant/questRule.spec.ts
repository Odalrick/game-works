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

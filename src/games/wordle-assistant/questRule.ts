import type { QuestRule } from "./types"

export function satisfiesRule(word: string, rule: QuestRule): boolean {
  switch (rule.type) {
    case "none":
      return true
    case "endsWith":
      return word.endsWith(rule.letter)
    case "avoid":
      return !word.includes(rule.letter)
    case "use":
      return word.includes(rule.letter)
  }
}

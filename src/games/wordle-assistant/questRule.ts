import type { QuestRule } from "./types"

export function satisfiesRule(word: string, rule: QuestRule): boolean {
  switch (rule.type) {
    case "none":
      return true
    case "endsWith":
      return word.endsWith(rule.letter)
    case "maxLetter": {
      const count = word.split("").filter((c) => c === rule.letter).length
      return count <= rule.count
    }
    case "minLetter": {
      const count = word.split("").filter((c) => c === rule.letter).length
      return count >= rule.count
    }
  }
}

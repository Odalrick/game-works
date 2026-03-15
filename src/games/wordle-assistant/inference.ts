import { GuessRecord, TileState } from "./types"

export type PositionConstraint = {
  greenLetters: Map<number, string>
  requiredLetters: Map<string, number>
  excludedLetters: Set<string>
  excludedPositions: Map<string, Set<number>>
}

export function deriveConstraints(guesses: GuessRecord[]): PositionConstraint {
  const greenLetters = new Map<number, string>()
  const requiredLetters = new Map<string, number>()
  const excludedLetters = new Set<string>()
  const excludedPositions = new Map<string, Set<number>>()

  // Pre-scan: collect letters that appear as green or yellow in any guess.
  // A letter that is white in one guess but green/yellow in another must not
  // be globally excluded.
  const everGreenOrYellow = new Set<string>()
  for (const guess of guesses) {
    for (let position = 0; position < 5; position++) {
      const state = guess.feedback[position]
      if (state === TileState.GREEN || state === TileState.YELLOW) {
        everGreenOrYellow.add(guess.word[position])
      }
    }
  }

  for (const guess of guesses) {
    const { word, feedback } = guess

    // Per-guess pass: count green and yellow occurrences of each letter
    const letterCounts = new Map<string, number>()

    for (let position = 0; position < 5; position++) {
      const letter = word[position]
      const state = feedback[position]

      if (state === TileState.GREEN || state === TileState.YELLOW) {
        letterCounts.set(letter, (letterCounts.get(letter) ?? 0) + 1)
      }
    }

    // Apply constraints
    for (let position = 0; position < 5; position++) {
      const letter = word[position]
      const state = feedback[position]

      if (state === TileState.GREEN) {
        greenLetters.set(position, letter)
      } else if (state === TileState.YELLOW) {
        if (!excludedPositions.has(letter)) {
          excludedPositions.set(letter, new Set())
        }
        excludedPositions.get(letter)!.add(position)
      } else if (state === TileState.WHITE) {
        const greenOrYellowCount = letterCounts.get(letter) ?? 0
        if (greenOrYellowCount > 0 || everGreenOrYellow.has(letter)) {
          // Letter appears as green/yellow in this guess or another —
          // don't globally exclude, just exclude this position
          if (!excludedPositions.has(letter)) {
            excludedPositions.set(letter, new Set())
          }
          excludedPositions.get(letter)!.add(position)
        } else {
          excludedLetters.add(letter)
        }
      }
    }

    // Set required letter counts from green+yellow occurrences
    for (const [letter, count] of letterCounts) {
      const existing = requiredLetters.get(letter) ?? 0
      if (count > existing) {
        requiredLetters.set(letter, count)
      }
    }
  }

  return { greenLetters, requiredLetters, excludedLetters, excludedPositions }
}

export function filterCandidates(
  words: string[],
  constraints: PositionConstraint,
): string[] {
  const { greenLetters, requiredLetters, excludedLetters, excludedPositions } =
    constraints

  return words.filter((word) => {
    // Check green letters match exact positions
    for (const [position, letter] of greenLetters) {
      if (word[position] !== letter) return false
    }

    // Check excluded letters are absent
    for (const letter of excludedLetters) {
      if (word.includes(letter)) return false
    }

    // Check required letters are present with minimum count
    for (const [letter, count] of requiredLetters) {
      const occurrences = word.split("").filter((c) => c === letter).length
      if (occurrences < count) return false
    }

    // Check excluded positions
    for (const [letter, positions] of excludedPositions) {
      for (const position of positions) {
        if (word[position] === letter) return false
      }
    }

    return true
  })
}

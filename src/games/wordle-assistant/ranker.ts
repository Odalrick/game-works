import type { GuessRecord, QuestRule } from "./types"
import { TileState } from "./types"

export function letterFrequencies(
  pool: string[],
): Map<number, Map<string, number>> {
  const frequencies = new Map<number, Map<string, number>>()

  for (const word of pool) {
    for (let position = 0; position < word.length; position++) {
      const letter = word[position]
      if (!frequencies.has(position)) {
        frequencies.set(position, new Map())
      }
      const positionMap = frequencies.get(position)!
      positionMap.set(letter, (positionMap.get(letter) ?? 0) + 1)
    }
  }

  return frequencies
}

function testedLetters(guesses: GuessRecord[]): Set<string> {
  const tested = new Set<string>()
  for (const guess of guesses) {
    for (const letter of guess.word) {
      tested.add(letter)
    }
  }
  return tested
}

function overallLetterFrequency(pool: string[]): Map<string, number> {
  const frequency = new Map<string, number>()
  for (const word of pool) {
    const seen = new Set<string>()
    for (const letter of word) {
      if (!seen.has(letter)) {
        seen.add(letter)
        frequency.set(letter, (frequency.get(letter) ?? 0) + 1)
      }
    }
  }
  return frequency
}

function greenPositions(guesses: GuessRecord[]): Map<number, string> {
  const greens = new Map<number, string>()
  for (const guess of guesses) {
    for (let position = 0; position < guess.feedback.length; position++) {
      if (guess.feedback[position] === TileState.GREEN) {
        greens.set(position, guess.word[position])
      }
    }
  }
  return greens
}

function scoreWander(
  word: string,
  tested: Set<string>,
  frequency: Map<string, number>,
  greens: Map<number, string>,
): number {
  let score = 0
  const seen = new Set<string>()

  for (let position = 0; position < word.length; position++) {
    const letter = word[position]

    // Penalise placing a known green letter in its known position (wastes info)
    if (greens.get(position) === letter) {
      continue
    }

    const letterFrequency = frequency.get(letter) ?? 0

    if (seen.has(letter)) {
      // Duplicate letter penalty: no score contribution
      continue
    }
    seen.add(letter)

    if (!tested.has(letter)) {
      // Untested letters are most valuable, weighted by frequency
      score += letterFrequency * 2
    } else {
      // Tested letters still contribute some frequency value
      score += letterFrequency * 0.1
    }
  }

  return score
}

export function rankWander(
  pool: string[],
  guesses: GuessRecord[],
  referencePool: string[],
): string[] {
  return wanderRank(pool, guesses, referencePool)
}

export function rankSeek(
  candidates: string[],
  guesses: GuessRecord[],
  referencePool: string[],
  previouslyCorrect: string[] = [],
): string[] {
  const ranked = wanderRank(candidates, guesses, referencePool)
  if (previouslyCorrect.length === 0) return ranked
  const previousSet = new Set(previouslyCorrect)
  const promoted = ranked.filter((word) => previousSet.has(word))
  const rest = ranked.filter((word) => !previousSet.has(word))
  return [...promoted, ...rest]
}

function wanderRank(
  pool: string[],
  guesses: GuessRecord[],
  referencePool: string[],
): string[] {
  const tested = testedLetters(guesses)
  const frequency = overallLetterFrequency(
    referencePool.length > 0 ? referencePool : pool,
  )
  const greens = greenPositions(guesses)

  return [...pool].sort((a, b) => {
    return (
      scoreWander(b, tested, frequency, greens) -
      scoreWander(a, tested, frequency, greens)
    )
  })
}

function antiSolve(ranked: string[], candidates: string[]): string[] {
  const candidateSet = new Set(candidates)
  const nonCandidates = ranked.filter((word) => !candidateSet.has(word))
  const isCandidates = ranked.filter((word) => candidateSet.has(word))
  return [...nonCandidates, ...isCandidates]
}

function letterCount(word: string, letter: string): number {
  let count = 0
  for (const character of word) {
    if (character === letter) count++
  }
  return count
}

function rankQuestUse(
  pool: string[],
  guesses: GuessRecord[],
  letter: string,
  referencePool: string[],
  candidates: string[],
): string[] {
  const compliant = pool.filter((word) => word.includes(letter))
  const ranked = wanderRank(compliant, guesses, referencePool)

  // Stable sort: partition by letter count descending, then concatenate
  const buckets: string[][] = [[], [], [], [], []]
  for (const word of ranked) {
    const count = letterCount(word, letter)
    const index = Math.min(count, 5) - 1
    if (index < 0) {
      continue
    }
    buckets[index].push(word)
  }
  const promoted = [
    ...buckets[4],
    ...buckets[3],
    ...buckets[2],
    ...buckets[1],
    ...buckets[0],
  ]

  return antiSolve(promoted, candidates)
}

function rankQuestAvoid(
  pool: string[],
  guesses: GuessRecord[],
  letter: string,
  referencePool: string[],
  candidates: string[],
): string[] {
  const compliant = pool.filter((word) => !word.includes(letter))
  return antiSolve(wanderRank(compliant, guesses, referencePool), candidates)
}

function rankQuestLettersAt(
  pool: string[],
  guesses: GuessRecord[],
  letters: [string, string, string, string, string],
  referencePool: string[],
  candidates: string[],
): string[] {
  const compliant = pool.filter((word) =>
    letters.every(
      (letter, position) => letter === "" || word[position] === letter,
    ),
  )
  return antiSolve(wanderRank(compliant, guesses, referencePool), candidates)
}

export function rankQuest(
  pool: string[],
  guesses: GuessRecord[],
  rule: QuestRule,
  referencePool: string[],
  candidates: string[],
): string[] {
  switch (rule.type) {
    case "none":
      return []
    case "use":
      return rankQuestUse(pool, guesses, rule.letter, referencePool, candidates)
    case "avoid":
      return rankQuestAvoid(
        pool,
        guesses,
        rule.letter,
        referencePool,
        candidates,
      )
    case "lettersAt":
      return rankQuestLettersAt(
        pool,
        guesses,
        rule.letters,
        referencePool,
        candidates,
      )
  }
}

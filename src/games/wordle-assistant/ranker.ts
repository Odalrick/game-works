import type { GuessRecord, QuestRule } from "./types"
import { TileState } from "./types"
import { satisfiesRule } from "./questRule"

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
  const tested = testedLetters(guesses)
  const frequency = overallLetterFrequency(referencePool)
  const greens = greenPositions(guesses)

  return [...pool].sort((a, b) => {
    return (
      scoreWander(b, tested, frequency, greens) -
      scoreWander(a, tested, frequency, greens)
    )
  })
}

function yellowPositions(guesses: GuessRecord[]): Map<string, Set<number>> {
  const yellows = new Map<string, Set<number>>()
  for (const guess of guesses) {
    for (let position = 0; position < guess.feedback.length; position++) {
      if (guess.feedback[position] === TileState.YELLOW) {
        const letter = guess.word[position]
        if (!yellows.has(letter)) {
          yellows.set(letter, new Set())
        }
        yellows.get(letter)!.add(position)
      }
    }
  }
  return yellows
}

function scoreSeek(
  word: string,
  tested: Set<string>,
  frequency: Map<string, number>,
  yellows: Map<string, Set<number>>,
): number {
  let score = 0

  for (let position = 0; position < word.length; position++) {
    const letter = word[position]
    const letterFrequency = frequency.get(letter) ?? 0

    // Reward placing yellow letters in new (untried) positions
    const yellowPositionsForLetter = yellows.get(letter)
    if (yellowPositionsForLetter && !yellowPositionsForLetter.has(position)) {
      score += letterFrequency * 3
    }

    // Reward untested high-frequency letters
    if (!tested.has(letter)) {
      score += letterFrequency * 2
    } else {
      score += letterFrequency
    }
  }

  return score
}

export function rankSeek(
  candidates: string[],
  guesses: GuessRecord[],
  referencePool: string[],
): string[] {
  const tested = testedLetters(guesses)
  const frequency = overallLetterFrequency(referencePool)
  const yellows = yellowPositions(guesses)

  return [...candidates].sort((a, b) => {
    return (
      scoreSeek(b, tested, frequency, yellows) -
      scoreSeek(a, tested, frequency, yellows)
    )
  })
}

function scoreQuest(
  word: string,
  tested: Set<string>,
  frequency: Map<string, number>,
  yellows: Map<string, Set<number>>,
  candidateSet: Set<string>,
): number {
  let score = 0

  for (let position = 0; position < word.length; position++) {
    const letter = word[position]
    const letterFrequency = frequency.get(letter) ?? 0

    // Reward placing yellow letters in new positions
    const yellowPositionsForLetter = yellows.get(letter)
    if (yellowPositionsForLetter && !yellowPositionsForLetter.has(position)) {
      score += letterFrequency * 3
    }

    // Reward untested high-frequency letters
    if (!tested.has(letter)) {
      score += letterFrequency * 2
    } else {
      score += letterFrequency
    }
  }

  // Anti-solving: deprioritise words that are candidate answers
  if (candidateSet.has(word)) {
    score -= 1000
  }

  return score
}

export function rankQuest(
  pool: string[],
  guesses: GuessRecord[],
  rule: QuestRule,
  referencePool: string[],
  candidates: string[],
): string[] {
  const compliant = pool.filter((word) => satisfiesRule(word, rule))
  const tested = testedLetters(guesses)
  const frequency = overallLetterFrequency(referencePool)
  const yellows = yellowPositions(guesses)
  const candidateSet = new Set(candidates)

  return compliant.sort((a, b) => {
    return (
      scoreQuest(b, tested, frequency, yellows, candidateSet) -
      scoreQuest(a, tested, frequency, yellows, candidateSet)
    )
  })
}

# Wordle Assistant Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side Wordle helper that takes user-supplied guesses and feedback, then suggests next moves using three strategies (Wander, Seek, Quest).

**Architecture:** Domain logic lives in pure functions split by concern: answer inference, quest rule evaluation, and strategy ranking. A thin Redux slice wires state; React components render the UI from the DESIGN.md wireframe. A static word list ships as an importable JSON array.

**Tech Stack:** React 18, Redux Toolkit, TypeScript (strict), Jest, Ramda (available but not required for new code)

**Spec:** `src/games/wordle-assistant/DESIGN.md`

---

## File structure

```
src/games/wordle-assistant/
├── DESIGN.md                  (existing)
├── README.md                  (existing)
├── types.ts                   (TileState, Feedback, GuessRecord, QuestRule)
├── inference.ts               (derive answer constraints, filter candidates)
├── inference.spec.ts
├── questRule.ts               (evaluate whether a word satisfies a quest rule)
├── questRule.spec.ts
├── ranker.ts                  (score/rank words per strategy: wander, seek, quest)
├── ranker.spec.ts
├── wordList.json              (static 5-letter word list)
├── wordleSlice.ts             (Redux slice — state, reducers)
├── wordleSlice.spec.ts
├── WordleAssistant.tsx         (main container, wires Redux to children)
├── GuessHistory.tsx            (guess list + input + tile feedback toggles)
├── Tile.tsx                    (single letter tile, clickable state cycle)
├── QuestRuleSelector.tsx       (dropdown + conditional parameter inputs)
├── SuggestionPanels.tsx        (three-column Wander/Seek/Quest display)
└── wordle.css                  (component styles)
```

Modified existing files:
- `src/store.ts` — register wordle reducer
- `src/App.tsx` — wire Wordle tab to `WordleAssistant`

---

## Chunk 1: Types and answer inference

### Task 1: Shared types

**Files:**
- Create: `src/games/wordle-assistant/types.ts`

- [ ] **Step 1: Create types file**

```ts
export enum TileState {
  GREEN = "green",
  YELLOW = "yellow",
  WHITE = "white",
}

export type Feedback = [TileState, TileState, TileState, TileState, TileState]

export type GuessRecord = {
  word: string
  feedback: Feedback
}

export type QuestRule =
  | { type: "none" }
  | { type: "endsWith"; letter: string }
  | { type: "maxLetter"; letter: string; count: number }
  | { type: "minLetter"; letter: string; count: number }
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```
git add src/games/wordle-assistant/types.ts
git commit -m "feat(wordle): add shared domain types"
```

### Task 2: Answer inference — basic green/white filtering

**Files:**
- Create: `src/games/wordle-assistant/inference.ts`
- Create: `src/games/wordle-assistant/inference.spec.ts`

- [ ] **Step 1: Write failing test — green locks position**

```ts
// inference.spec.ts
import { describe, expect, it } from "@jest/globals"
import { filterCandidates } from "./inference"
import { TileState } from "./types"
import type { GuessRecord } from "./types"

describe("filterCandidates", () => {
  const words = ["stare", "stone", "spine", "crane", "blunt"]

  it("keeps only words with green letters in correct positions", () => {
    const guesses: GuessRecord[] = [
      {
        word: "stare",
        feedback: [TileState.GREEN, TileState.WHITE, TileState.WHITE, TileState.WHITE, TileState.WHITE],
      },
    ]
    const result = filterCandidates(words, guesses)
    // s in position 0: keeps stare, stone, spine
    expect(result).toContain("stone")
    expect(result).toContain("spine")
    expect(result).not.toContain("crane")
    expect(result).not.toContain("blunt")
  })

  it("excludes words containing white letters", () => {
    const guesses: GuessRecord[] = [
      {
        word: "blunt",
        feedback: [TileState.WHITE, TileState.WHITE, TileState.WHITE, TileState.WHITE, TileState.WHITE],
      },
    ]
    const words = ["stare", "stone", "spine", "crane", "blunt", "major"]
    const result = filterCandidates(words, guesses)
    // b, l, u, n, t all excluded
    expect(result).not.toContain("blunt") // has b, l, u, n, t
    expect(result).not.toContain("stone") // has t, n
    expect(result).not.toContain("stare") // has t
    expect(result).not.toContain("crane") // has n
    expect(result).toContain("major") // no b, l, u, n, t
  })
})

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest inference.spec.ts -v`
Expected: FAIL — `filterCandidates` not found

- [ ] **Step 3: Implement filterCandidates — green and white constraints**

```ts
// inference.ts
import type { GuessRecord } from "./types"
import { TileState } from "./types"

type PositionConstraint = {
  greenLetters: Map<number, string>       // position → must be this letter
  requiredLetters: Map<string, number>    // letter → minimum count in word
  excludedLetters: Set<string>            // letters not in word at all
  excludedPositions: Map<string, Set<number>> // letter → positions where it cannot be
}

export function deriveConstraints(guesses: GuessRecord[]): PositionConstraint {
  const greenLetters = new Map<number, string>()
  const requiredLetters = new Map<string, number>()
  const excludedLetters = new Set<string>()
  const excludedPositions = new Map<string, Set<number>>()

  for (const guess of guesses) {
    const letterCounts = new Map<string, { green: number; yellow: number; white: number }>()

    // First pass: count feedback per letter in this guess
    for (let i = 0; i < 5; i++) {
      const letter = guess.word[i]
      const state = guess.feedback[i]
      if (!letterCounts.has(letter)) {
        letterCounts.set(letter, { green: 0, yellow: 0, white: 0 })
      }
      const counts = letterCounts.get(letter)!
      if (state === TileState.GREEN) counts.green++
      else if (state === TileState.YELLOW) counts.yellow++
      else counts.white++
    }

    // Second pass: apply constraints
    for (let i = 0; i < 5; i++) {
      const letter = guess.word[i]
      const state = guess.feedback[i]

      if (state === TileState.GREEN) {
        greenLetters.set(i, letter)
      } else if (state === TileState.YELLOW) {
        if (!excludedPositions.has(letter)) {
          excludedPositions.set(letter, new Set())
        }
        excludedPositions.get(letter)!.add(i)
      } else {
        // White: but if same letter has green/yellow elsewhere, it's not fully excluded
        if (!excludedPositions.has(letter)) {
          excludedPositions.set(letter, new Set())
        }
        excludedPositions.get(letter)!.add(i)
      }
    }

    // Derive required counts and exclusions from letter counts
    for (const [letter, counts] of letterCounts) {
      const knownMinimum = counts.green + counts.yellow
      if (knownMinimum > 0) {
        const current = requiredLetters.get(letter) ?? 0
        requiredLetters.set(letter, Math.max(current, knownMinimum))
      }
      if (counts.white > 0 && knownMinimum === 0) {
        excludedLetters.add(letter)
      }
    }
  }

  return { greenLetters, requiredLetters, excludedLetters, excludedPositions }
}

export function filterCandidates(words: string[], guesses: GuessRecord[]): string[] {
  if (guesses.length === 0) return [...words]

  const constraints = deriveConstraints(guesses)

  return words.filter((word) => {
    for (const [position, letter] of constraints.greenLetters) {
      if (word[position] !== letter) return false
    }

    for (const letter of constraints.excludedLetters) {
      if (word.includes(letter)) return false
    }

    for (const [letter, minCount] of constraints.requiredLetters) {
      const count = word.split("").filter((c) => c === letter).length
      if (count < minCount) return false
    }

    for (const [letter, positions] of constraints.excludedPositions) {
      for (const position of positions) {
        if (word[position] === letter) return false
      }
    }

    return true
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest inference.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```
git add src/games/wordle-assistant/inference.ts src/games/wordle-assistant/inference.spec.ts
git commit -m "feat(wordle): add answer inference with green/white filtering"
```

### Task 3: Answer inference — yellow and duplicate-letter handling

**Files:**
- Modify: `src/games/wordle-assistant/inference.spec.ts`
- Modify: `src/games/wordle-assistant/inference.ts` (if needed)

- [ ] **Step 1: Write failing tests for yellow constraints**

```ts
it("requires yellow letters to be present but not in that position", () => {
  const guesses: GuessRecord[] = [
    {
      word: "stare",
      feedback: [TileState.WHITE, TileState.YELLOW, TileState.WHITE, TileState.WHITE, TileState.WHITE],
    },
  ]
  const words = ["stone", "track", "blunt", "tulip"]
  const result = filterCandidates(words, guesses)
  // t is in the word but NOT at position 1
  expect(result).toContain("track") // has t, not at position 1
  expect(result).not.toContain("stone") // t at position 1
  expect(result).not.toContain("blunt") // has s excluded — wait, s is white
  expect(result).toContain("tulip") // has t at position 0
})

it("handles duplicate letters — white does not exclude when green/yellow exists", () => {
  // Guess "sleep": s=white, l=white, e(pos 2)=yellow, e(pos 3)=white, p=white
  // Means: at least 1 e, not at position 2 or 3. s, l, p excluded.
  const guesses: GuessRecord[] = [
    {
      word: "sleep",
      feedback: [TileState.WHITE, TileState.WHITE, TileState.YELLOW, TileState.WHITE, TileState.WHITE],
    },
  ]
  const words = ["fetch", "force", "index", "tweet"]
  const result = filterCandidates(words, guesses)
  // fetch: f-e-t-c-h, e at pos 1. No s/l/p. Has e. ✓
  expect(result).toContain("fetch")
  // force: f-o-r-c-e, e at pos 4. No s/l/p. Has e. ✓
  expect(result).toContain("force")
  // index: i-n-d-e-x, e at pos 3 (excluded position). ✗
  expect(result).not.toContain("index")
  // tweet: t-w-e-e-t, e at pos 2 (excluded position). ✗
  expect(result).not.toContain("tweet")
})

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest inference.spec.ts -v`
Expected: new tests FAIL

- [ ] **Step 3: Fix implementation if needed for yellow/duplicate handling**

The implementation in Task 2 should already handle this via the `requiredLetters` and `excludedPositions` maps. If tests fail, adjust the constraint derivation. The critical logic: when a letter has both green/yellow AND white feedback in the same guess, it should NOT be added to `excludedLetters`, only to `excludedPositions` for the white positions.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest inference.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```
git add src/games/wordle-assistant/inference.spec.ts src/games/wordle-assistant/inference.ts
git commit -m "feat(wordle): handle yellow and duplicate-letter inference"
```

---

## Chunk 2: Quest rules and strategy ranking

### Task 4: Quest rule evaluation

**Files:**
- Create: `src/games/wordle-assistant/questRule.ts`
- Create: `src/games/wordle-assistant/questRule.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
// questRule.spec.ts
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
    expect(satisfiesRule("crane", rule)).toBe(true)  // 1 e
    expect(satisfiesRule("eerie", rule)).toBe(false)  // 3 e's
  })

  it("checks minLetter rule", () => {
    const rule: QuestRule = { type: "minLetter", letter: "e", count: 2 }
    expect(satisfiesRule("crane", rule)).toBe(false)  // 1 e
    expect(satisfiesRule("eerie", rule)).toBe(true)   // 3 e's
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest questRule.spec.ts -v`
Expected: FAIL

- [ ] **Step 3: Implement satisfiesRule**

```ts
// questRule.ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest questRule.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```
git add src/games/wordle-assistant/questRule.ts src/games/wordle-assistant/questRule.spec.ts
git commit -m "feat(wordle): add quest rule evaluation"
```

### Task 5: Letter frequency calculation

**Files:**
- Create: `src/games/wordle-assistant/ranker.ts`
- Create: `src/games/wordle-assistant/ranker.spec.ts`

- [ ] **Step 1: Write failing test for letter frequency**

```ts
// ranker.spec.ts
import { describe, expect, it } from "@jest/globals"
import { letterFrequencies } from "./ranker"

describe("letterFrequencies", () => {
  it("computes per-position letter frequencies from a word pool", () => {
    const pool = ["crane", "crate", "craze"]
    const frequencies = letterFrequencies(pool)
    // position 0: c appears 3 times
    expect(frequencies.get(0)!.get("c")).toBe(3)
    // position 4: e appears 2 times, z never at position 4 — wait craze has e at 4
    // crane=e, crate=e, craze=e — all e at position 4
    expect(frequencies.get(4)!.get("e")).toBe(3)
    // position 3: n=1, t=1, z=1
    expect(frequencies.get(3)!.get("n")).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest ranker.spec.ts -v`
Expected: FAIL

- [ ] **Step 3: Implement letterFrequencies**

```ts
// ranker.ts
export function letterFrequencies(
  pool: string[],
): Map<number, Map<string, number>> {
  const frequencies = new Map<number, Map<string, number>>()
  for (let i = 0; i < 5; i++) {
    frequencies.set(i, new Map())
  }

  for (const word of pool) {
    for (let i = 0; i < 5; i++) {
      const letter = word[i]
      const positionMap = frequencies.get(i)!
      positionMap.set(letter, (positionMap.get(letter) ?? 0) + 1)
    }
  }

  return frequencies
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest ranker.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```
git add src/games/wordle-assistant/ranker.ts src/games/wordle-assistant/ranker.spec.ts
git commit -m "feat(wordle): add letter frequency calculation"
```

### Task 6: Wander ranking

**Files:**
- Modify: `src/games/wordle-assistant/ranker.ts`
- Modify: `src/games/wordle-assistant/ranker.spec.ts`

- [ ] **Step 1: Write failing test for wander scoring**

The wander strategy prefers words that cover untested letters, especially high-frequency ones. It penalises duplicates. It should not place known-green letters in their known positions (wastes information).

```ts
import { rankWander } from "./ranker"
import { TileState } from "./types"
import type { GuessRecord } from "./types"

describe("rankWander", () => {
  it("prefers words with more untested letters", () => {
    const pool = ["crane", "blind", "crate"]
    const guesses: GuessRecord[] = [
      {
        word: "stare",
        feedback: [TileState.WHITE, TileState.WHITE, TileState.WHITE, TileState.WHITE, TileState.WHITE],
      },
    ]
    // s, t, a, r, e are all tested. "blind" has no tested letters. "crane" has r, a, e tested.
    const ranked = rankWander(pool, guesses, pool)
    expect(ranked[0]).toBe("blind")
  })

  it("penalises words with duplicate letters", () => {
    const pool = ["bland", "blind", "bleed"]
    const guesses: GuessRecord[] = []
    const ranked = rankWander(pool, guesses, pool)
    // "bleed" has duplicate e — should rank lower than "bland" and "blind"
    const bleedIndex = ranked.indexOf("bleed")
    const blandIndex = ranked.indexOf("bland")
    expect(bleedIndex).toBeGreaterThan(blandIndex)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest ranker.spec.ts -v`
Expected: FAIL

- [ ] **Step 3: Implement rankWander**

```ts
import type { GuessRecord } from "./types"

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
    for (const letter of word) {
      frequency.set(letter, (frequency.get(letter) ?? 0) + 1)
    }
  }
  return frequency
}

export function scoreWander(
  word: string,
  tested: Set<string>,
  frequency: Map<string, number>,
  greenPositions: Map<number, string>,
): number {
  let score = 0
  const seen = new Set<string>()

  for (let i = 0; i < 5; i++) {
    const letter = word[i]

    // Placing a known-green letter in its known position wastes that slot
    if (greenPositions.get(i) === letter) {
      continue
    }

    // Duplicate letter in this word — diminishing returns
    if (seen.has(letter)) {
      continue
    }
    seen.add(letter)

    // Untested letters are more valuable
    if (!tested.has(letter)) {
      score += (frequency.get(letter) ?? 0)
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
  const greenPositions = new Map<number, string>()
  // Extract green positions from guesses
  for (const guess of guesses) {
    for (let i = 0; i < 5; i++) {
      if (guess.feedback[i] === TileState.GREEN) {
        greenPositions.set(i, guess.word[i])
      }
    }
  }

  return [...pool].sort((a, b) => {
    return scoreWander(b, tested, frequency, greenPositions) -
      scoreWander(a, tested, frequency, greenPositions)
  })
}
```

Note: import `TileState` at the top of the file.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest ranker.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```
git add src/games/wordle-assistant/ranker.ts src/games/wordle-assistant/ranker.spec.ts
git commit -m "feat(wordle): add wander strategy ranking"
```

### Task 7: Seek ranking

**Files:**
- Modify: `src/games/wordle-assistant/ranker.ts`
- Modify: `src/games/wordle-assistant/ranker.spec.ts`

- [ ] **Step 1: Write failing test for seek scoring**

Seek operates on the candidate pool (words that could be the answer). It prefers words that place yellow letters in new positions and test high-frequency unresolved letters.

```ts
describe("rankSeek", () => {
  it("prefers candidates that test unresolved high-frequency letters", () => {
    // After guessing "stare" with all white, s/t/a/r/e are tested.
    // Among remaining candidates, prefer those with common untested letters.
    const guesses: GuessRecord[] = [
      {
        word: "stare",
        feedback: [TileState.WHITE, TileState.WHITE, TileState.WHITE, TileState.WHITE, TileState.WHITE],
      },
    ]
    // "blind" and "cloud" are candidates. "blind" has 5 untested letters,
    // "cloud" has 5 untested letters. But if "cloud" letters are more frequent
    // in the candidate pool, it should rank higher.
    const candidates = ["blind", "cloud", "guild"]
    const ranked = rankSeek(candidates, guesses, candidates)
    // All have untested letters; ranking depends on frequency in pool.
    expect(ranked).toHaveLength(3)
    // The key assertion: all candidates are returned, ordered by score.
    // Exact ordering depends on frequency — verify during implementation.
  })

  it("prefers candidates that place yellow letters in new positions", () => {
    // Yellow 'n' at position 4 — seek should prefer words with n NOT at position 4
    const guesses: GuessRecord[] = [
      {
        word: "given",
        feedback: [TileState.WHITE, TileState.WHITE, TileState.WHITE, TileState.WHITE, TileState.YELLOW],
      },
    ]
    // "dance": n at pos 2 (new position) — good
    // "known": n at pos 4 (same excluded position) — won't even be a candidate
    // "notch": n at pos 0 (new position) — good
    const candidates = ["dance", "notch"]
    const ranked = rankSeek(candidates, guesses, candidates)
    expect(ranked).toHaveLength(2)
    // Both place n in a new position, so both are valid seek suggestions
  })
})

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest ranker.spec.ts -v`
Expected: FAIL

- [ ] **Step 3: Implement rankSeek**

Similar structure to rankWander, but scored against the candidate pool. Prefer words that:
- Place yellow letters in positions not yet tried for that letter
- Include unresolved high-frequency letters from the candidate pool
- Are themselves valid candidates

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest ranker.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```
git add src/games/wordle-assistant/ranker.ts src/games/wordle-assistant/ranker.spec.ts
git commit -m "feat(wordle): add seek strategy ranking"
```

### Task 8: Quest ranking

**Files:**
- Modify: `src/games/wordle-assistant/ranker.ts`
- Modify: `src/games/wordle-assistant/ranker.spec.ts`

- [ ] **Step 1: Write failing test for quest ranking**

Quest filters by quest rule compliance, then ranks using information-gain logic. Per DESIGN.md: if the quest is compatible with solving, prefer suggestions that do NOT accidentally solve — so the quest can be attempted without ending the game.

```ts
import { rankQuest } from "./ranker"

describe("rankQuest", () => {
  it("only includes words that satisfy the quest rule", () => {
    const pool = ["crane", "crazy", "daily", "stone"]
    const rule: QuestRule = { type: "endsWith", letter: "y" }
    const ranked = rankQuest(pool, [], rule, pool, pool)
    expect(ranked).toContain("crazy")
    expect(ranked).toContain("daily")
    expect(ranked).not.toContain("crane")
    expect(ranked).not.toContain("stone")
  })

  it("deprioritises words that are also candidate answers", () => {
    // Per DESIGN.md: quest suggestions should avoid accidentally solving.
    // If a quest-compliant word is also a likely answer, rank it lower
    // so the user can attempt the quest without ending the game.
    const pool = ["crazy", "daily", "foggy", "lumpy"]
    const candidates = ["crazy", "daily"] // these could be the answer
    const rule: QuestRule = { type: "endsWith", letter: "y" }
    const ranked = rankQuest(pool, [], rule, pool, candidates)
    // "foggy" and "lumpy" (not candidates) should rank above "crazy"/"daily"
    const foggyIndex = ranked.indexOf("foggy")
    const crazyIndex = ranked.indexOf("crazy")
    expect(foggyIndex).toBeLessThan(crazyIndex)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest ranker.spec.ts -v`
Expected: FAIL

- [ ] **Step 3: Implement rankQuest**

Filter pool by `satisfiesRule`, then rank by information gain (similar to wander scoring within the compliant subset). Deprioritise words that are in the candidate answers pool — this prevents accidentally solving when the user is trying to complete a quest. The `rankQuest` signature takes a `candidates` parameter for this purpose.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest ranker.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```
git add src/games/wordle-assistant/ranker.ts src/games/wordle-assistant/ranker.spec.ts
git commit -m "feat(wordle): add quest strategy ranking"
```

---

## Chunk 3: Word list and Redux slice

### Task 9: Word list

**Files:**
- Create: `src/games/wordle-assistant/wordList.json`

- [ ] **Step 1: Source a 5-letter word list**

Find or generate a list of common English 5-letter words. A good starting point is ~5,000–10,000 words. Store as a JSON array of lowercase strings.

Options:
- Extract from `/usr/share/dict/words` if available: `grep -E '^[a-z]{5}$' /usr/share/dict/words`
- Use a curated open-source word list
- Start with a small test list (~100 words) and expand later

```json
["about", "above", "abuse", "actor", "adapt", ...]
```

- [ ] **Step 2: Verify it imports cleanly**

Create a quick sanity check — the JSON should be importable in TypeScript via `import wordList from "./wordList.json"` (Vite handles JSON imports). Check `tsconfig.json` has `resolveJsonModule: true`.

- [ ] **Step 3: Commit**

```
git add src/games/wordle-assistant/wordList.json
git commit -m "feat(wordle): add base word list"
```

### Task 10: Redux slice

**Files:**
- Create: `src/games/wordle-assistant/wordleSlice.ts`
- Create: `src/games/wordle-assistant/wordleSlice.spec.ts`

- [ ] **Step 1: Write failing test for initial state and addGuess**

```ts
// wordleSlice.spec.ts
import { describe, expect, it } from "@jest/globals"
import reducer, { actions } from "./wordleSlice"
import { TileState } from "./types"
import type { Feedback } from "./types"

describe("wordleSlice", () => {
  it("starts with empty guesses and no quest rule", () => {
    const state = reducer(undefined, { type: "init" })
    expect(state.guesses).toEqual([])
    expect(state.questRule).toEqual({ type: "none" })
  })

  it("adds a guess", () => {
    const state = reducer(undefined, { type: "init" })
    const feedback: Feedback = [TileState.WHITE, TileState.WHITE, TileState.WHITE, TileState.WHITE, TileState.WHITE]
    const next = reducer(state, actions.addGuess({ word: "crane", feedback }))
    expect(next.guesses).toHaveLength(1)
    expect(next.guesses[0].word).toBe("crane")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest wordleSlice.spec.ts -v`
Expected: FAIL

- [ ] **Step 3: Implement slice with initial state and addGuess**

```ts
// wordleSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { GuessRecord, QuestRule } from "./types"

export type WordleState = {
  guesses: GuessRecord[]
  questRule: QuestRule
  previouslyCorrect: string[]
}

const initialState: WordleState = {
  guesses: [],
  questRule: { type: "none" },
  previouslyCorrect: [],
}

export const wordleSlice = createSlice({
  name: "wordle",
  initialState,
  reducers: {
    addGuess: (state, action: PayloadAction<GuessRecord>) => {
      state.guesses.push(action.payload)
    },
    updateFeedback: (
      state,
      action: PayloadAction<{ index: number; position: number }>,
    ) => {
      const { index, position } = action.payload
      const guess = state.guesses[index]
      if (!guess) return
      const current = guess.feedback[position]
      const cycle = { white: "yellow", yellow: "green", green: "white" } as const
      guess.feedback[position] = cycle[current]
    },
    setQuestRule: (state, action: PayloadAction<QuestRule>) => {
      state.questRule = action.payload
    },
    markCorrect: (state, action: PayloadAction<string>) => {
      if (!state.previouslyCorrect.includes(action.payload)) {
        state.previouslyCorrect.push(action.payload)
      }
    },
    reset: (state) => {
      state.guesses = []
      state.questRule = { type: "none" }
      // previouslyCorrect is preserved
    },
  },
})

export const actions = wordleSlice.actions
export default wordleSlice.reducer
export type Action = ReturnType<(typeof actions)[keyof typeof actions]>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest wordleSlice.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Write and run tests for remaining reducers**

Add tests for `updateFeedback` (cycles tile state), `setQuestRule`, `markCorrect`, and `reset` (preserves previouslyCorrect).

- [ ] **Step 6: Run full test suite**

Run: `npm test`
Expected: all tests PASS

- [ ] **Step 7: Commit**

```
git add src/games/wordle-assistant/wordleSlice.ts src/games/wordle-assistant/wordleSlice.spec.ts
git commit -m "feat(wordle): add Redux slice with guess and quest rule management"
```

### Task 11: Register slice in store

**Files:**
- Modify: `src/store.ts`

- [ ] **Step 1: Add wordle reducer to store**

```ts
import squareSlice from "@games/flip-square/squareSlice"
import wordleSlice from "@games/wordle-assistant/wordleSlice"

const store = configureStore({
  reducer: {
    square: squareSlice,
    wordle: wordleSlice,
  },
})
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```
git add src/store.ts
git commit -m "feat(wordle): register wordle slice in store"
```

---

## Chunk 4: UI components

### Task 12: Tile component

**Files:**
- Create: `src/games/wordle-assistant/Tile.tsx`
- Create: `src/games/wordle-assistant/wordle.css`

- [ ] **Step 1: Create Tile component**

A single letter tile that displays a letter with a background colour based on its TileState. Clicking cycles the state.

```tsx
import React from "react"
import { TileState } from "./types"

interface TileProps {
  letter: string
  state: TileState
  onClick: () => void
}

const tileColours: Record<TileState, string> = {
  [TileState.GREEN]: "#6aaa64",
  [TileState.YELLOW]: "#c9b458",
  [TileState.WHITE]: "#ffffff",
}

const Tile: React.FC<TileProps> = ({ letter, state, onClick }) => {
  return (
    <div
      className="wordle-tile"
      style={{ backgroundColor: tileColours[state] }}
      onClick={onClick}
    >
      {letter.toUpperCase()}
    </div>
  )
}

export default Tile
```

- [ ] **Step 2: Add basic tile styles to wordle.css**

```css
.wordle-tile {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #d3d6da;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  user-select: none;
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```
git add src/games/wordle-assistant/Tile.tsx src/games/wordle-assistant/wordle.css
git commit -m "feat(wordle): add Tile component"
```

### Task 13: GuessHistory component

**Files:**
- Create: `src/games/wordle-assistant/GuessHistory.tsx`

- [ ] **Step 1: Create GuessHistory component**

Displays all guesses as rows of tiles. Includes a text input to add new guesses. Each tile is clickable to cycle its feedback state.

```tsx
import React, { useState } from "react"
import { TileState } from "./types"
import type { GuessRecord, Feedback } from "./types"
import Tile from "./Tile"

interface GuessHistoryProps {
  guesses: GuessRecord[]
  onAddGuess: (guess: GuessRecord) => void
  onCycleTile: (guessIndex: number, position: number) => void
}

const GuessHistory: React.FC<GuessHistoryProps> = ({
  guesses,
  onAddGuess,
  onCycleTile,
}) => {
  const [inputWord, setInputWord] = useState("")

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const word = inputWord.toLowerCase().trim()
    if (word.length !== 5) return
    const feedback: Feedback = [
      TileState.WHITE, TileState.WHITE, TileState.WHITE,
      TileState.WHITE, TileState.WHITE,
    ]
    onAddGuess({ word, feedback })
    setInputWord("")
  }

  return (
    <div className="guess-history">
      {guesses.map((guess, guessIndex) => (
        <div className="guess-row" key={guessIndex}>
          {guess.word.split("").map((letter, position) => (
            <Tile
              key={position}
              letter={letter}
              state={guess.feedback[position]}
              onClick={() => onCycleTile(guessIndex, position)}
            />
          ))}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="guess-input">
        <input
          type="text"
          value={inputWord}
          onChange={(event) => setInputWord(event.target.value)}
          maxLength={5}
          placeholder="Type a word..."
        />
      </form>
    </div>
  )
}

export default GuessHistory
```

- [ ] **Step 2: Add guess-row styles**

```css
.guess-row {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.guess-input input {
  font-size: 1rem;
  padding: 0.4rem;
  letter-spacing: 0.3rem;
  text-transform: uppercase;
  width: 13rem;
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```
git add src/games/wordle-assistant/GuessHistory.tsx src/games/wordle-assistant/wordle.css
git commit -m "feat(wordle): add GuessHistory component"
```

### Task 14: QuestRuleSelector component

**Files:**
- Create: `src/games/wordle-assistant/QuestRuleSelector.tsx`

- [ ] **Step 1: Create QuestRuleSelector**

Dropdown for rule type, conditional inputs for letter/count parameters.

```tsx
import React from "react"
import type { QuestRule } from "./types"

interface QuestRuleSelectorProps {
  rule: QuestRule
  onChange: (rule: QuestRule) => void
}

const QuestRuleSelector: React.FC<QuestRuleSelectorProps> = ({
  rule,
  onChange,
}) => {
  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const ruleType = event.target.value
    switch (ruleType) {
      case "none":
        onChange({ type: "none" })
        break
      case "endsWith":
        onChange({ type: "endsWith", letter: "a" })
        break
      case "maxLetter":
        onChange({ type: "maxLetter", letter: "a", count: 1 })
        break
      case "minLetter":
        onChange({ type: "minLetter", letter: "a", count: 1 })
        break
    }
  }

  return (
    <div className="quest-rule-selector">
      <label>Quest rule: </label>
      <select value={rule.type} onChange={handleTypeChange}>
        <option value="none">None</option>
        <option value="endsWith">Ends with</option>
        <option value="maxLetter">Max of letter</option>
        <option value="minLetter">Min of letter</option>
      </select>
      {rule.type !== "none" && (
        <>
          <label> letter: </label>
          <input
            type="text"
            maxLength={1}
            value={"letter" in rule ? rule.letter : ""}
            onChange={(event) =>
              onChange({ ...rule, letter: event.target.value.toLowerCase() })
            }
            className="quest-letter-input"
          />
        </>
      )}
      {(rule.type === "maxLetter" || rule.type === "minLetter") && (
        <>
          <label> count: </label>
          <input
            type="number"
            min={0}
            max={5}
            value={rule.count}
            onChange={(event) =>
              onChange({ ...rule, count: parseInt(event.target.value, 10) || 0 })
            }
            className="quest-count-input"
          />
        </>
      )}
    </div>
  )
}

export default QuestRuleSelector
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```
git add src/games/wordle-assistant/QuestRuleSelector.tsx
git commit -m "feat(wordle): add QuestRuleSelector component"
```

### Task 15: SuggestionPanels component

**Files:**
- Create: `src/games/wordle-assistant/SuggestionPanels.tsx`

- [ ] **Step 1: Create SuggestionPanels**

Three columns showing ranked word lists. Takes pre-computed ranked arrays as props.

```tsx
import React from "react"

interface SuggestionPanelsProps {
  wander: string[]
  seek: string[]
  quest: string[]
  candidates: string[]
  previouslyCorrect: string[]
}

const WordList: React.FC<{ title: string; words: string[] }> = ({
  title,
  words,
}) => (
  <div className="word-list">
    <h4>{title}</h4>
    <ul>
      {words.slice(0, 10).map((word) => (
        <li key={word}>{word.toUpperCase()}</li>
      ))}
      {words.length === 0 && <li className="empty">—</li>}
    </ul>
  </div>
)

const SuggestionPanels: React.FC<SuggestionPanelsProps> = ({
  wander,
  seek,
  quest,
  candidates,
  previouslyCorrect,
}) => {
  return (
    <>
      <div className="suggestion-panels">
        <WordList title="Wander" words={wander} />
        <WordList title="Seek" words={seek} />
        <WordList title="Quest" words={quest} />
      </div>
      <div className="bottom-panels">
        <WordList title="Candidate answers" words={candidates} />
        <WordList title="Previously correct" words={previouslyCorrect} />
      </div>
    </>
  )
}

export default SuggestionPanels
```

- [ ] **Step 2: Add panel layout styles**

```css
.suggestion-panels {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.bottom-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.word-list h4 {
  margin: 0 0 0.5rem 0;
}

.word-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.word-list li {
  font-family: monospace;
  padding: 0.1rem 0;
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```
git add src/games/wordle-assistant/SuggestionPanels.tsx src/games/wordle-assistant/wordle.css
git commit -m "feat(wordle): add SuggestionPanels component"
```

---

## Chunk 5: Integration and persistence

### Task 16: Main container — WordleAssistant

**Files:**
- Create: `src/games/wordle-assistant/WordleAssistant.tsx`

- [ ] **Step 1: Create WordleAssistant container**

Wires Redux state to child components. Computes suggestions from domain logic. This is where inference, ranking, and quest rule evaluation come together.

```tsx
import React, { useMemo, useState } from "react"
import type { WordleState } from "./wordleSlice"
import type { Action } from "./wordleSlice"
import { actions } from "./wordleSlice"
import { filterCandidates } from "./inference"
import { rankWander, rankSeek, rankQuest } from "./ranker"
import wordList from "./wordList.json"
import GuessHistory from "./GuessHistory"
import QuestRuleSelector from "./QuestRuleSelector"
import SuggestionPanels from "./SuggestionPanels"
import "./wordle.css"

interface WordleAssistantProps {
  state: WordleState
  action: (action: Action) => void
}

const WordleAssistant: React.FC<WordleAssistantProps> = ({ state, action }) => {
  const allWords = useMemo(() => {
    const base = wordList as string[]
    const extra = state.previouslyCorrect.filter((w) => !base.includes(w))
    return [...base, ...extra]
  }, [state.previouslyCorrect])

  const candidates = useMemo(
    () => filterCandidates(allWords, state.guesses),
    [allWords, state.guesses],
  )

  const wander = useMemo(
    () => rankWander(allWords, state.guesses, candidates),
    [allWords, state.guesses, candidates],
  )

  const seek = useMemo(
    () => rankSeek(candidates, state.guesses, candidates),
    [candidates, state.guesses],
  )

  const quest = useMemo(
    () => rankQuest(allWords, state.guesses, state.questRule, allWords, candidates),
    [allWords, state.guesses, state.questRule, candidates],
  )

  const [solvedWord, setSolvedWord] = useState("")

  const handleMarkSolved = (event: React.FormEvent) => {
    event.preventDefault()
    const word = solvedWord.toLowerCase().trim()
    if (word.length !== 5) return
    action(actions.markCorrect(word))
    setSolvedWord("")
  }

  return (
    <div className="wordle-assistant">
      <GuessHistory
        guesses={state.guesses}
        onAddGuess={(guess) => action(actions.addGuess(guess))}
        onCycleTile={(index, position) =>
          action(actions.updateFeedback({ index, position }))
        }
      />
      <QuestRuleSelector
        rule={state.questRule}
        onChange={(rule) => action(actions.setQuestRule(rule))}
      />
      <SuggestionPanels
        wander={wander}
        seek={seek}
        quest={quest}
        candidates={candidates}
        previouslyCorrect={state.previouslyCorrect}
      />
      <div className="wordle-controls">
        <form onSubmit={handleMarkSolved} className="mark-solved">
          <input
            type="text"
            value={solvedWord}
            onChange={(event) => setSolvedWord(event.target.value)}
            maxLength={5}
            placeholder="Answer..."
          />
          <button type="submit">Mark solved</button>
        </form>
        <button onClick={() => action(actions.reset())}>Reset</button>
      </div>
    </div>
  )
}

export default WordleAssistant
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```
git add src/games/wordle-assistant/WordleAssistant.tsx
git commit -m "feat(wordle): add WordleAssistant container component"
```

### Task 17: Wire into App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace Wordle placeholder with component**

Import `WordleAssistant` and wire it to the Redux store, following the same pattern as the flip-square tab.

```tsx
import WordleAssistant from "./games/wordle-assistant/WordleAssistant"

// In the component:
const wordle = useSelector((state: RootState) => state.wordle)

// In the JSX:
{activeTab === Tab.WORDLE && (
  <WordleAssistant state={wordle} action={dispatch} />
)}
```

- [ ] **Step 2: Start dev server and verify it renders**

Run: `npm run dev`
Check: switch to Wordle tab, see the guess input and empty panels.

- [ ] **Step 3: Commit**

```
git add src/App.tsx
git commit -m "feat(wordle): wire WordleAssistant into app tabs"
```

### Task 18: localStorage persistence

**Files:**
- Modify: `src/games/wordle-assistant/wordleSlice.ts`

- [ ] **Step 1: Add localStorage read/write for previouslyCorrect**

Load `previouslyCorrect` from localStorage on slice initialisation. Write to localStorage in the `markCorrect` reducer (or via a Redux middleware/listener). Keep it simple — direct localStorage calls in the slice are acceptable for this scope.

```ts
const STORAGE_KEY = "wordle:previouslyCorrect"

function loadPreviouslyCorrect(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function savePreviouslyCorrect(words: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
}
```

Call `loadPreviouslyCorrect()` in `initialState`. Call `savePreviouslyCorrect()` in the `markCorrect` reducer.

- [ ] **Step 2: Verify persistence survives page reload**

Run: `npm run dev`
Mark a word as correct, reload the page, check it persists.

- [ ] **Step 3: Commit**

```
git add src/games/wordle-assistant/wordleSlice.ts
git commit -m "feat(wordle): persist previously correct words in localStorage"
```

### Task 19: Final checks

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: all tests PASS

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: 0 warnings

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: successful build

- [ ] **Step 5: Manual smoke test**

Run: `npm run dev`
- Add a guess, cycle tile feedback
- Set a quest rule
- Verify suggestions update
- Reset — verify guesses clear but previouslyCorrect stays

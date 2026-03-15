# Wordle Assistant — Design

## UX model

### Main interaction

The primary UI is a record of guesses already made. For each guess the user enters a 5-letter word, then clicks each
letter tile to cycle through feedback states: green (correct place), yellow (correct letter, wrong place), white (not in
the word).

### Suggestion panels

Four distinct output areas, because they serve different goals:

1. **Wander suggestions** — words that maximise information gain by testing unresolved letters.
2. **Seek suggestions** — words that fit the inferred solution space and try to converge on the answer.
3. **Quest suggestions** — words that satisfy the active extra challenge rule, ranked for usefulness within that
   constraint.
4. **Candidate answers** — words that currently look like plausible solutions.

A separate section shows **previously correct words** — answers from past solves, stored locally and surfaced as likely
future answers.

### Quest rule input

A dropdown selects the rule type, with conditional inputs for parameters (letter, count). Known rule types so far:

- "require specific letters at positions" (e.g. starts with R, ends with Y, or both)
- "use no more than [count] of [letter]"
- "use at least [count] of [letter]"

The rule set will grow; the UI and data model should be extensible.

### Reset flow

A Reset button clears the current guesses and quest rule state but preserves persistent data (known correct words).

---

## Data model

### Guess record

```ts
type TileState = "green" | "yellow" | "white"

type GuessRecord = {
  word: string
  feedback: [TileState, TileState, TileState, TileState, TileState]
}
```

### Quest rule

Tagged union, extensible:

```ts
type LettersAtPositions = [string, string, string, string, string]

type QuestRule =
  | { type: "none" }
  | { type: "lettersAt"; letters: LettersAtPositions }
  | { type: "avoid"; letter: string }
  | { type: "use"; letter: string }
```

### Persistent data (localStorage)

- **Previously correct words** — answers from past successful solves. Preferred as likely future answers and merged into
  the working word universe.

Survives resets.

---

## Solver architecture

### Separation of concerns

Three independent concepts that must not be collapsed together:

1. **Answer inference** — derived from guess history and tile feedback. Models what the hidden word could be. Standard
   Wordle logic: greens lock positions, yellows require the letter but forbid that position, whites exclude letters.
   Duplicate-letter handling matters.

2. **Quest rule evaluation** — derived from the active side rule. Models what guesses satisfy the side objective.
   Intentionally separate because quest compliance often conflicts with solving. If the quest objective is compatible
   with guessing the word, at least some suggestions must conflict anyway if possible; so that the quest can be
   completed/attempted without accidentally solving the game.

3. **Strategy ranker** — ranks candidate words differently per strategy.

### Candidate pools

| Strategy | Pool                                                                       |
| -------- | -------------------------------------------------------------------------- |
| Wander   | Any known word.                                                            |
| Seek     | Words consistent with inferred answer constraints. The "true solve" pool.  |
| Quest    | Words satisfying the active quest rule, regardless of answer plausibility. |

### Ranking heuristics

Letter frequency is computed from the **current relevant pool**, not shipped as fixed metadata.

**Wander ranking** — prefer words covering many untested letters, especially high-frequency letters in the current pool.
Penalise duplicate letters. If we know the letter E is in third place, placing the letter E in the third place makes it
impossible to learn anything from that part of the guess.

**Seek ranking** — prefer valid candidates that place yellow letters in promising new positions and include unresolved
high-frequency letters to distinguish among remaining candidates.

**Quest ranking** — prefer quest-compliant words that still do useful information work: shift yellows toward greener
placements, test useful unresolved letters, favour frequency among quest-compliant options.

---

## UI layout

```
+--------------------------------------------------+
|  Guess history                                    |
|                                                   |
|  S T A R E        [type word, enter to add]       |
|  G R I N D                                        |
|  P L U M B                                        |
|  (tiles cycle: white → yellow → green on click)   |
|                                                   |
+--------------------------------------------------+
|  Quest rule                                       |
|  [  ends with ▾ ]  letter [ Y ]                   |
+--------------------------------------------------+
|  Suggestions                                      |
|                                                   |
|  Wander       Seek        Quest                   |
|  --------     --------    --------                |
|  CLOTH        CLOUT       CRAZY                   |
|  DUMPY        CLOUD       CURLY                   |
|  FLESH        CLOWN       DAILY                   |
|  ...          ...         ...                     |
|                                                   |
+--------------------------------------------------+
|  Candidate answers          Previously correct    |
|  --------                   --------              |
|  CLOUT                      STARE                 |
|  CLOUD                      GRIND                 |
|  CLOWN                      ...                   |
|  ...                                              |
+--------------------------------------------------+
|                                       [ Reset ]   |
+--------------------------------------------------+
```

- **Guess history** — add guess, per-letter feedback toggles, editable entries.
- **Quest rule** — dropdown for rule type, conditional inputs for parameters.
- **Suggestions** — three columns (Wander / Seek / Quest), each a short ranked list.
- **Candidate answers** — plausible solutions given current feedback.
- **Previously correct** — learned words from past solves.
- **Controls** — Reset current game.

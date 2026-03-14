# Wordle Helper Implementation Summary

## Purpose

Build a **client-side functional TypeScript app** that helps solve **5-letter Wordle-like puzzles**, not a Wordle game itself.

The target use case is broader than standard Wordle:

* It should work with **generic 5-letter word lists**, not a hardcoded answer list.
* It targets a **minigame inside another game**.
* That minigame may add **extra challenge rules** on guesses.
* Those extra rules may **conflict with the actual solution**, so they must be handled separately in the UI and logic.

The current Python script works but is inefficient and ad hoc. The new app should have real UX and a cleaner solver architecture.

---

# Product definition

## This is a helper, not a game

The app does **not** generate puzzles or evaluate guesses from a hidden word.

Instead, the user already plays elsewhere and manually records:

* the guessed word
* per-letter feedback:

  * green = correct place
  * yellow = correct letter, wrong place
  * white = not in the word

The helper then suggests useful next guesses.

---

# Core UX model

## Main interaction

The primary UI is a **record of guesses already made**.

For each guess:

* the user enters a 5-letter word
* each letter tile can be clicked to cycle through:

  * green
  * yellow
  * white

This becomes the known state used for inference.

## Output areas

The UI should expose distinct suggestion blocks, because they serve different goals.

### 1. Wander suggestions

Guesses that maximize information gain by testing letters not yet tested or not yet resolved.

### 2. Seek suggestions

Guesses that fit the currently inferred solution space and try to converge on the correct word.

### 3. Quest suggestions

Guesses that satisfy the current extra challenge rule, even when that conflicts with solving efficiently.

### 4. Candidate correct words

Words that currently look like plausible solutions.

### 5. Previously guessed correct words

Words known from past successful solves, stored locally and preferred as plausible future answers.

## Reset flow

There should be a **Reset** button that:

* ends the current puzzle
* clears current guesses and current extra-rule state
* starts a fresh session

It should **not** clear persistent history like known-correct words or custom added words.

---

# Important domain insight

## The dictionary is not a trusted full answer set

You do have access to the actual answer list for the target puzzle, but you explicitly **do not want to use it**.

Instead the helper should use:

* a generic long list of 5-letter words
* plus locally learned words from successful solves
* plus manually added custom words

Reasoning:

* the tool should remain useful for any 5-letter Wordle-like puzzle
* some puzzles may accept strange or broken words
* persistent local knowledge lets the helper adapt over time

Example use case:

* If some badly coded puzzle accepts `"AAAAA"` as a valid answer, the tool should be able to learn and use that.

---

# Persistent local data

Use `localStorage` for at least two persistent sets.

## 1. Previously correct words

Store words that were actually the answer in prior games.

Purpose:

* prefer them as likely future correct words
* make the solver adapt to the target minigame over time

## 2. Custom words

Store words manually added by the user that were missing from the base dictionary.

Purpose:

* support nonstandard accepted words
* make the helper resilient to broken or unusual puzzles

These should survive resets.

---

# Extra challenge rules

## Core insight

The extra rules are **not part of the true solution constraints**.

They are side objectives imposed on guesses, and they often conflict with guessing the correct answer.

Example:

* “use five words ending in Y”
* but the actual answer contains no Y

This is why these rules must be represented separately from the inferred answer constraints.

## Consequence for implementation

Do **not** merge extra rules into the core candidate-answer solver by default.

Instead:

* core answer inference should model what the hidden word could be
* quest/extra-rule filtering should model what guesses satisfy the side objective

That separation is essential.

## Expected rule types

You do not yet have the final full list, but current examples include:

* “use words ending with Y”
* “use no more than X of letter Y”
* “use at least X of letter Y”

Likely implementation approach:

* a **dropdown** for rule type
* then one or more inputs for:

  * letter
  * count
  * maybe other parameters depending on rule

This is considered sufficient and appropriate UX.

---

# Strategy model

You settled on three named strategies:

* **Wander**
* **Seek**
* **Quest**

These names were chosen partly because they can be abbreviated cleanly as:

* W
* S
* Q

## 1. Wander

### Goal

Gain information by testing letters that have not yet been tested or resolved.

### Heuristic

Prefer words with:

* letters not yet used
* especially letters common in the current plausible word space

### Important insight

You do **not** need separate precomputed global frequency data.

Instead, frequency can be computed from the **current relevant word list**.

That was an explicit insight during the discussion.

### Practical interpretation

Wander is exploratory. It is about coverage, not directly about fitting all current limits.

---

## 2. Seek

### Goal

Find the actual answer.

### Heuristic

Prefer words that:

* fit the currently inferred limits
* place yellow letters in new positions that may turn them green
* use still-untested letters chosen by frequency
* move toward the most likely valid answer

### Practical interpretation

Seek is exploitative rather than exploratory. It is the main solving strategy.

---

## 3. Quest

### Goal

Follow the current extra challenge rule.

### Heuristic

Restrict candidate guesses to words that satisfy the current side rule, then rank them using similar ideas:

* shift yellow letters toward greener placements
* test useful unused letters
* use frequency guidance

### Important insight

Quest is intentionally separate because complying with the side rule may be strategically bad for solving.

---

# Solver architecture

## Separation of concerns

The implementation should treat these as distinct concepts:

### A. Inferred answer constraints

Derived from entered guesses and tile feedback.

This models what the hidden answer could be.

### B. Extra quest rule

Derived from the current dropdown-selected side rule.

This models what guesses are allowed or encouraged for the side objective.

### C. Strategy scorer/ranker

Ranks words differently depending on whether the user wants Wander, Seek, or Quest behavior.

This separation is important. It prevents the app from collapsing everything into one filter and losing useful flexibility.

---

# Recommended data model

## Base dictionary

A list of 5-letter words loaded client-side.

## Learned dictionary extensions

Persistent user-derived words:

* custom words
* previously correct words

These should be merged into the working guess universe.

## Guess record

For each guess, store:

* the 5-letter word
* the 5 feedback states

Possible shape:

```ts
type TileState = "green" | "yellow" | "white";

type GuessRecord = {
  word: string;
  feedback: [TileState, TileState, TileState, TileState, TileState];
};
```

## Quest rule

Model as a tagged union / discriminated union.

Example shape:

```ts
type QuestRule =
  | { type: "none" }
  | { type: "endsWith"; letter: string }
  | { type: "maxLetter"; letter: string; count: number }
  | { type: "minLetter"; letter: string; count: number };
```

You can extend this once the exact rule set is finalized.

---

# Filtering and ranking model

## Core filtering

Given the current guess history, derive the current set of plausible answer candidates.

This requires standard Wordle-like inference logic:

* greens lock letters to positions
* yellows require the letter but forbid that position
* whites exclude letters, with correct handling for repeated letters

Duplicate-letter handling matters.

## Separate quest filtering

Given a quest rule, derive the set of words that satisfy the side objective.

This should not replace core answer inference.

Instead it supports the Quest strategy and possibly a separate UI panel.

---

# Strategy-specific candidate pools

## Wander candidate pool

Likely based on a broad word universe, not only the strict current answer candidates.

Reason:

* Wander is about testing informative letters
* exploratory guesses may intentionally not be likely answers

Possible pool:

* all known valid 5-letter words
* minus obviously impossible/useless words if desired

## Seek candidate pool

The set of words consistent with the currently inferred answer constraints.

This is the “true solve” pool.

## Quest candidate pool

The set of words satisfying the active quest rule.

Depending on final UX, this may be:

* pure quest-compliant words, regardless of answer plausibility
* or quest-compliant words intersected with current answer constraints

But the discussion strongly implies the pure quest-compliant list is important even when it conflicts.

---

# Ranking heuristics

## Frequency-based scoring

A central insight was that frequency should be computed from the **current word list**, not provided separately.

This means:

* when ranking Wander suggestions, compute useful letter frequencies from the current broad pool
* when ranking Seek suggestions, compute frequencies from the current plausible-answer pool
* when ranking Quest suggestions, compute frequencies from the quest-compliant pool

## Wander ranking

Prefer words that:

* cover many as-yet-untested letters
* avoid wasting slots on already-settled letters
* include high-frequency letters from the current pool

Penalty or reduced value for duplicate letters is probably desirable.

## Seek ranking

Prefer words that:

* remain valid candidates
* place yellow letters into promising new positions
* include unresolved letters that distinguish among current candidates
* use frequency among remaining candidate answers

## Quest ranking

Prefer words that:

* satisfy the active extra rule
* still do useful information work where possible
* shift yellow letters
* test useful unresolved letters
* use frequency among quest-compliant options

---

# Suggested UI structure

## Main layout

### Guess history section

* add guess
* per-letter feedback toggles
* editable existing entries if needed

### Strategy suggestions section

Three blocks or tabs:

* Wander
* Seek
* Quest

Each should show a short list of suggested words.

### Candidate answers section

A list of words that currently look like plausible correct answers.

### Quest rule section

* dropdown for rule type
* conditional inputs for numbers/letters

### Learned words section

* previously correct words
* maybe custom added words

### Controls

* Reset current game
* Add custom word

---

# Use cases defined during discussion

## Use case: normal solving

User enters guesses and feedback, then uses Seek to narrow down the answer.

## Use case: exploratory early play

User uses Wander to maximize information from an early guess rather than immediately chasing a candidate.

## Use case: side objective conflict

User needs to follow a weird rule for one or more guesses, even though it hurts optimal solving, so they consult Quest.

## Use case: target puzzle has a biased or recurring answer set

Previously correct words are stored and reused, making future solves more effective.

## Use case: broken or custom puzzle accepts weird words

User adds those words to local storage so the helper can support them permanently.

## Use case: same helper across multiple 5-letter Wordles

Because the app does not depend on one hardcoded answer set, it remains generally reusable.

---

# Non-goals / clarified boundaries

## Not a Wordle clone

The app does not need to:

* choose a secret word
* calculate feedback from user guesses
* act as a standalone play experience

The user supplies the feedback manually.

## Not answer-list cheating

Even though the exact answer list exists, the design intentionally avoids depending on it.

That is a deliberate product choice.

---

# Technical direction

## Language/runtime

* functional TypeScript
* client-side
* likely localStorage for persistence

## General style

Favour pure functions and clean separation between:

* inference
* quest-rule evaluation
* ranking

This matches the intended architecture and your general coding preferences.

---

# Recommended implementation breakdown

## 1. Core domain layer

Implement pure logic for:

* guess record representation
* inference from feedback
* candidate filtering
* quest-rule evaluation
* letter frequency calculation
* ranking functions for Wander / Seek / Quest

## 2. Persistence layer

Implement localStorage helpers for:

* previously correct words
* custom words
* possibly current session state later, if desired

## 3. UI layer

Implement:

* guess list editor
* feedback toggles
* quest-rule selector
* strategy suggestion panels
* candidate answer list
* reset and custom-word controls

## 4. Refinement

After exact quest rule variants are known:

* extend the quest rule union
* add corresponding evaluators
* refine Quest ranking accordingly

---

# Key insights to preserve

1. **This is a solver helper, not a game.**
2. **Do not use the true answer list, even if available.**
3. **Extra rules are side objectives and can conflict with the actual answer.**
4. **Therefore extra rules must be modeled separately from core answer inference.**
5. **Frequency should be computed from the current relevant word pool, not shipped as fixed metadata.**
6. **Three strategies are enough and well-defined: Wander, Seek, Quest.**
7. **Persisting previously correct words and custom words makes the helper adaptive over time.**
8. **A dropdown plus parameter inputs is the right UI for extra rules.**

---

# Final naming decision

Use these final strategy names:

* **Wander**
* **Seek**
* **Quest**

These are the chosen terms for the implementation and UI.

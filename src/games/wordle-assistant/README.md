# Wordle Assistant

A generic client-side helper for 5-letter Wordle-like puzzles. Not a game — the user plays elsewhere and records guesses
and feedback here to get suggestions.

The assistant makes no assumptions about which variant is being played. Variant-specific mechanics — like the original
Wordle's hard mode locking in found letters — are handled through the quest rule system. The assistant suggests; the
user is responsible for following whatever rules their puzzle enforces.

## Key design principles

- **Helper, not a clone.** The app never generates puzzles or evaluates guesses. The user supplies tile feedback
  manually.
- **No hardcoded answer list.** Uses a generic word list plus locally learned words, so it works across different
  Wordle-like puzzles.
- **Quest rules are separate.** Some puzzles impose side objectives on guesses (e.g. "use words ending in Y") that
  conflict with actually solving. These are modelled independently of answer inference.
- **Adaptive over time.** Previously correct answers persist in localStorage, improving suggestions for recurring puzzle sets.

## Three strategies

| Strategy   | Purpose                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| **Wander** | Explore — test untried letters, maximise information gain                    |
| **Seek**   | Solve — narrow down the actual answer                                        |
| **Quest**  | Comply — satisfy the current side-objective rule, even when it hurts solving |

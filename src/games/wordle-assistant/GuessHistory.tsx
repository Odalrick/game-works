import React, { useMemo } from "react"
import { TileState } from "./types"
import type { GuessRecord, Feedback } from "./types"
import Tile from "./Tile"

interface GuessHistoryProps {
  guesses: GuessRecord[]
  editableIndex: number
  onEditableChange: (index: number) => void
  onAddGuess: (guess: GuessRecord) => void
  onCycleTile: (guessIndex: number, position: number) => void
  onReverseCycleTile: (guessIndex: number, position: number) => void
  inputWord: string
  onInputChange: (word: string) => void
}

function computeConflicts(guesses: GuessRecord[]): Set<string> {
  const conflicts = new Set<string>()
  for (let position = 0; position < 5; position++) {
    let greenLetter: string | undefined
    let hasConflictingGreens = false
    for (let guessIndex = 0; guessIndex < guesses.length; guessIndex++) {
      const letter = guesses[guessIndex].word[position]
      const state = guesses[guessIndex].feedback[position]
      if (state === TileState.GREEN) {
        if (greenLetter === undefined) {
          greenLetter = letter
        } else if (letter !== greenLetter) {
          hasConflictingGreens = true
        }
      }
    }
    if (greenLetter !== undefined) {
      for (let guessIndex = 0; guessIndex < guesses.length; guessIndex++) {
        const letter = guesses[guessIndex].word[position]
        const state = guesses[guessIndex].feedback[position]
        if (state === TileState.GREEN && hasConflictingGreens) {
          conflicts.add(`${guessIndex}:${position}`)
        } else if (state !== TileState.GREEN && letter === greenLetter) {
          conflicts.add(`${guessIndex}:${position}`)
        }
      }
    }
  }
  return conflicts
}

function prefillFeedback(word: string, guesses: GuessRecord[]): Feedback {
  const feedback: Feedback = [
    TileState.WHITE,
    TileState.WHITE,
    TileState.WHITE,
    TileState.WHITE,
    TileState.WHITE,
  ]
  for (let position = 0; position < 5; position++) {
    for (const guess of guesses) {
      if (
        guess.feedback[position] === TileState.GREEN &&
        guess.word[position] === word[position]
      ) {
        feedback[position] = TileState.GREEN
        break
      }
    }
  }
  return feedback
}

const GuessHistory: React.FC<GuessHistoryProps> = ({
  guesses,
  editableIndex,
  onEditableChange,
  onAddGuess,
  onCycleTile,
  onReverseCycleTile,
  inputWord,
  onInputChange,
}) => {
  const conflicts = useMemo(() => computeConflicts(guesses), [guesses])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const word = inputWord.toLowerCase().trim()
    if (word.length !== 5) return
    const feedback = prefillFeedback(word, guesses)
    onAddGuess({ word, feedback })
    onInputChange("")
  }

  return (
    <div className="guess-history">
      <h4>Guesses</h4>
      <div className="guess-history-body">
        {guesses.length === 0 && (
          <p className="guess-empty">No guesses yet — type a word below.</p>
        )}
        {guesses.map((guess, guessIndex) => (
          <div className="guess-row" key={guessIndex}>
            <input
              type="radio"
              name="editable-guess"
              checked={editableIndex === guessIndex}
              onChange={() => onEditableChange(guessIndex)}
              className="guess-radio"
            />
            {guess.word.split("").map((letter, position) => (
              <Tile
                key={position}
                letter={letter}
                state={guess.feedback[position]}
                onClick={() => onCycleTile(guessIndex, position)}
                onRightClick={() => onReverseCycleTile(guessIndex, position)}
                locked={editableIndex !== guessIndex}
                conflict={conflicts.has(`${guessIndex}:${position}`)}
              />
            ))}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="guess-input">
          <input
            type="text"
            value={inputWord}
            onChange={(event) => onInputChange(event.target.value)}
            maxLength={5}
            placeholder="Type a word..."
          />
          <button type="submit">Add</button>
        </form>
      </div>
    </div>
  )
}

export default GuessHistory

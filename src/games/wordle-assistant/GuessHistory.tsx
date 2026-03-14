import React from "react"
import { TileState } from "./types"
import type { GuessRecord, Feedback } from "./types"
import Tile from "./Tile"

interface GuessHistoryProps {
  guesses: GuessRecord[]
  editableIndex: number
  onEditableChange: (index: number) => void
  onAddGuess: (guess: GuessRecord) => void
  onCycleTile: (guessIndex: number, position: number) => void
  inputWord: string
  onInputChange: (word: string) => void
}

const GuessHistory: React.FC<GuessHistoryProps> = ({
  guesses,
  editableIndex,
  onEditableChange,
  onAddGuess,
  onCycleTile,
  inputWord,
  onInputChange,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const word = inputWord.toLowerCase().trim()
    if (word.length !== 5) return
    const feedback: Feedback = [
      TileState.WHITE,
      TileState.WHITE,
      TileState.WHITE,
      TileState.WHITE,
      TileState.WHITE,
    ]
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
                locked={editableIndex !== guessIndex}
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

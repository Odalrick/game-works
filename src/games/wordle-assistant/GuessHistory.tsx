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
      TileState.WHITE,
      TileState.WHITE,
      TileState.WHITE,
      TileState.WHITE,
      TileState.WHITE,
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

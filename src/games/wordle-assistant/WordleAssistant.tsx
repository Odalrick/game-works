import React, { useEffect, useMemo, useState } from "react"
import type { WordleState } from "./wordleSlice"
import type { Action } from "./wordleSlice"
import { actions, STORAGE_KEY } from "./wordleSlice"
import { deriveConstraints, filterCandidates } from "./inference"
import { rankWander, rankSeek, rankQuest } from "./ranker"
import { TileState } from "./types"
import { tileColours, tileLabels } from "./tileConstants"
import wordList from "./wordList.json"
import GuessHistory from "./GuessHistory"
import QuestRuleSelector from "./QuestRuleSelector"
import SuggestionPanels from "./SuggestionPanels"
import "./wordle.css"

const feedbackChar: Record<TileState, string> = {
  [TileState.GREEN]: "g",
  [TileState.YELLOW]: "o",
  [TileState.WHITE]: ".",
}

interface SuggestionLists {
  wander: string[]
  seek: string[]
  quest: string[]
  candidates: string[]
}

function serialiseGameState(
  state: WordleState,
  suggestions: SuggestionLists,
): string {
  const sections: string[] = []

  const guessLines = state.guesses.map((guess) => {
    const feedback = guess.feedback.map((tile) => feedbackChar[tile]).join("")
    return `${guess.word.toUpperCase()} ${feedback}`
  })
  if (guessLines.length > 0) {
    sections.push(guessLines.join("\n"))
  }

  if (state.questRule.type !== "none") {
    const label =
      state.questRule.type === "endsWith"
        ? `ends with ${state.questRule.letter.toUpperCase()}`
        : state.questRule.type === "avoid"
          ? `avoid ${state.questRule.letter.toUpperCase()}`
          : `use ${state.questRule.letter.toUpperCase()}`
    sections.push(`Quest: ${label}`)
  }

  const listSection = (title: string, words: string[]) => {
    const display = words.slice(0, 10).map((w) => w.toUpperCase())
    return `${title}: ${display.join(", ")}`
  }

  const lists = [
    listSection("Wander", suggestions.wander),
    listSection("Seek", suggestions.seek),
    listSection("Quest", suggestions.quest),
    listSection(
      `Candidates (${suggestions.candidates.length})`,
      suggestions.candidates,
    ),
  ]
  sections.push(lists.join("\n"))

  return sections.join("\n\n")
}

const Legend: React.FC = () => (
  <div className="tile-legend">
    {[TileState.GREEN, TileState.YELLOW, TileState.WHITE].map((tileState) => (
      <span key={tileState} className="legend-item">
        <span
          className="legend-swatch"
          style={{ backgroundColor: tileColours[tileState] }}
        />
        {tileLabels[tileState]}
      </span>
    ))}
  </div>
)

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

  const constraints = useMemo(
    () => deriveConstraints(state.guesses),
    [state.guesses],
  )

  const candidates = useMemo(
    () => filterCandidates(allWords, constraints),
    [allWords, constraints],
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
    () =>
      rankQuest(allWords, state.guesses, state.questRule, allWords, candidates),
    [allWords, state.guesses, state.questRule, candidates],
  )

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      try {
        const words = event.newValue ? JSON.parse(event.newValue) : []
        action(actions.setPreviouslyCorrect(words))
      } catch {
        /* ignore malformed data */
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [action])

  const [inputWord, setInputWord] = useState("")
  const [editableIndex, setEditableIndex] = useState(-1)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsText, setSettingsText] = useState("")

  const lastGuessIndex = state.guesses.length - 1
  const activeEditableIndex =
    editableIndex >= 0 && editableIndex < state.guesses.length
      ? editableIndex
      : lastGuessIndex

  const handleWordClick = (word: string) => {
    navigator.clipboard.writeText(word).catch(() => {
      /* clipboard may not be available */
    })
    setInputWord(word)
  }

  const handleAddGuess = (guess: Parameters<typeof actions.addGuess>[0]) => {
    action(actions.addGuess(guess))
    setEditableIndex(-1)
  }

  const currentInputWord = inputWord.toLowerCase().trim()

  const handleMarkCorrect = () => {
    if (currentInputWord.length !== 5) return
    action(actions.markCorrect(currentInputWord))
    setInputWord("")
  }

  const handleOpenSettings = () => {
    setSettingsText(state.previouslyCorrect.join("\n"))
    setSettingsOpen(true)
  }

  const handleStoreSettings = () => {
    const words = settingsText
      .split("\n")
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line.length === 5)
    action(actions.setPreviouslyCorrect(words))
    setSettingsOpen(false)
  }

  return (
    <div className="wordle-assistant">
      <Legend />
      <GuessHistory
        guesses={state.guesses}
        editableIndex={activeEditableIndex}
        onEditableChange={setEditableIndex}
        onAddGuess={handleAddGuess}
        onCycleTile={(index, position) =>
          action(actions.updateFeedback({ index, position }))
        }
        inputWord={inputWord}
        onInputChange={setInputWord}
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
        hasGuesses={state.guesses.length > 0}
        previouslyCorrect={state.previouslyCorrect}
        onWordClick={handleWordClick}
      />
      <div className="wordle-controls">
        <button
          onClick={handleMarkCorrect}
          disabled={currentInputWord.length !== 5}
          className="mark-solved-button"
        >
          {currentInputWord.length === 5
            ? `${currentInputWord.toUpperCase()} was correct!`
            : "Mark solved"}
        </button>
        <button onClick={() => action(actions.reset())}>Reset</button>
        <button
          onClick={() =>
            settingsOpen ? setSettingsOpen(false) : handleOpenSettings()
          }
          className={`settings-button${
            settingsOpen ? " settings-button-active" : ""
          }`}
          title="Settings"
        >
          &#9881;
        </button>
      </div>
      {settingsOpen && (
        <div className="settings-panel">
          <h4>Previously correct words</h4>
          <textarea
            value={settingsText}
            onChange={(event) => setSettingsText(event.target.value)}
            rows={10}
            className="settings-textarea"
          />
          <div className="settings-actions">
            <button onClick={handleStoreSettings}>Store</button>
            <button onClick={() => setSettingsOpen(false)}>Cancel</button>
          </div>
          <h4>Game state</h4>
          <textarea
            value={serialiseGameState(state, {
              wander,
              seek,
              quest,
              candidates,
            })}
            readOnly
            rows={10}
            className="settings-textarea"
            onClick={(event) => (event.target as HTMLTextAreaElement).select()}
          />
        </div>
      )}
    </div>
  )
}

export default WordleAssistant

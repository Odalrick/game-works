import React, { useMemo, useState } from "react"
import type { WordleState } from "./wordleSlice"
import type { Action } from "./wordleSlice"
import { actions } from "./wordleSlice"
import { deriveConstraints, filterCandidates } from "./inference"
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

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
      {words.length === 0 && <li className="empty">&mdash;</li>}
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

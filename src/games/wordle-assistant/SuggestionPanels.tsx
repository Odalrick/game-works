import React from "react"

interface SuggestionPanelsProps {
  wander: string[]
  seek: string[]
  quest: string[]
  candidates: string[]
  previouslyCorrect: string[]
  onWordClick: (word: string) => void
}

const WordList: React.FC<{
  title: string
  words: string[]
  onWordClick: (word: string) => void
}> = ({ title, words, onWordClick }) => (
  <div className="word-list">
    <h4>{title}</h4>
    <ul>
      {words.slice(0, 10).map((word) => (
        <li
          key={word}
          className="word-list-item"
          onClick={() => onWordClick(word)}
          title="Click to copy and prefill"
        >
          {word.toUpperCase()}
        </li>
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
  onWordClick,
}) => {
  return (
    <>
      <div className="suggestion-panels">
        <WordList title="Wander" words={wander} onWordClick={onWordClick} />
        <WordList title="Seek" words={seek} onWordClick={onWordClick} />
        <WordList title="Quest" words={quest} onWordClick={onWordClick} />
      </div>
      <div className="bottom-panels">
        <WordList
          title="Candidate answers"
          words={candidates}
          onWordClick={onWordClick}
        />
        <WordList
          title="Previously correct"
          words={previouslyCorrect}
          onWordClick={onWordClick}
        />
      </div>
    </>
  )
}

export default SuggestionPanels

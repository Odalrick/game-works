import React from "react"
import type { LettersAtPositions, QuestRule } from "./types"

interface QuestRuleSelectorProps {
  rule: QuestRule
  onChange: (rule: QuestRule) => void
}

const emptyLetters: LettersAtPositions = ["", "", "", "", ""]

const QuestRuleSelector: React.FC<QuestRuleSelectorProps> = ({
  rule,
  onChange,
}) => {
  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const ruleType = event.target.value
    switch (ruleType) {
      case "none":
        onChange({ type: "none" })
        break
      case "lettersAt":
        onChange({ type: "lettersAt", letters: [...emptyLetters] })
        break
      case "avoid":
        onChange({ type: "avoid", letter: "a" })
        break
      case "use":
        onChange({ type: "use", letter: "a" })
        break
    }
  }

  const handleLettersAtChange = (position: number, value: string) => {
    if (rule.type !== "lettersAt") return
    const updated: LettersAtPositions = [...rule.letters]
    updated[position] = value.toLowerCase()
    onChange({ type: "lettersAt", letters: updated })
  }

  return (
    <div className="quest-rule-selector">
      <label>Quest rule: </label>
      <select value={rule.type} onChange={handleTypeChange}>
        <option value="none">None</option>
        <option value="lettersAt">Letters at positions</option>
        <option value="avoid">Avoid letter</option>
        <option value="use">Use letter</option>
      </select>
      {(rule.type === "avoid" || rule.type === "use") && (
        <>
          <label> letter: </label>
          <input
            type="text"
            maxLength={1}
            value={rule.letter}
            onChange={(event) =>
              onChange({ ...rule, letter: event.target.value.toLowerCase() })
            }
            onFocus={(event) => event.target.select()}
            className="quest-letter-input"
          />
        </>
      )}
      {rule.type === "lettersAt" && (
        <div className="quest-letters-at">
          {rule.letters.map((letter, position) => (
            <input
              key={position}
              type="text"
              maxLength={1}
              value={letter}
              onChange={(event) =>
                handleLettersAtChange(position, event.target.value)
              }
              onFocus={(event) => event.target.select()}
              className="quest-letter-input"
              placeholder={String(position + 1)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default QuestRuleSelector

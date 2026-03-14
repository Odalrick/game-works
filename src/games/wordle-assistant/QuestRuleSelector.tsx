import React from "react"
import type { QuestRule } from "./types"

interface QuestRuleSelectorProps {
  rule: QuestRule
  onChange: (rule: QuestRule) => void
}

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
      case "endsWith":
        onChange({ type: "endsWith", letter: "a" })
        break
      case "maxLetter":
        onChange({ type: "maxLetter", letter: "a", count: 1 })
        break
      case "minLetter":
        onChange({ type: "minLetter", letter: "a", count: 1 })
        break
    }
  }

  return (
    <div className="quest-rule-selector">
      <label>Quest rule: </label>
      <select value={rule.type} onChange={handleTypeChange}>
        <option value="none">None</option>
        <option value="endsWith">Ends with</option>
        <option value="maxLetter">Max of letter</option>
        <option value="minLetter">Min of letter</option>
      </select>
      {rule.type !== "none" && (
        <>
          <label> letter: </label>
          <input
            type="text"
            maxLength={1}
            value={"letter" in rule ? rule.letter : ""}
            onChange={(event) =>
              onChange({ ...rule, letter: event.target.value.toLowerCase() })
            }
            className="quest-letter-input"
          />
        </>
      )}
      {(rule.type === "maxLetter" || rule.type === "minLetter") && (
        <>
          <label> count: </label>
          <input
            type="number"
            min={0}
            max={5}
            value={rule.count}
            onChange={(event) =>
              onChange({
                ...rule,
                count: parseInt(event.target.value, 10) || 0,
              })
            }
            className="quest-count-input"
          />
        </>
      )}
    </div>
  )
}

export default QuestRuleSelector

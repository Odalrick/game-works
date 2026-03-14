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
      case "avoid":
        onChange({ type: "avoid", letter: "a" })
        break
      case "use":
        onChange({ type: "use", letter: "a" })
        break
    }
  }

  return (
    <div className="quest-rule-selector">
      <label>Quest rule: </label>
      <select value={rule.type} onChange={handleTypeChange}>
        <option value="none">None</option>
        <option value="endsWith">Ends with</option>
        <option value="avoid">Avoid letter</option>
        <option value="use">Use letter</option>
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
    </div>
  )
}

export default QuestRuleSelector

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "./store"
import Square from "./games/flip-square/Square"
import WordleAssistant from "./games/wordle-assistant/WordleAssistant"
import "./App.css"

enum Tab {
  FLIP_SQUARE = "FLIP_SQUARE",
  WORDLE = "WORDLE",
}

const tabTitles: Record<Tab, string> = {
  [Tab.FLIP_SQUARE]: "Flip Square",
  [Tab.WORDLE]: "Wordle Assistant",
}

function App() {
  const [activeTab, setActiveTab] = useState(Tab.FLIP_SQUARE)

  useEffect(() => {
    document.title = `${tabTitles[activeTab]} - GameWorks`
  }, [activeTab])
  const square = useSelector((state: RootState) => state.square)
  const wordle = useSelector((state: RootState) => state.wordle)
  const dispatch = useDispatch()

  return (
    <div className="App">
      <nav className="tabs">
        <button
          className={activeTab === Tab.FLIP_SQUARE ? "tab active" : "tab"}
          onClick={() => setActiveTab(Tab.FLIP_SQUARE)}
        >
          Flip Square
        </button>
        <button
          className={activeTab === Tab.WORDLE ? "tab active" : "tab"}
          onClick={() => setActiveTab(Tab.WORDLE)}
        >
          Wordle
        </button>
      </nav>
      <div className="tab-content">
        {activeTab === Tab.FLIP_SQUARE && (
          <Square square={square} action={dispatch} />
        )}
        {activeTab === Tab.WORDLE && (
          <WordleAssistant state={wordle} action={dispatch} />
        )}
      </div>
    </div>
  )
}

export default App

import { useSelector } from "react-redux"
import { RootState } from "./store"
import Square from "./games/flip-square/Square"
import "./App.css"

function App() {
  const square = useSelector((state: RootState) => state.square)

  return (
    <div className="App">
      <Square square={square} />
    </div>
  )
}

export default App

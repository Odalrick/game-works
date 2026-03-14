import React from "react"
import { TileState } from "./types"

interface TileProps {
  letter: string
  state: TileState
  onClick: () => void
}

const tileColours: Record<TileState, string> = {
  [TileState.GREEN]: "#6aaa64",
  [TileState.YELLOW]: "#c9b458",
  [TileState.WHITE]: "#ffffff",
}

const Tile: React.FC<TileProps> = ({ letter, state, onClick }) => {
  return (
    <div
      className="wordle-tile"
      style={{ backgroundColor: tileColours[state] }}
      onClick={onClick}
    >
      {letter.toUpperCase()}
    </div>
  )
}

export default Tile

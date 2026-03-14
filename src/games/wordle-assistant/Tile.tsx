import React from "react"
import { TileState } from "./types"

interface TileProps {
  letter: string
  state: TileState
  onClick: () => void
  locked?: boolean
}

const tileColours: Record<TileState, string> = {
  [TileState.GREEN]: "#6aaa64",
  [TileState.YELLOW]: "#c9b458",
  [TileState.WHITE]: "#e0e0e0",
}

const Tile: React.FC<TileProps> = ({ letter, state, onClick, locked }) => {
  return (
    <div
      className={`wordle-tile${locked ? " wordle-tile-locked" : ""}`}
      style={{ backgroundColor: tileColours[state] }}
      onClick={locked ? undefined : onClick}
    >
      {letter.toUpperCase()}
    </div>
  )
}

export default Tile

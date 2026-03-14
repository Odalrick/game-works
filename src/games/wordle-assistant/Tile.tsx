import React from "react"
import { TileState } from "./types"
import { tileColours } from "./tileConstants"

interface TileProps {
  letter: string
  state: TileState
  onClick: () => void
  locked?: boolean
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

import React from "react"
import { TileState } from "./types"
import { tileColours } from "./tileConstants"

interface TileProps {
  letter: string
  state: TileState
  onClick: () => void
  onRightClick?: () => void
  locked?: boolean
  conflict?: boolean
}

const Tile: React.FC<TileProps> = ({
  letter,
  state,
  onClick,
  onRightClick,
  locked,
  conflict,
}) => {
  const handleContextMenu = (event: React.MouseEvent) => {
    if (locked || !onRightClick) return
    event.preventDefault()
    onRightClick()
  }

  return (
    <div
      className={`wordle-tile${locked ? " wordle-tile-locked" : ""}${
        conflict ? " wordle-tile-conflict" : ""
      }`}
      style={{ backgroundColor: tileColours[state] }}
      onClick={locked ? undefined : onClick}
      onContextMenu={handleContextMenu}
    >
      {letter.toUpperCase()}
    </div>
  )
}

export default Tile

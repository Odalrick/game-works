import React from "react"
import {
  Square as SquareModel,
  Action as SquareAction,
  actions,
} from "./squareSlice"
import Grid from "./Grid"

interface SquareProps {
  square: SquareModel
  action: (action: SquareAction) => void
}

const Square: React.FC<SquareProps> = ({ square, action }) => {
  return (
    <div className="square">
      <Grid
        square={square}
        onCellClick={(x, y) => action(actions.flip([x, y]))}
      />
    </div>
  )
}

export default Square

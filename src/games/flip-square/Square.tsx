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
      <div className="instructions">
        <p>Welcome to the Square puzzle game solver!</p>
        <p>
          <strong>About the Game:</strong> The game consists of a 3x3 grid of
          squares. Each square can be in one of two states. The goal is to flip
          all squares to the "good" state.
        </p>
        <p>
          <strong>How to Use:</strong> Click on a square to toggle its state. A
          ring will be displayed on the squares you need to click to solve the
          game.
        </p>
        <p>
          <strong>Pro Tip:</strong> Right-click or long-click on a square to
          simulate a real game flip, affecting the clicked square and its
          orthogonal neighbors.
        </p>
      </div>
      <Grid
        square={square}
        onCellClick={(x, y) => action(actions.toggle([x, y]))}
      />
    </div>
  )
}

export default Square

import React from "react"
import { Square as SquareModel } from "./squareSlice"
import Grid from "./Grid"

interface SquareProps {
  square: SquareModel
}

const Square: React.FC<SquareProps> = ({ square }) => {
  return (
    <div className="square">
      <Grid square={square} />
    </div>
  )
}

export default Square

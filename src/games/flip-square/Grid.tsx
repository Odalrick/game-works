import React from "react"
import { CellState, Square as SquareModel } from "./squareSlice"

interface GridProps {
  square: SquareModel
  onCellClick: (x: number, y: number) => void
}

const Grid: React.FC<GridProps> = ({ square, onCellClick }) => {
  const coordByRow = [
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
  ]
  return (
    <div className="grid">
      {coordByRow.map((row) => (
        <div className="grid-row">
          {row.map(([x, y]) => (
            <Cell
              cell={square.getCell(x, y)}
              onClick={() => onCellClick(x, y)}
              shouldFlip={square.shouldFlip(x, y)}
            >
              ({x}, {y})
            </Cell>
          ))}
        </div>
      ))}
    </div>
  )
}

interface CellProps {
  cell: CellState
  children?: React.ReactNode
  onClick: () => void
  shouldFlip: boolean
}

const Cell: React.FC<CellProps> = ({ cell, children, onClick, shouldFlip }) => {
  const color = cell === CellState.ON ? "green" : "red"
  return (
    <div
      className="cell"
      style={{ width: "50px", height: "50px", backgroundColor: color }}
      onClick={onClick}
    >
      {shouldFlip && <div className="circle" />}
      {children}
    </div>
  )
}
export default Grid

import React from "react"
import { CellState, Square as SquareModel } from "./squareSlice"

interface GridProps {
  square: SquareModel
  onCellClick: (x: number, y: number) => void
}

const Grid: React.FC<GridProps> = ({ square, onCellClick }) => {
  return (
    <div className="grid">
      <div className="grid-row">
        <Cell cell={square.getCell(0, 2)} onClick={() => onCellClick(0, 2)}>
          (0, 2)
        </Cell>
        <Cell cell={square.getCell(1, 2)} onClick={() => onCellClick(1, 2)}>
          (1, 2)
        </Cell>
        <Cell cell={square.getCell(2, 2)} onClick={() => onCellClick(2, 2)}>
          (2, 2)
        </Cell>
      </div>
      <div className="grid-row">
        <Cell cell={square.getCell(0, 1)} onClick={() => onCellClick(0, 1)}>
          (0, 1)
        </Cell>
        <Cell cell={square.getCell(1, 1)} onClick={() => onCellClick(1, 1)}>
          (1, 1)
        </Cell>
        <Cell cell={square.getCell(2, 1)} onClick={() => onCellClick(2, 1)}>
          (2, 1)
        </Cell>
      </div>
      <div className="grid-row">
        <Cell cell={square.getCell(0, 0)} onClick={() => onCellClick(0, 0)}>
          (0, 0)
        </Cell>
        <Cell cell={square.getCell(1, 0)} onClick={() => onCellClick(1, 0)}>
          (1, 0)
        </Cell>
        <Cell cell={square.getCell(2, 0)} onClick={() => onCellClick(2, 0)}>
          (2, 0)
        </Cell>
      </div>
    </div>
  )
}

interface CellProps {
  cell: CellState
  children?: React.ReactNode
  onClick: () => void
}

const Cell: React.FC<CellProps> = ({ cell, children, onClick }) => {
  const color = cell === CellState.ON ? "green" : "red"
  return (
    <div
      style={{ width: "50px", height: "50px", backgroundColor: color }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
export default Grid

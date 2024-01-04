import React from "react"
import { CellState, Square as SquareModel } from "./squareSlice"

interface GridProps {
  square: SquareModel
}

const Grid: React.FC<GridProps> = ({ square }) => {
  return (
    <div className="grid">
      <div className="grid-row">
        <Cell cell={square.getCell(0, 2)}>(0, 2)</Cell>
        <Cell cell={square.getCell(1, 2)}>(1, 2)</Cell>
        <Cell cell={square.getCell(3, 2)}>(3, 2)</Cell>
      </div>
      <div className="grid-row">
        <Cell cell={square.getCell(0, 1)}>(0, 1)</Cell>
        <Cell cell={square.getCell(1, 1)}>(1, 1)</Cell>
        <Cell cell={square.getCell(2, 1)}>(2, 1)</Cell>
      </div>
      <div className="grid-row">
        <Cell cell={square.getCell(0, 0)}>(0, 0)</Cell>
        <Cell cell={square.getCell(1, 0)}>(1, 0)</Cell>
        <Cell cell={square.getCell(2, 0)}>(2, 0)</Cell>
      </div>
    </div>
  )
}

interface CellProps {
  cell: CellState
  children?: React.ReactNode
}

const Cell: React.FC<CellProps> = ({ cell, children }) => {
  const color = cell === CellState.ON ? "green" : "red"
  return (
    <div style={{ width: "50px", height: "50px", backgroundColor: color }}>
      {children}
    </div>
  )
}
export default Grid

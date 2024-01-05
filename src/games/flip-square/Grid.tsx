import React from "react"
import { CellState, Square as SquareModel } from "./squareSlice"

interface GridProps {
  square: SquareModel
  onCellClick: (x: number, y: number) => void
  onAlternateCellClick: (x: number, y: number) => void
}

const Grid: React.FC<GridProps> = ({
  square,
  onCellClick,
  onAlternateCellClick,
}) => {
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
              onAlternateClick={() => onAlternateCellClick(x, y)}
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
  onAlternateClick: () => void
}

const Cell: React.FC<CellProps> = ({
  cell,
  children,
  onClick,
  shouldFlip,
  onAlternateClick,
}) => {
  const color = cell === CellState.ON ? "green" : "red"
  const onContextMenu = (event: React.MouseEvent) => {
    onAlternateClick()
    event.preventDefault()
  }

  const clickEvents = {
    onContextMenu,
    onClick,
  }
  return (
    <div
      className="cell"
      style={{ width: "50px", height: "50px", backgroundColor: color }}
      {...clickEvents}
    >
      {shouldFlip && <div className="circle" />}
      {children}
    </div>
  )
}
export default Grid

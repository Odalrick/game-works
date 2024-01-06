import React from "react"
import { CellState, Square as SquareModel } from "./squareSlice"

interface GridProps {
  square: SquareModel
  onCellClick: (x: number, y: number) => void
  onAlternateCellClick: (x: number, y: number) => void
  onReset: () => void
}

const doNothing = () => {}

const Grid: React.FC<GridProps> = ({
  square,
  onCellClick,
  onAlternateCellClick,
  onReset,
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
  const refreshCharacter = "\u21BB"
  const rightArrow = "\u2192"
  const downArrow = "\u2193"
  const clickColumn = (x: number) => {
    for (let y = 0; y < 3; y++) {
      onCellClick(x, y)
    }
  }

  const clickRow = (y: number) => {
    for (let x = 0; x < 3; x++) {
      onCellClick(x, y)
    }
  }

  return (
    <div className="grid">
      <div className="grid-row">
        <Cell
          key={`row:reset`}
          colour={"blue"}
          onClick={onReset}
          shouldFlip={false}
          onAlternateClick={doNothing}
        >
          {refreshCharacter}
        </Cell>
        <Cell
          key={`row:0`}
          colour={"blue"}
          onClick={() => clickColumn(0)}
          shouldFlip={false}
          onAlternateClick={doNothing}
        >
          {downArrow}
        </Cell>

        <Cell
          key={`row:1`}
          colour={"blue"}
          onClick={() => clickColumn(1)}
          shouldFlip={false}
          onAlternateClick={doNothing}
        >
          {downArrow}
        </Cell>
        <Cell
          key={`row:2`}
          colour={"blue"}
          onClick={() => clickColumn(2)}
          shouldFlip={false}
          onAlternateClick={doNothing}
        >
          {downArrow}
        </Cell>
      </div>
      {coordByRow.map((row) => (
        <div className="grid-row" key={`row-${row[0][1]}`}>
          <Cell
            key={`row:${row[0][1]}`}
            colour={"blue"}
            onClick={() => clickRow(row[0][1])}
            shouldFlip={false}
            onAlternateClick={doNothing}
          >
            {rightArrow}
          </Cell>
          {row.map(([x, y]) => (
            <Cell
              key={`${x},${y}`}
              colour={square.getCell(x, y) === CellState.ON ? "green" : "red"}
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
  children?: React.ReactNode
  onClick: () => void
  shouldFlip: boolean
  onAlternateClick: () => void
  colour?: string
}

const Cell: React.FC<CellProps> = ({
  children,
  onClick,
  shouldFlip,
  onAlternateClick,
  colour,
}) => {
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
      style={{ width: "50px", height: "50px", backgroundColor: colour }}
      {...clickEvents}
    >
      {shouldFlip && <div className="circle" />}
      {children}
    </div>
  )
}
export default Grid

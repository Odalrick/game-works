import { TileState } from "./types"

export const tileColours: Record<TileState, string> = {
  [TileState.GREEN]: "#538d4e",
  [TileState.YELLOW]: "#e67e22",
  [TileState.WHITE]: "#787c7e",
}

export const tileLabels: Record<TileState, string> = {
  [TileState.GREEN]: "Correct position",
  [TileState.YELLOW]: "In word, wrong position",
  [TileState.WHITE]: "Not in word",
}

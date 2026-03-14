export enum TileState {
  GREEN = "green",
  YELLOW = "yellow",
  WHITE = "white",
}

export type Feedback = [TileState, TileState, TileState, TileState, TileState]

export type GuessRecord = {
  word: string
  feedback: Feedback
}

export type QuestRule =
  | { type: "none" }
  | { type: "endsWith"; letter: string }
  | { type: "avoid"; letter: string }
  | { type: "use"; letter: string }

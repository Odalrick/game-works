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

export type LettersAtPositions = [string, string, string, string, string]

export type QuestRule =
  | { type: "none" }
  | { type: "lettersAt"; letters: LettersAtPositions }
  | { type: "avoid"; letter: string }
  | { type: "use"; letter: string }

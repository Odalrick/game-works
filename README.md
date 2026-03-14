# Game Works

## Introduction

A React/Redux learning project — a collection of puzzle game solvers and utilities. Built with React 18, Redux Toolkit,
and TypeScript. Deployed to [GitHub Pages](https://odalrick.github.io/game-works/).

The primary aim is to learn React and Redux by building practical tools for games I enjoy. The act of creating a solver
is often more engaging than playing the puzzle itself — it's an exercise in problem-solving, programming, and
algorithmic thinking.

## Games

### Flip Square

A solver for a 3×3 grid puzzle where each cell can be in one of two states. Clicking a cell flips it and its orthogonal
neighbours. The goal is to flip all cells to the "good" state. The solver uses BFS to compute the optimal sequence of
moves.

### Wordle Assistant

A client-side helper for 5-letter Wordle-like puzzles. Not a solver — the user enters guesses and feedback from their
game, and the assistant suggests words using three strategies:

- **Wander** — explore untested letters, weighted by frequency among remaining candidates
- **Seek** — rank candidate answers by information gain
- **Quest** — comply with variant side-rules (ends with, avoid letter, use letter) while deprioritising actual answers

Variant-agnostic: works with any Wordle-like game that uses 5-letter words with green/yellow/grey feedback. Special
rules (like locking found letters) are the user's responsibility.

### Lumberjack

A spatial planning minigame prototype. Core game logic with tests, no UI yet. Replaces a dice-based skill check with a
tactical puzzle about chopping and rolling logs on a grid.

## Ethical Considerations

Creating a solver is not cheating — the process involves deep understanding of the game's mechanics, which is rewarding
in itself. Using someone else's solver in a single-player game is a personal choice. In multiplayer or competitive
settings, the use of solvers should align with the game's rules and the spirit of fair play.

## Future Ideas

- Battleship game — strategies for efficient guessing and tracking opponent moves
- Sudoku helper — assist with solving rather than auto-solving
- Enhancements to Flip Square — varying states, grid sizes, flip patterns
- Lumberjack UI

## AI in Development

I enthusiastically use AI throughout the development process.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this?

A React/Redux learning project — a collection of puzzle game solvers and utilities. Deployed to GitHub Pages.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check with tsc then build with Vite
- `npm run lint` — ESLint (zero warnings enforced: `--max-warnings 0`)
- `npm test` — Run Jest
- `npm run watch` — Jest in watch mode
- `npm run pages` — Build and stage to `docs/` for GitHub Pages deployment

## Architecture

- **Vite** + **React 18** + **TypeScript** (strict mode), transpiled with SWC
- **Redux Toolkit** for state management — single store in `src/store.ts`
- **Ramda** for functional utilities
- Games live under `src/games/` — each has its own README and DESIGN doc
- `src/MINIGAME.md` defines what counts as a minigame in this project's design framework
- Path alias: `@games` → `src/games/` (configured in both `tsconfig.json` and `vite.config.ts`; mapped in `jest.config.cjs`)
- GitHub Pages deployment serves from the `docs/` directory with base path `/game-works/` — rebuild with `npm run pages` before merging
- Implementation plans live in `plans/` (not `docs/`, which is the Pages build output)
- Dark theme with terminal-green accents — CSS custom properties defined in `src/index.css` (`--green-glow`, `--border`, etc.)

### Games

- **Flip Square** (`flip-square/`) — 3×3 grid solver. Redux slice + UI components.
- **Wordle Assistant** (`wordle-assistant/`) — helper for Wordle-like puzzles. Three suggestion strategies (wander, seek, quest). localStorage cross-tab sync for previously correct words. Has its own DESIGN.md with full spec.
- **Lumberjack** (`lumberjack/`) — spatial planning minigame prototype. Core game logic with tests, no UI yet.

## Conventions

### Commits

Conventional commits via Commitizen (`npm run commit`). Current scopes: `basics`, `flip-game`, `lumberjack`, `wordle` (defined in `.cz-config.cjs`).

### Formatting

- Prettier with `semi: false` (no semicolons)
- ESLint extends `@typescript-eslint/recommended` and `react-hooks/recommended`

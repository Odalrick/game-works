# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this?

A React/Redux learning project — a collection of puzzle game solvers and utilities. Currently contains a "Flip Square" (3×3 grid) solver. Deployed to GitHub Pages.

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
- Games live under `src/games/` — currently only `flip-square/`
- Path alias: `@games` → `src/games/` (configured in both `tsconfig.json` and `vite.config.ts`; mapped in `jest.config.cjs`)
- GitHub Pages deployment serves from the `docs/` directory with base path `/game-works/`

### Flip Square game

- `squareSlice.ts` — Redux slice (state, reducers, solver logic)
- `squareSlice.spec.ts` — Unit tests for the slice
- `Square.tsx` / `Grid.tsx` — UI components

## Conventions

### Commits

Conventional commits via Commitizen (`npm run commit`). Current scopes: `flip-game`, `basics` (defined in `.cz-config.cjs`).

### Formatting

- Prettier with `semi: false` (no semicolons)
- ESLint extends `@typescript-eslint/recommended` and `react-hooks/recommended`

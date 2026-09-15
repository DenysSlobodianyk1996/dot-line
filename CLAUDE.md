# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Two-player "dots and lines" game on an NxN field. Players take turns drawing a line between adjacent dots. The first line can go anywhere; every later line must start from an existing one. A player who closes a square owns it, and whoever owns the most squares wins.

Stack: Vue 3 (`<script setup lang="ts">`), Vite, TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`, imported in `src/assets/styles.css`), vee-validate + `@vee-validate/rules`, vue-router, Pinia (installed, but `src/stores/counter.ts` is unused scaffold). SCSS is available for `<style lang="scss">`.

## Specs

Feature specs live in `.claude/docs/` (index and workflow in `.claude/docs/README.md`). Each feature has `requirements.md` → `design.md` → `tasks.md`. Read the spec before implementing a feature, update the spec first when behavior changes, and reference requirement IDs (for example `MV-2`) in commits. The gameplay spec is `.claude/docs/dot-line-game/`. Its design replaces the current `Square.lines` model described below.

## Commands

- `npm run dev`: Vite dev server on **port 4200**
- `npm run build`: runs `vue-tsc --build` type-check and `vite build` in parallel
- `npm run type-check`: type-check only
- `npm run lint`: oxlint, then ESLint. **Both run with `--fix` and modify files.**
- `npm run format`: Prettier on `src/` only (no semicolons, single quotes, width 100)

There is no test runner configured.

## Architecture

- **Routing** (`src/router/index.ts`): the only route is `/game`, and every other path redirects there. Page folders expose their root component through an `index.ts` barrel (`export { default } from './Page.vue'`).
- **Game page flow** (`src/pages/dot-line-game/`): `Page.vue` owns a single `reactive(new DotLineGame())` and picks the child via `<component :is>` from a computed config (`component`, `props`, `listeners`):
  - If `dotLineGame.isGameStarted` (both players plus size > 0) is false, it renders `game-setup/GameSetup.vue`. That form emits `gameSetup`, and Page applies the result with the chained setters.
  - Otherwise it renders `Game.vue`, which gets the reactive game as a prop and mutates it directly. "Back" calls `reset()`.
- **Persistence**: `Game.vue` writes the whole game to localStorage under `CURRENT_GAME` (`src/static/storage-keys.ts`) in a `watchEffect`, going through `StorageService` (`src/services/storage.service.ts`, which JSON-serializes objects). On load, `Page.vue` reads it back with `getItem(key, { applyParse: true })` and rehydrates it via `dotLineGame.reset(savedGame)`.
- **Models** (`src/models/`): `DotLineGame`, `Square` and `Line` are classes. Each has a `Partial<Self>` constructor that doubles as the JSON rehydrator, plus chainable `setX()` setters that return `this`. `reset(game?)` does `Object.assign(this, new DotLineGame(game))`, which keeps the same reactive object identity. When adding fields, update the constructor so that restoring from storage keeps working. Note:
  - Constructors default with `||`, so falsy values like `0` become `null`. That matters for `Square.x`/`y`, which are 0-based.
  - `DotLineGame` doesn't wrap `dirtySquares` in `Square` instances.
  - Ownership is tracked by player **name** (`ownerName`, `getPlayerByName`), so player names must be unique. The setup form enforces this case-insensitively through a custom `differentFromAll` rule.
- **Forms**: vee-validate `<Form>`/`<Field>` with string rules (`required|min_value:2|max_value:10`). Rules are registered with `defineRule` inside the component that uses them. Nested field names like `player1.name` map onto the `GameSetupForm` shape.
- **Shared UI** (`src/shared/components/Base*.vue`): Tailwind-styled primitives. `BaseInput` forwards `$attrs` so it can take vee-validate's `field` binding.
- **Imports**: use the `@/` alias for `src/`. `models`, `services`, `static` and `utils` each have an `index.ts` barrel.

## Conventions

- TS is strict with `noUncheckedIndexedAccess` enabled, so indexed access returns `T | undefined`.
- Linting: oxlint `correctness` category is set to error, and ESLint uses `vue/flat/essential` plus the vue-ts recommended config. Prettier owns formatting (`eslint-config-prettier`).
- Node `^22.18.0 || >=24.12.0`.

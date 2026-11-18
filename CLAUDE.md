# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Dots and Boxes: Connected" («Крапки й квадрати: ланцюжок»): the two-player Dots and Boxes game on an NxN field. Players take turns drawing a line between adjacent dots. The first line can go anywhere; every later line must start from an existing one. A player who closes a square owns it, and whoever owns the most squares wins.

Stack: Vue 3 (`<script setup lang="ts">`), Vite, TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`, imported in `src/assets/styles.css`), vee-validate + `@vee-validate/rules`, vue-router, vue-i18n, `vite-plugin-pwa`, Nunito via `@fontsource-variable/nunito`, Pinia (installed, but `src/stores/counter.ts` is unused scaffold). SCSS is available for `<style lang="scss">`.

## Specs

Specs live in `docs/` (layout and workflow in `docs/README.md`). Domain terms are in the root `GLOSSARY.md` and decisions in `docs/adr/`; use the glossary's terms in code, docs and issues. Shipped behavior is in `docs/<feature>/requirements.md` (numbered rules such as `MV-2`) with `design.md` and the design canvas; new work starts as `docs/<feature>/spec.md`, mirrored to a GitHub issue, and is tracked as GitHub sub-issues (no `tasks.md`). Read the spec before implementing a feature, update the spec first when behavior changes, and reference requirement or story IDs in commits. The gameplay spec is `docs/dots-and-boxes-connected/`.

## Commands

- `npm run dev`: Vite dev server on **port 4200**
- `npm run build`: runs `vue-tsc --build` type-check and `vite build` in parallel
- `npm run type-check`: type-check only
- `npm run lint`: oxlint, then ESLint. **Both run with `--fix` and modify files.**
- `npm run lint-check`: oxlint, then ESLint, without `--fix` (what CI runs)
- `npm test`: Vitest run once (jsdom + Vue Test Utils); `npm run test:watch` for watch mode
- `npm run store:screenshots`: builds, serves the build and regenerates the Play Store images in `docs/store/` with Playwright (fixture games seeded into localStorage); review and commit them. Not part of `npm test` (AR-16, AR-17)
- `npm run format`: Prettier on `src/` only (no semicolons, single quotes, width 100)

Tests: specs sit in `__tests__/` folders next to the code (`*.spec.ts`) and check external behavior only (spec "Testing Decisions"). Shared helpers live in `src/test/`: `mountGamePage({ storage })` mounts the whole app at `/game` with real router, i18n and localStorage, and calling it again simulates a reload. `src/test/game-page.ts` is the page driver (`startGame`, `startComputerGame`, `clickDot`, `waitForComputer`, …) and the only place that knows the board's DOM; extend it rather than querying the DOM in specs. Computer-turn specs fake only `setTimeout`/`clearTimeout` (faking `setImmediate` hangs `flushPromises`). `src/test/setup.ts` clears localStorage and unmounts after each test. Tests and helpers are type-checked through `tsconfig.vitest.json`.

CI: `.github/workflows/ci.yml` runs type-check, `lint-check` and tests on every pull request. Deployment: `.github/workflows/deploy.yml` runs the tests, then publishes to GitHub Pages on every push to `master`. It builds with `BASE_PATH=/<repo name>/` (`/dots-and-boxes-connected/`), which `vite.config.ts` reads as Vite's `base` and the router picks up through `import.meta.env.BASE_URL`, then copies `dist/index.html` to `404.html` so history-mode reloads work. Keep asset and route URLs base-relative (no hard-coded `/…` paths in code).

PWA: `vite-plugin-pwa` in `vite.config.ts` (`autoUpdate`, Workbox precache of all build output, navigation fallback to `index.html`). It emits the Ukrainian manifest; a small plugin there adds the English one and `404.html`. File names live in `src/static/manifests.ts`, and `setLocale()` swaps the `<link rel="manifest">` href with the language. Verify with `BASE_PATH=/dots-and-boxes-connected/ npm run build` (both manifests, `sw.js`, icons in `dist/`), not unit tests. New static assets must match the precache `globPatterns` to work offline.

## Architecture

- **App shell** (`src/App.vue`): a header on every screen (logo, translated game name, `ThemeToggle`, the info button that opens the rules panel, `LanguageToggle`), then `RouterView`, then the single `RulesPanel`. Its round icon buttons are `BaseIconButton` (44 px below `sm`).
- **Routing** (`src/router/index.ts`): the only route is `/game`, and every other path redirects there. Page folders expose their root component through an `index.ts` barrel (`export { default } from './Page.vue'`).
- **Game page flow** (`src/pages/dots-and-boxes-connected/`): `Page.vue` owns a single `reactive(new DotsAndBoxesGame())` and picks the child via `<component :is>` from a computed config (`component`, `props`, `listeners`):
  - If `dotsAndBoxesGame.isGameStarted` (both players plus size > 0) is false, it renders `game-setup/GameSetup.vue`. That form has the game mode switch (Versus computer / Two players) and, in computer mode, the difficulty switch, a "You" `PlayerField` and the read-only `ComputerOpponentField`. It emits `gameSetup`, and Page applies the result with the chained setters (`setGameMode(...)` first).
  - Otherwise it renders `Game.vue`, which gets the reactive game as a prop and changes it through model methods. It shows `game/GameBoard.vue` next to `game/GameStatus.vue` (turn, score, Stop) or, once finished, `game/GameResult.vue` (New game settings calls `reset()`, Rematch calls `start()`). The selected dot lives in `Game.vue` and reaches the board through `v-model:selected-dot`.
  - **Computer turn**: `Game.vue` uses `useComputerTurn.ts`, which watches `isComputerTurn` (immediate, so a restored game resumes), waits `COMPUTER_DELAY_MS` and draws `chooseComputerLine(...)` through the normal `drawLine`. Its `isThinking` locks the board and shows "Thinking…"; call `cancel()` on Stop, Rematch and New game settings.
  - **Rules panel**: the header's info button (`App.vue`) opens `src/shared/components/RulesPanel.vue`, a modal side panel rendered once in `App.vue` around `GameRules.vue` (both are app shell, so they live in `shared/`; full screen below `sm`, closed by default, ✕/backdrop/Esc, focus trapped and returned to the info button). No screen shows rules inline. Its open state is the module-level `useRulesPanel()` composable (`src/shared/composables/`); `Game.vue` passes it to `useComputerTurn` as a pause reason next to the Stop dialog (VR-31). The rules text in `GameRules.vue` must match the spec (RL-5).
- **Persistence**: `Game.vue` writes the whole game to localStorage under `CURRENT_GAME` (`src/static/storage-keys.ts`) in a `watchEffect`, going through `StorageService` (`src/services/storage.service.ts`, which JSON-serializes objects). On load, `Page.vue` reads it back with `getItem(key, { applyParse: true })` and rehydrates it via `dotsAndBoxesGame.reset(savedGame)`. `GameSetup.vue` also saves `GAME_MODE` and `DIFFICULTY` when a game starts and reads them when setup opens. `useTheme` saves `THEME`.
- **Models** (`src/models/`): `DotsAndBoxesGame`, `Dot`, `Line` and `Square` are classes. Each has a `Partial<Self>` constructor that doubles as the JSON rehydrator: it builds nested `Line`/`Dot`/`Square` instances and defaults with `??`, so 0-based `row`/`col` survive. Chainable `setX()` setters return `this`. `reset(game?)` does `Object.assign(this, new DotsAndBoxesGame(game))`, which keeps the same reactive object identity. When adding fields, update the constructor so that restoring from storage keeps working.
  - Game rules live on `DotsAndBoxesGame` (`isValidStartDot`, `validNeighbors`, `canDraw`, `drawLine`, `stop`, `start`, `winner`). `lines` is the single source of truth for drawn edges, and `dirtySquares` holds only owned squares.
  - `gameMode` (`'twoPlayers' | 'computer'`, missing in old saves → Two players) and `difficulty` (`'easy' | 'normal'`, only in computer mode) live on the game; `isComputerTurn` and `legalMoves()` serve the computer player.
  - Ownership is tracked by player **name** (`ownerName`, `getPlayerByName`), so player names must be unique. The setup form enforces this case-insensitively through a custom `differentFromAll` rule.
  - The computer player is always `player2`, stored under `COMPUTER_NAME` (`computer-player.model.ts`) and never shown: display any player name through `useDisplayName()` (`src/shared/composables/`) or `PlayerName.vue` (adds `RobotIcon`). Its color comes from `computerColorFor()` in `src/utils/computer-color.ts`: the swatch most different from the person's color.
  - `computer-strategy.ts`: `chooseComputerLine(game, difficulty, random)` is pure (Easy: random legal move; Normal: claim, else safe line, else fewest given away). Test it with a fixed random source.
- **i18n** (`src/i18n/`): vue-i18n with the Composition API (`legacy: false`). `locales/en.ts` defines the message keys, and `locales/uk.ts` is typed as `typeof en`, so both must have the same keys. Ukrainian is the default; `setLocale()` saves `LOCALE` in localStorage and updates `<html lang>`, `document.title` and the `<link rel="manifest">` href (one manifest per language, `src/static/manifests.ts`). All UI text goes through `const { t } = useI18n()`; never hard-code visible strings, and add every new string to both locale files. vee-validate messages come from `configure({ generateMessage })` in `src/i18n/index.ts`, using each `<Field>`'s translated `label`. The UA/EN toggle is `src/shared/components/LanguageToggle.vue` in the `App.vue` header.
- **Theme and styling** (`src/assets/styles.css`): the Warm cream palette is `--wc-*` custom properties, light on `:root` and dark on `:root[data-theme='dark']`, exposed to Tailwind through `@theme inline` as semantic colors (`bg-paper`, `bg-surface`, `text-ink`, `text-ink-soft`, `text-muted`, `bg-accent`, `text-on-accent`, `border-border`, `bg-dot`, `text-danger`, …). Use these tokens, never raw `gray`/`blue`/`white`, so both themes work. `useTheme()` (`src/shared/composables/useTheme.ts`) follows `prefers-color-scheme` live until `toggle()` saves an override under `THEME`, and sets `data-theme` on `<html>`; an inline script in `index.html` applies the same rule before the app loads.
- **Player colors**: `SWATCHES` in `src/utils/swatches.ts` (8 key + hex pairs, keys double as `colors.<key>` i18n keys) and `randomSwatch(except?)`. `PlayerField.vue` renders them as a radiogroup bound to the same `player.color` hex, with a `differentColor` rule in Two players mode. Saved games may hold any hex, so never assume a color is a swatch.
- **Logo and icons**: `src/shared/logo.ts` (`logoSvg()`, `faviconSvg()`) is the one SVG source; `AppLogo.vue` renders it in the header with `currentColor` dots and an animation that respects reduced motion. `npm run generate-icons` (`scripts/generate-icons.ts`) regenerates `public/favicon.*` and the install PNGs after a logo change; commit them. UI icons are inline SVG components in `src/shared/icons/` (Material Symbols Rounded, license in its README); no icon font.
- **Forms**: vee-validate `<Form>`/`<Field>` with string rules (`required|min_value:2|max_value:10`). Rules are registered with `defineRule` inside the component that uses them. Nested field names like `player1.name` map onto the `GameSetupForm` shape.
- **Shared UI** (`src/shared/components/Base*.vue`): Tailwind-styled primitives, including `BaseSegmentedControl` (radiogroup switch for game mode and difficulty). `BaseInput` forwards `$attrs` so it can take vee-validate's `field` binding.
- **Imports**: use the `@/` alias for `src/`. `models`, `services`, `static` and `utils` each have an `index.ts` barrel.

## Conventions

- TS is strict with `noUncheckedIndexedAccess` enabled, so indexed access returns `T | undefined`.
- Linting: oxlint `correctness` category is set to error, and ESLint uses `vue/flat/essential` plus the vue-ts recommended config. Prettier owns formatting (`eslint-config-prettier`).
- Node `^22.18.0 || >=24.12.0`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `DenysSlobodianyk1996/dots-and-boxes-connected`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` plus `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.

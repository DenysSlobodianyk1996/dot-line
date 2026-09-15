# dot-line

A two-player dots-and-lines game in the browser. Players take turns connecting neighboring dots on an N×N board. Whoever closes a square owns it, and whoever owns more squares wins.

## How to play

1. **Setup**: enter both players' names and colors, and choose the board size N (2–10). Each player's color is used for their lines and squares.
2. **First line**: a randomly chosen player picks any dot, then one of its neighbors to the left, right, top or bottom.
3. **Next lines**: a new line must start at a dot where an existing line starts or ends, from either player. Valid starting dots are highlighted. After you pick one, its free neighbors are highlighted too, and picking the selected dot again cancels.
4. **Squares**: drawing the fourth side of a square makes it yours. One line can close two squares. Turns alternate after every line.
5. **End**: the game ends when every square has an owner, or when a player presses **Stop** and confirms. More squares wins, and equal scores are a draw. **Rematch** keeps the players and size; **New game** returns to setup.

The game is saved in the browser's localStorage, so reloading the page continues where you left off. It works on desktop and on phones: on narrow screens the board sits above the panel and its squares shrink to fit.

## Getting started

Requires Node `^22.18.0` or `>=24.12.0`.

```sh
npm install
npm run dev
```

Then open http://localhost:4200.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload on port 4200 |
| `npm run build` | Type-check and production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run type-check` | Type-check only (`vue-tsc`) |
| `npm run lint` | oxlint, then ESLint (both apply auto-fixes) |
| `npm run format` | Prettier on `src/` |

There are no automated tests yet.

Recommended editor: [VS Code](https://code.visualstudio.com/) with the [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension.

## Tech stack

Vue 3 (`<script setup>` with TypeScript), Vite, Tailwind CSS v4, vee-validate for the setup form, and vue-router.

## Project structure

```
src/
  models/                game state and rules (DotLineGame, Dot, Line, Square)
  pages/dot-line-game/   setup screen, game screen and the board components
  services/              localStorage wrapper
  shared/components/     base UI components (button, input, label)
.claude/docs/            feature specs: requirements, design, tasks
```

## Specs and design

Features are built spec-first. The requirements (with IDs and acceptance criteria), the design and the task list are in [`.claude/docs/`](.claude/docs/README.md). The desktop and mobile screen designs are in a private Claude Design canvas linked from [design.md](.claude/docs/dot-line-game/design.md).

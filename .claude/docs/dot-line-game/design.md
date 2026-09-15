# Dot-line game: design

Implements [requirements.md](requirements.md). Requirement IDs are shown in brackets.

## Visual draft

Claude Design canvas (draft, static mockups): https://claude.ai/artifact/H54pzHj9XtpJ6A4CVc3pnA

The artboards match the app's current Tailwind styles (`Base*` components, gray/blue palette). The board is shown at N=4 with 48 px squares, and the sample players are Ann and Bob.

1. Game setup (current form) [GS-1, GS-2]
2. First move: empty board, every dot a valid start [MV-1, MV-4, GB-4]
3. Mid-game: Bob to move, Dot1 (1,2) selected, valid Dot2 at (2,2) and (1,3), other valid starts (2,0), (2,1), (0,3), owned squares with fill and initial [MV-2, MV-3, MV-5, GB-2, GB-3]
4. Stop confirmation [END-2]
5. Result, winner (Bob 9, Ann 7): result panel beside the final board, with New game and Rematch [END-3..6]
6. Result, draw (8 each) [END-3, END-4]

Source files for the artboards are in [design-canvas/](design-canvas/) (`*.dc.html` plus `canvas.json`). They were generated from the board data, so board state and highlights are consistent with the rules below.

## Data model (`src/models/`)

The current model keeps lines inside each `Square` (`Square.lines` with `LinePosition`), so every shared edge exists twice. Replace that with one game-level list of lines as the single source of truth. `dirtySquares` holds only owned squares.

```ts
// dot.model.ts
export class Dot {
  row: number
  col: number
}

// line.model.ts
export class Line {
  from: Dot      // normalized: from < to (by row, then col)
  to: Dot
  ownerName: string
}

// square.model.ts (Square.lines and LinePosition removed)
export class Square {
  row: number    // 0..N-1
  col: number    // 0..N-1
  ownerName: string
}

// dot-line-game.model.ts
export type GameStatus = 'playing' | 'finished'
export type FinishReason = 'completed' | 'stopped'

export class DotLineGame {
  player1: Player | null
  player2: Player | null
  size: number | null
  lines: Line[]                     // new
  dirtySquares: Square[]            // owned squares only
  currentPlayerName: string | null  // new
  status: GameStatus                // new
  finishReason: FinishReason | null // new
}
```

Rules for all model constructors:
- The `Partial<Self>` constructor is also the JSON rehydrator used by `reset()` on load from localStorage (PS-2). It must build nested instances: `lines.map(l => new Line(l))`, `new Dot(...)`, `dirtySquares.map(s => new Square(s))`.
- Default with `??`, not `||`, so `row`/`col` = 0 and score 0 survive.
- Keep the chainable `setX()` setters, `getPlayerByName`, `isGameStarted` and `reset(game?)` (which uses `Object.assign` to keep the reactive identity).
- `GameSetupForm` stays as is.

## Rules (methods on `DotLineGame`)

Follows the existing pattern where the model owns its logic (`getPlayerByName`, `isGameStarted`).

| Method / getter | Behavior | Req |
| --- | --- | --- |
| `static lineKey(a, b)` | Normalized key string, e.g. `"1,1-1,2"`. The same key for both orders. | — |
| `hasLine(a, b)` | Checks the key against a set built from `lines`. | MV-3 |
| `neighbors(dot)` | Up to 4 orthogonal dots inside `0..size`. | MV-3 |
| `validNeighbors(dot)` | `neighbors(dot)` without drawn edges. | MV-3, MV-5 |
| `isValidStartDot(dot)` | `status === 'playing'` and `validNeighbors(dot).length > 0` and (`lines.length === 0` or some line has `dot` as `from`/`to`). | MV-1, MV-2, MV-4 |
| `canDraw(a, b)` | `isValidStartDot(a)` and `b` is in `validNeighbors(a)`. | MV-3 |
| `drawLine(a, b)` | Guard `canDraw`. Push a `Line` owned by `currentPlayerName`. Check adjacent squares (see below); each with 4 edges and not yet owned becomes a `Square` owned by the drawer. Switch `currentPlayerName`. If `dirtySquares.length === size²`, set `status = 'finished'` and `finishReason = 'completed'`. | SQ-1..3, TR-1, END-1 |
| `stop()` | `status = 'finished'`, `finishReason = 'stopped'`. | END-2 |
| `scores` | `{ [playerName]: count }` from `dirtySquares`. | GB-4 |
| `winner` | The `Player` with the higher score, or `null` for a draw. | END-3 |
| `start()` | Clear `lines` and `dirtySquares`, `status = 'playing'`, `finishReason = null`, random `currentPlayerName`. Used after setup and by rematch. | GS-3, TR-2, END-6 |

Square (r, c) edges:
- top `(r,c)–(r,c+1)`
- bottom `(r+1,c)–(r+1,c+1)`
- left `(r,c)–(r+1,c)`
- right `(r,c+1)–(r+1,c+1)`

Squares adjacent to a new line:
- horizontal line `(r,c)–(r,c+1)`: squares `(r-1,c)` and `(r,c)`
- vertical line `(r,c)–(r+1,c)`: squares `(r,c-1)` and `(r,c)`

Skip squares that fall outside `0..N-1`. There are 2·N·(N+1) possible lines in total.

## Components

```
src/pages/dot-line-game/
  Page.vue            # unchanged role: setup vs game via <component :is>; gameSetup() calls start() after setters
  Game.vue            # composes the pieces below; keeps watchEffect → StorageService.setItem(CURRENT_GAME, game)
  game/
    GameStatus.vue    # current player (name + swatch), scores, Stop button (confirm)
    GameBoard.vue     # SVG board; owns local selectedDot ref
    GameResult.vue    # replaces GameStatus beside the final board: winner/Draw + scores, New game, Rematch
```

- **GameBoard.vue** [GB-1..3, MV-4..8]
  - SVG of size `N·48 + 2·pad`. Each dot is at `(pad + col·48, pad + row·48)`.
  - Layers, bottom to top: owned-square `<rect>` (owner color, `fill-opacity≈0.3`) with a centered `<text>` initial, then lines (`stroke` = owner color, about 4 px, round caps), then dots.
  - Each dot is a small visible circle plus a transparent hit circle about 12 px in radius.
  - Dot states: `default`, `valid-start` (highlight ring), `selected` (filled with the current player's color), `valid-target` (pulse or current-color ring).
  - Click handling:
    - If there's no selection, a valid start is selected.
    - With a selection, clicking the selected dot cancels.
    - Clicking a valid target calls `game.drawLine(selected, dot)` and clears the selection.
    - Clicking another valid start switches the selection.
    - Anything else is ignored.
  - The selection is cleared when `status` becomes `finished`.
- **GameStatus.vue** [GB-4, END-2]: uses `BaseButton color="secondary"` for Stop, and `window.confirm` (or a small confirm dialog) before `game.stop()`.
- **GameResult.vue** [END-4..6]: shown instead of `GameStatus` when `status === 'finished'`. It sits in the side column next to the board, so the whole final board stays visible.
  - New game: `StorageService.removeItem(CURRENT_GAME)` then `game.reset()`, which is the current `goBack()` behavior.
  - Rematch: `game.start()`.
- **Game.vue**: the "Back" button is removed (replaced by Stop, then New game).

## Persistence [PS-1, PS-2]

This reuses what already exists: `Game.vue`'s `watchEffect` saves the whole reactive game, and `Page.vue` restores it with `StorageService.getItem(CURRENT_GAME, { applyParse: true })` and `dotLineGame.reset(savedGame)`. The constructor rehydration above is what makes restored `lines` and `dirtySquares` work. Getters and `status` decide whether Game shows the board only or the board plus the result.

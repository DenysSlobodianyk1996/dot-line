# Dot-line game: design

Implements [requirements.md](requirements.md). Requirement IDs are shown in brackets.

## Visual draft

Claude Design canvas (approved 2026-09-15, static mockups): https://claude.ai/artifact/H54pzHj9XtpJ6A4CVc3pnA

The artboards match the app's current Tailwind styles (`Base*` components, gray/blue palette). The board is shown at N=4 with 48 px squares. The sample players are Оля and Богдан on the Ukrainian screens (1–13) and Ann and Bob on the English screens (14, 15).

1. Game setup (current form) [GS-1, GS-2]
2. First move: empty board, every dot a valid start [MV-1, MV-4, GB-4]
3. Mid-game: Богдан to move, Dot1 (1,2) selected, valid Dot2 at (2,2) and (1,3), other valid starts (2,0), (2,1), (0,3), owned squares with fill and initial [MV-2, MV-3, MV-5, GB-2, GB-3]
4. Stop confirmation [END-2]
5. Result, winner (Богдан 9, Оля 7): result panel beside the final board, with New game and Rematch [END-3..6]
6. Result, draw (8 each) [END-3, END-4]

"Mobile" page (390 px wide phone frames):

7. Setup, players stacked [MB-7]
8. Mid-game at N=4: 48 px squares, board centered above the panel [MB-2, MB-4, MB-8]
9. Mid-game at N=10: squares shrink to 34 px to fit [MB-3]
10. Stop confirmation [MB-5]
11. Result, winner, with equal-width buttons [MB-6]
12. Game at N=4 with the rules open [RL-2..4]

Rules additions: setup screens 1 and 7 end with "Hide rules" and the rules card. Every game screen ends with "Show rules" (full width on phones). Desktop artboard 13, "Game, rules open", shows the rules card beside-the-board layout [RL-1..4].

Languages: every screen has the UA / EN toggle at the top right. Screens 1–13 show the default Ukrainian UI, with sample players Оля and Богдан and "UA" pressed. Screens 14, "Mobile setup, English", and 15, "Game setup, English", show the English UI with "EN" pressed [I18N-1..5]. The generator reads all text from `src/i18n/locales`, so the canvas uses exactly the app's strings.

Source files for the artboards are in [design-canvas/](design-canvas/) (`*.dc.html` plus `canvas.json`). They were generated from the board data, so board state and highlights are consistent with the rules below.

### Versus computer mode (approved 2026-11-17, #8)

Spec: [computer-opponent/spec.md](../computer-opponent/spec.md) (stories CM-n), shipped as [requirements VC](requirements.md#vc-versus-computer). The product owner approved these artboards on 2026-11-17 (#8). The setup screens 1, 7, 14 and 15 now start with the game mode switch, with **Two players** selected; the rest of each screen is unchanged [CM-1, CM-6, CM-34]. The sample person is Ярослава Петрук on Ukrainian screens and Alexandra Brown on English ones, both exactly 15 characters and never cut [GS-1, GB-5]. The person's color is red and the computer's automatic color is green [CM-9]. (The mockup color is illustrative: the built palette rule, see [Versus computer](#versus-computer-vc-125), gives pure red the palette's teal.) Desktop game screens are in Ukrainian and mobile game screens in English, so every new string appears in both languages.

Desktop page (second row):

16. Setup, Versus computer: game mode switch (Versus computer selected), difficulty switch (Normal selected), "Ви" fieldset with name and color, and a read-only "Суперник" fieldset with the robot, "Комп’ютер" and its automatic color [CM-1, CM-2, CM-4..7, CM-9]
17. Setup, Versus computer, English [CM-36, I18N-1]
18. Computer thinking: Turn shows the color swatch, robot and "Комп’ютер", with a pulsing "Думає…" (polite live region) under the name, and the hint hidden. Every dot is idle, so the board is locked, and Stop is still available [CM-13, CM-14, CM-16, CM-17, CM-37]
19. Computer line highlighted, "Ваш хід": the computer's last line (a safe line, CM-24) has a 4 px halo in its color, valid starts are highlighted again, and Turn says "Ваш хід" [CM-18, CM-19]
20. Result, "Ви перемогли!" (9 : 7), with the person first in the scores [CM-27]
21. Result, "Комп’ютер переміг" (robot next to the heading), with the computer first in the scores [CM-13, CM-27]

Mobile page (second row, 390 px):

22. Setup, Versus computer, with the switches 44 px tall [CM-38, MB-8]
23. Setup, Versus computer, English
24. Computer thinking, English: Turn and Score in two columns, with "Thinking…" under the computer's name [CM-14, CM-16, CM-38]
25. "Your turn", English, with the computer's line highlighted [CM-18, CM-19]
26. Result, "You won!", English [CM-27]
27. Result, "Computer won", English [CM-27]

Visual rules used on these screens:

- **Mode and difficulty switches**: a labelled `role="radiogroup"` styled like the language toggle (`rounded-md border border-gray-300 bg-white p-0.5 shadow-sm`), stretched to full width with equal-width options. The selected option is `bg-blue-600 text-white`. Options are `min-h-8` from `sm` up and `min-h-11` on phones. Difficulty sits right under the mode switch and is shown only in Versus computer mode [CM-6].
- **Robot icon**: Material Symbols `smart_toy` (outlined, `viewBox="0 -960 960 960"`) as inline SVG with `fill: currentColor` and `aria-hidden="true"`. It is 20 px in Turn, 16 px in score rows, 24 px in the result heading and 18 px in the setup Opponent field. It always sits between the color swatch and the written name, which stays the accessible text [CM-13, CM-37].
- **Thinking**: `text-sm text-gray-500 animate-pulse` in an `aria-live="polite"` element under the name in Turn (as on mobile artboard 24, on both layouts). The hint is hidden while the computer's move is pending.
- **Last computer line**: the normal line plus `box-shadow: 0 0 0 4px` in the computer's color at 40%. It is shown only while the game is playing and the newest line is the computer's.
- **Owned squares** keep the existing style with the first letter of the displayed name ("К" / "C" for the computer).

Message keys added to both locales (`src/i18n/locales`):

| Key | English | Українська |
| --- | --- | --- |
| `setup.mode` | Game mode | Режим гри |
| `setup.modeComputer` | Versus computer | Проти комп’ютера |
| `setup.modeTwoPlayers` | Two players | Двоє гравців |
| `setup.difficulty` | Difficulty | Складність |
| `setup.easy` | Easy | Легко |
| `setup.normal` | Normal | Нормально |
| `setup.you` | You | Ви |
| `setup.opponent` | Opponent | Суперник |
| `players.computer` | Computer | Комп’ютер |
| `validation.computerName` | This name belongs to the computer | Це ім’я належить комп’ютеру |
| `validation.maxLength` | {field} can be at most {length} characters. | Поле «{field}» може містити не більше {length} символів. |
| `status.thinking` | Thinking… | Думає… |
| `status.yourTurn` | Your turn | Ваш хід |
| `result.youWon` | You won! | Ви перемогли! |
| `result.computerWon` | Computer won | Комп’ютер переміг |

`validation.computerName` (CM-8) and `validation.maxLength` (GS-1) aren't shown on an artboard. The rules text (`rules.step1`–`step5`) already reads neutrally in both languages ("Take turns…" / "Гравці по черзі…", "the other player"), so CM-35 needed no new wording.

## Data model (`src/models/`)

Lines used to live inside each `Square` (`Square.lines` with `LinePosition`), so every shared edge existed twice. The model keeps one game-level list of lines as the single source of truth instead. `dirtySquares` holds only owned squares.

```ts
// dot.model.ts
export class Dot {
  row: number
  col: number
  get key(): string          // "row,col"
  equals(dot): boolean
}

// line.model.ts
export class Line {
  from: Dot                  // normalized: from ≤ to (by row, then col)
  to: Dot
  ownerName: string | null
  static key(a, b): string   // order-independent, e.g. "1,1-1,2"
  get key(): string
  get isHorizontal(): boolean
  touches(dot): boolean
}

// square.model.ts
export class Square {
  row: number                // 0..N-1
  col: number                // 0..N-1
  ownerName: string | null
}

// dot-line-game.model.ts
export type GameStatus = 'playing' | 'finished'
export type FinishReason = 'completed' | 'stopped'
export type GameMode = 'twoPlayers' | 'computer'
export type Difficulty = 'easy' | 'normal'

export class DotLineGame {
  player1: Player | null
  player2: Player | null
  size: number | null        // coerced with Number(): the setup number input can give a string
  lines: Line[]
  dirtySquares: Square[]     // owned squares only
  currentPlayerName: string | null
  status: GameStatus
  finishReason: FinishReason | null
  gameMode: GameMode         // missing in a save → 'twoPlayers' [VC-22]
  difficulty: Difficulty | null // only in 'computer'; a computer save without one → 'easy' [VC-20]
}

export interface GameSetupForm {
  gameMode: GameMode
  difficulty: Difficulty | null
  player1: Player
  player2: Player            // in Versus computer mode, the computer player
  size: number
}

// computer-player.model.ts
export const COMPUTER_NAME = '__computer_player__'
export function isComputerPlayer(name): boolean
export function createComputerPlayer(personColor): Player  // name COMPUTER_NAME, color computerColorFor(personColor)

// computer-strategy.ts
export type RandomSource = () => number
export function chooseComputerLine(game, difficulty, random = Math.random): Line | null
```

Rules for all model constructors:
- The `Partial<Self>` constructor is also the JSON rehydrator used by `reset()` on load from localStorage (PS-2). It builds nested instances: `lines.map(l => new Line(l))`, `new Dot(...)`, `dirtySquares.map(s => new Square(s))`.
- Default with `??`, not `||`, so `row`/`col` = 0 survive.
- Keep the chainable `setX()` setters (including `setGameMode(mode, difficulty)`), `getPlayerByName`, `isGameStarted` and `reset(game?)` (which uses `Object.assign` to keep the reactive identity).

## Rules (methods on `DotLineGame`)

Follows the existing pattern where the model owns its logic.

| Method / getter | Behavior | Req |
| --- | --- | --- |
| `players`, `currentPlayer`, `getPlayerByName(name)`, `getOpponent(name)` | Player lookups by name. | — |
| `isGameStarted` | Both players and a size are set, so Page shows the game instead of setup. | GS-3 |
| `isFinished` | `status === 'finished'`. | END-7 |
| `isComputerGame` | `gameMode === 'computer'`. | VC-1 |
| `isComputerTurn` | Computer game, not finished, and the current player is the computer player. | VC-10, VC-12 |
| `setGameMode(mode, difficulty)` | Sets the mode; the difficulty is kept only in `'computer'` (default `'easy'`), else `null`. | VC-1, VC-4 |
| `hasLine(a, b)` | Some line has key `Line.key(a, b)`. | MV-3 |
| `neighbors(dot)` | Up to 4 orthogonal dots inside `0..size`. | MV-3 |
| `validNeighbors(dot)` | `neighbors(dot)` without drawn edges. | MV-3, MV-5 |
| `isValidStartDot(dot)` | Not finished, inside the board, (`lines.length === 0` or some line touches `dot`), and at least one valid neighbor. | MV-1, MV-2, MV-4 |
| `canDraw(a, b)` | `isValidStartDot(a)` and `b` is in `validNeighbors(a)`. | MV-3 |
| `legalMoves()` | Every line the current player may draw now, each listed once with no owner: valid starts × their `validNeighbors`. The strategy uses it, so the rules stay in one place (ADR-0003). | VC-11 |
| `drawLine(a, b)` | Guard `canDraw`. Push a `Line` owned by the current player. Each adjacent square (see below) with 4 drawn edges and no owner becomes a `Square` owned by the drawer. Pass the turn to the opponent. When all N² squares are owned, finish with `'completed'`. Returns the squares it closed. | SQ-1..3, TR-1, END-1 |
| `stop()` | If playing, finish with `'stopped'`. | END-2 |
| `scoreOf(name)` | Number of squares owned by that player. | GB-4 |
| `winner` | The `Player` with the higher score, or `null` for a draw. | END-3 |
| `start()` | Clear `lines` and `dirtySquares`, `status = 'playing'`, `finishReason = null`, random `currentPlayerName`. Keeps players, size, game mode and difficulty. Used after setup, for rematch and for old saves. | GS-3, TR-2, END-6, PS-3, VC-18 |
| `reset(game?)` | Replace all state from a saved game (or an empty one), keeping the reactive identity. | END-5, PS-2 |

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
  Page.vue            # setup vs game via <component :is>; gameSetup() calls start() after the setters
  Game.vue            # board + side panel; owns selectedDot and the hint; saves the game in a watchEffect
  useComputerTurn.ts  # plays the computer player's turns (pause, then its line)
  game-setup/
    GameSetup.vue     # mode and difficulty switches, player fields, size; remembers mode and difficulty
    PlayerField.vue   # name + color fieldset ("Player N", or "You" in Versus computer)
    ComputerOpponentField.vue # read-only Opponent fieldset: robot, "Computer", automatic color
  game/
    GameBoard.vue     # squares, lines and clickable dots; v-model:selected-dot
    GameStatus.vue    # turn, score, hint, Stop button and the Stop confirmation dialog
    GameResult.vue    # replaces GameStatus when finished: winner/Draw, score, New game, Rematch
    PlayerScore.vue   # one score row: color swatch, name, score
  rules/
    GameRules.vue     # "How to play" card with the five numbered rules
    RulesToggle.vue   # Show/Hide rules button plus GameRules; used at the bottom of setup and game
src/shared/
  components/BaseSegmentedControl.vue # labelled radiogroup switch (game mode, difficulty)
  components/PlayerName.vue           # displayed name, with the robot for the computer player
  components/RobotIcon.vue            # inline-SVG smart_toy icon
  composables/useDisplayName.ts       # stored name → displayed name
src/utils/computer-color.ts           # COMPUTER_PALETTE, computerColorFor()
```

All sizes and colors come from the approved canvas.

- **Game.vue**: a `flex items-start gap-6` row with GameBoard, then GameResult when finished, otherwise GameStatus. It holds `selectedDot` so GameStatus can show the hint:
  - no lines yet: "Pick any dot to start the first line."
  - Dot1 selected: "Pick a highlighted neighbor to draw the line. Pick the selected dot again to cancel."
  - otherwise: "Pick a highlighted dot to start a line."

  Stop and Rematch clear the selection. The old "Back" button is gone; Stop, then New game, leads back to setup.
- **GameBoard.vue** [GB-1..3, MV-4..8]
  - Absolutely positioned elements inside a `rounded-lg border-gray-300` box of `N·cell + 32` px plus the border. `cell` is the square size: 48 px, or smaller on narrow screens (see Mobile). A dot's center is at `(16 + col·cell, 16 + row·cell)`.
  - Owned squares: `cell` px, owner color mixed at 30% over transparent, bold uppercase initial in the owner color.
  - Lines: `(cell + 4)`×4 px (horizontal) or 4×`(cell + 4)` px (vertical), centered on the dots, in the owner color.
  - Dots are square `<button>` tap areas of `min(cell, 44)` px, with no border radius so the corners stay tappable. Each has an `aria-label`, and its focus outline is drawn 2 px inside the tap area so the board edge doesn't clip it [MB-4]. States:
    - idle: 8 px `gray-400` dot, disabled
    - start: 20 px ring with a 2 px `blue-500` border and `blue-500/12` fill, 8 px `gray-900` dot
    - selected: 26 px ring in the current player's color (12% fill), 12 px dot in that color with a white border
    - target: 22 px dashed ring in the current player's color (12% fill), 8 px `gray-900` dot
  - Click handling:
    - If the game is finished, ignore the click.
    - Clicking the selected dot cancels.
    - With a selection, clicking a valid target calls `game.drawLine(selected, dot)` and clears the selection.
    - Otherwise, clicking a valid start selects it (or switches the selection to it).
    - Anything else is ignored.
- **GameStatus.vue** [GB-4, END-2]: a `w-50` column with Turn (swatch and name), Score (`PlayerScore` rows), the hint and a Stop button (`BaseButton` secondary). Stop opens a dialog: a `fixed inset-0 bg-gray-900/40` backdrop and a `w-75 p-6 rounded-lg border shadow-lg` card with "Stop the game?", "Whoever owns more squares now wins.", the scores, and Cancel (secondary) and Stop game (primary). Clicking the backdrop cancels; confirming emits `stop`.
- **GameResult.vue** [END-3..6]: a `w-53` column with "Result", "`<name>` wins" with a swatch or "Draw", "All squares are filled." or "The game was stopped.", the scores with the winner first, and New game (secondary) and Rematch (primary).
  - New game: `StorageService.removeItem(CURRENT_GAME)` then `game.reset()`.
  - Rematch: `game.start()`.
- **PlayerScore.vue**: a `text-sm leading-6` row with a 12 px swatch, the full name through `PlayerName` (wrapping, see Player names) and a `tabular-nums` score.

Versus computer changes to these components are described in [Versus computer](#versus-computer-vc-125).

## Player names [GS-1, GB-5]

- **PlayerField.vue**: the name `<input>` has `maxlength="15"`, and the field's rules add `max:15` so a pasted or restored value is still validated, with its own message `validation.maxLength` ("Player 2 name can be at most 15 characters.").
- **GameSetup.vue**: the size field's rules are `required|integer|min_value:2|max_value:10` [GS-2].
- Names are never truncated. Every place that shows a name (GameStatus turn, PlayerScore, GameResult heading) drops `truncate` and uses `min-w-0 break-words`, so a long name wraps; the color swatch stays `shrink-0` and aligned to the first line.

## Persistence [PS-1..3]

`Game.vue`'s `watchEffect` saves the whole reactive game (including `gameMode` and `difficulty`) with `StorageService.setItem(CURRENT_GAME, game)`. `Page.vue` restores it with `StorageService.getItem(CURRENT_GAME, { applyParse: true })` and `dotLineGame.reset(savedGame)`, and the constructors rebuild the `Line`, `Dot` and `Square` instances. A started, unfinished save without `currentPlayerName` (saved before gameplay existed) gets `start()` [PS-3]. `status` decides whether Game shows GameStatus or GameResult. The dot selection isn't saved.

## Mobile [MB-1..8]

The phone layout is the default, and `sm:` classes (640 px and up) restore the desktop layout described above.

- **Game.vue**: `flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6`. The board wrapper is centered on phones (`self-center sm:self-start`), and the panel is full width (`w-full`, with `sm:w-50 sm:shrink-0` for GameStatus and `sm:w-53 sm:shrink-0` for GameResult).
- **Board size** (GameBoard): `cell = clamp(floor((viewportWidth − 16 − sidePanel − 34) / N), 24, 48)`.
  - `viewportWidth` is `document.documentElement.clientWidth`, which excludes a desktop scrollbar.
  - The 16 px is the app's `p-2` gutters, and the 34 px is the board's padding plus border.
  - `sidePanel` is 0 in the stacked phone layout. When the panel sits beside the board, it is 236 px: the widest panel (GameResult, 212 px) plus the 24 px gap. "Beside" is decided by the `(min-width: 40rem)` media query, the same one Tailwind's `sm` uses. For example, a 700 px wide window gives a 10×10 board 41 px squares next to the panel.
  - Both values update on window `resize`.
  - The board sits in an `overflow-x-auto max-w-full` wrapper for screens where 24 px squares still don't fit.
- **GameStatus** on phones: Turn and Score in a two-column grid (`grid grid-cols-2 gap-4 sm:flex sm:flex-col`), then the hint, then Stop at full width with `min-h-11` (`w-full sm:w-auto sm:min-h-0`).
- **Stop dialog** card: `w-full max-w-75`, inside the `p-4` backdrop.
- **GameResult** on phones: New game and Rematch in `grid grid-cols-2 gap-2`, each `min-h-11`. From `sm` up they return to the wrapping row.
- **GameSetup**: the player fieldsets row becomes `flex flex-col gap-2 sm:flex-row`.

## Rules [RL-1..5, APP-1]

- **GameRules.vue** [RL-1, RL-5]: a `section` card (`rounded-lg border border-gray-300 bg-white p-4`, gap 12 px) labelled by its "How to play" heading (`text-sm font-semibold text-gray-900`). Below it, an ordered list of five rules (`text-sm text-gray-700`, gap 8 px), each with a 20 px round `bg-gray-200` number. The rules text comes from `rules.step1`–`step5` in `src/i18n/locales` (see Languages). The English wording is:
  1. Take turns drawing a line between two neighboring dots: left, right, up or down.
  2. The first line can go anywhere. After that, start from a dot that already has a line.
  3. Draw the fourth side of a square to claim it. One line can claim two squares.
  4. After every line, the turn passes to the other player.
  5. The game ends when all squares are claimed or someone presses Stop. Most squares wins; equal scores are a draw.
- **RulesToggle.vue** [RL-2..4]: a `flex flex-col gap-2 sm:items-start` wrapper with a `BaseButton` secondary ("Hide rules" / "Show rules") and `GameRules` kept in the DOM with `v-show`.
  - The button has `aria-expanded` and `aria-controls` pointing at the rules card's `useId()` id.
  - On phones the button is `w-full min-h-11`; from `sm` up it is `sm:w-auto sm:min-h-0` and the card stretches (`sm:self-stretch`).
  - The `defaultOpen` prop sets the initial state, and the state isn't saved.
- **GameSetup.vue**: `<RulesToggle default-open class="mt-4" />` after the form, inside the existing `max-w-130` column.
- **Game.vue**: the board and panel row sits in a `flex flex-col gap-4` wrapper, followed by `<RulesToggle class="w-full sm:max-w-130" />` (closed by default).
- **index.html** [APP-1]: `<html lang="uk">` with `<title>Точки й лінії</title>`, the default before the app starts. At runtime the title and `lang` follow the language (see Languages). The deploy workflow's `404.html` copy inherits the same defaults.

## Languages [I18N-1..6, APP-1]

Library: `vue-i18n` with the Composition API (`legacy: false`). The design canvas shows the Ukrainian UI by default, plus English setup screens (see Visual draft).

```
src/i18n/
  index.ts          # createI18n, SUPPORTED_LOCALES, setLocale(), vee-validate message config
  locales/
    en.ts           # source of keys (app, language, setup, validation, game, status, result, rules)
    uk.ts           # typed as `typeof en`, so a missing or extra key fails type-check
src/shared/components/LanguageToggle.vue
```

- **index.ts**:
  - `SUPPORTED_LOCALES = ['uk', 'en']` and `DEFAULT_LOCALE = 'uk'` [I18N-2].
  - The initial locale is the saved `LOCALE` value from localStorage (through `StorageService`), if it's supported, otherwise `uk` [I18N-4]. `fallbackLocale` is `en`.
  - `setLocale(locale)` sets `i18n.global.locale.value`, saves `LOCALE`, then sets `document.documentElement.lang` and `document.title = t('app.title')` [I18N-3, APP-1]. The same document update runs once at startup.
  - `configure({ generateMessage })` from vee-validate: the `differentFromAll` rule gets `validation.differentNames`, `notComputerName` gets `validation.computerName`, `max` gets `validation.maxLength` with `{ field, length }`, and every other rule gets `validation.invalid` with `{ field }`. `field` is the `<Field>`'s translated `label` [GS-1, I18N-1]. The custom rule returns `false`, not a hard-coded string. Messages are generated when validation runs, so a message already on screen updates on the next validation [I18N-6].
- **Message keys**: `rules.step1`–`step5` for the rules, `game.hintFirstLine` / `hintSelected` / `hintStart` for hints, `game.dotLabel` with `{row}`/`{col}`, `result.wins` with `{name}`, `players.computer` for the computer player's name, `setup.player` / `setup.playerName` with `{number}`. Player names are passed in as parameters and never translated.
- **Components** call `const { t } = useI18n()`. `PlayerField` takes `number` (1 or 2) instead of a `label` string.
- **LanguageToggle.vue** [I18N-3, I18N-5]:
  - A `role="group"` element labelled `t('language.label')`: `inline-flex rounded-md border border-gray-300 bg-white p-0.5 shadow-sm`.
  - One button per locale, showing "UA" / "EN" with `aria-label` set to the language's own name ("Українська" / "English"), `lang` set to the locale, and `aria-pressed`.
  - Pressed style `bg-blue-600 text-white`; otherwise `text-gray-700 hover:bg-gray-100`. Size `min-h-11 min-w-11 px-3 text-sm font-medium`, with `sm:min-h-8 sm:min-w-0` from 640 px up.
- **App.vue**: `<header class="mb-2 flex justify-end">` with `LanguageToggle`, above `RouterView`, so it's on every screen.
- **vite.config.ts**: `define` sets the vue-i18n esm-bundler flags: `__VUE_I18N_FULL_INSTALL__: true`, `__VUE_I18N_LEGACY_API__: false`, `__INTLIFY_PROD_DEVTOOLS__: false`.
- **StorageService.setItem** accepts a `string` as well as an `object`, and strings are stored as they are.

## Versus computer [VC-1..25]

### Computer player identity

- The computer player is always `player2`, stored under `COMPUTER_NAME = '__computer_player__'` (ADR-0001). The name is longer than the 15-character limit, so a person can't type it. Lines, owned squares, scores and `currentPlayerName` keep working by name.
- `createComputerPlayer(personColor)` builds it with `computerColorFor(personColor)` [VC-6]: the `COMPUTER_PALETTE` color (green, blue, red, orange, purple, teal) with the largest "redmean" distance from the person's color. An unreadable color gets the first one (green).

### Display helper [VC-8]

- `useDisplayName()` returns `displayName(name)`: `t('players.computer')` for the computer player, otherwise the name as typed. It's the only place that turns a stored name into a shown one, and it follows the language toggle.
- `PlayerName.vue` wraps it, with a `RobotIcon` in front for the computer player (`iconSize`, default 16). It's used in the Turn (20 px) and in `PlayerScore` (score rows, the Stop dialog and the result scores).
- `GameResult.vue` puts a 24 px `RobotIcon` between the swatch and the heading when the computer wins. `GameBoard.vue` uses `displayName(...)` for the owned-square initial, and `ComputerOpponentField.vue` shows an 18 px robot with `displayName(COMPUTER_NAME)`.

### Icon

- `RobotIcon.vue`: Material Symbols `smart_toy` (outlined) as inline SVG, `viewBox="0 -960 960 960"`, `fill-current`, `aria-hidden="true"`, `focusable="false"`, `data-icon="robot"`, with a `size` prop in px. It needs no network request; future icons follow the same pattern.

### Computer strategy (`src/models/computer-strategy.ts`) [VC-16, VC-17]

- `chooseComputerLine(game, difficulty, random = Math.random)` is pure (CM-39): it reads `game.legalMoves()`, returns `null` when there are none, and otherwise hands them to `STRATEGIES[difficulty]`. It never changes the game.
- For each move it looks at the squares on either side and how many of their sides are drawn now: a move **claims** each square that has 3 sides and **gives away** each square that has 2.
- **Easy**: `pickRandom(moves, random)`.
- **Normal**: if some move claims a square, a random one among those claiming the most; otherwise a random one among those giving away the fewest. A safe line gives away 0, so this picks a random safe line when one exists (CM-24), and otherwise the line handing the person the fewest squares (CM-25). Since the turn always passes (ADR-0002), the person can then claim only the squares this line gave a third side.
- `pickRandom` uses `Math.min(n - 1, floor(random() * n))`, so tests can pass a fixed random source.

### Computer turn (`src/pages/dot-line-game/useComputerTurn.ts`) [VC-9..13, VC-21]

- `useComputerTurn(() => game, delay = COMPUTER_DELAY_MS)` (1000 ms) returns `{ isThinking, cancel }`.
- It watches `isComputerTurn ? lines.length : null` with `immediate: true`, so a restored game resumes on mount. Every change cancels any pending move; when the value isn't `null`, it sets `isThinking` and schedules the move.
- The move re-checks `isComputerTurn`, asks `chooseComputerLine(game, game.difficulty ?? 'easy')` and draws the line through the normal `drawLine`, trying `from → to` and else `to → from` (a `Line` stores its ends in board order, so either end may be the valid start).
- `Game.vue` calls `cancel()` in `stop`, `rematch` and `newGame`; unmounting cancels too.
- `Game.vue` passes `isThinking || isComputerTurn` to `GameBoard` as `locked` (every dot `idle`, clicks ignored) and to `GameStatus` as `thinking`.

### Status and board [VC-10, VC-14, VC-15]

- `GameStatus.vue`: on the person's turn in a computer game (`isComputerGame && !isComputerTurn`) the Turn reads `status.yourTurn` next to the person's swatch; otherwise it shows `PlayerName`. Under it, an always-rendered `<p aria-live="polite">` shows `status.thinking` with `animate-pulse` while `thinking`, and the hint (`data-hint`) is hidden then.
- `GameBoard.vue`: `lastComputerLine` is the newest line when its owner is the computer player and the game isn't finished. It's derived from `lines`, so it survives a reload. That line gets `box-shadow: 0 0 0 4px color-mix(in srgb, <color> 40%, transparent)`.

### Result [VC-19]

- `GameResult.vue`: in a computer game the heading is `result.computerWon` or `result.youWon`; in Two players it's `result.wins` with the displayed name. Draw is unchanged, and the scores are sorted winner first.

### Setup [VC-1..7]

- `GameSetup.vue` has a `BaseSegmentedControl` for the game mode, and a second one for the difficulty only when the mode is `'computer'`. The vee-validate `<Form>` has `keep-values`, so values typed in either mode survive a switch [VC-7].
  - Versus computer: a `PlayerField` with `legend="You"` (field label `setup.name`, so messages read "Name is not valid."), `reject-computer-name` and no other names to differ from, then `ComputerOpponentField` with `computerColorFor(values.player1.color)`.
  - Two players: the two `PlayerField`s as before.
  - `submit()` emits a `GameSetupForm`. In computer mode `player2 = createComputerPlayer(player1.color)`, and a second person typed earlier is ignored. `Page.vue` applies it with `setGameMode(...).setPlayer1(...).setPlayer2(...).setSize(...).start()`.
- `BaseSegmentedControl.vue` (generic over the value type): a visible label (`aria-hidden`) plus a `role="radiogroup"` with the same `aria-label`. Each option is a `role="radio"` button with `aria-checked`, `flex-1` and `min-h-11 sm:min-h-8`; the selected one is `bg-blue-600 text-white`.
- `PlayerField.vue` registers `notComputerName`: the name, trimmed, with `'`, `’` and `ʼ` unified and lower-cased, must not equal `players.computer` of any locale in `SUPPORTED_LOCALES`, normalized the same way [VC-5].

### Preferences [VC-2]

- Storage keys `GAME_MODE` and `DIFFICULTY` (`src/static/storage-keys.ts`), next to `LOCALE`, are written as plain strings through `StorageService`.
- `GameSetup.vue` reads them when it's created. A missing or unknown value falls back to `'computer'` / `'normal'`.
- `submit()` writes both, so they change only when a game starts. The difficulty is written in Two players too, so the next Versus computer setup shows the last chosen difficulty.

## Tests

Vitest with Vue Test Utils on jsdom (`npm test`). CI runs type-check, `npm run lint-check` and the tests on every pull request, and the deploy runs the tests first (CM-40).

- Specs live in `__tests__/*.spec.ts` next to the code and are type-checked through `tsconfig.vitest.json`. `src/test/setup.ts` unmounts every wrapper and clears localStorage after each test.
- Model seam: `src/models/__tests__/` (game model, legal moves, game mode rehydration, and `computer-strategy.spec.ts` with a fixed random source).
- Page seam: `src/test/mount-game-page.ts` mounts the whole app at `/game` with real i18n, router and localStorage. `src/test/game-page.ts` is the page driver (`startGame`, `startComputerGame`, `clickDot`, `drawLine`, `waitForComputer`, `reload`, …) and the only code that knows the board's DOM. Page specs fake `setTimeout`/`clearTimeout` and stub `Math.random` for the first player.

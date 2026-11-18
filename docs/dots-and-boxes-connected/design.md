# Dots and Boxes: Connected: design

Implements [requirements.md](requirements.md). Requirement IDs are shown in brackets.

## Visual draft

Claude Design canvas (approved 2026-09-15, static mockups): https://claude.ai/artifact/H54pzHj9XtpJ6A4CVc3pnA

The artboards use the Warm cream palette of the visual refresh (see [Visual refresh](#visual-refresh-vr-152)); before it they showed the original gray/blue Tailwind styles. The board is shown at N=4 with 48 px squares. The sample players are Оля and Богдан on the Ukrainian screens (1–13) and Ann and Bob on the English screens (14, 15).

1. Game setup (current form) [GS-1, GS-2]
2. First move: empty board, every dot a valid start [MV-1, MV-4, GB-4]
3. Mid-game: Богдан to move, Dot1 (1,2) selected, valid Dot2 at (2,2) and (1,3), other valid starts (2,0), (2,1), (0,3), owned squares with fill and initial [MV-2, MV-3, MV-5, GB-2, GB-3]
4. Stop confirmation [END-2]
5. Result, winner (Богдан 9, Оля 7): result panel beside the final board, with New game settings and Rematch [END-3..6]
6. Result, draw (8 each) [END-3, END-4]

"Mobile" page (390 px wide phone frames):

7. Setup, players stacked [MB-7]
8. Mid-game at N=4: 48 px squares, board centered above the panel [MB-2, MB-4, MB-8]
9. Mid-game at N=10: squares shrink to 34 px to fit [MB-3]
10. Stop confirmation [MB-5]
11. Result, winner, with equal-width buttons [MB-6]
12. Game at N=4 with the rules panel open, full screen [VR-25]

Rules: since the visual refresh, no screen shows the rules inline. Desktop artboard 13 shows the rules panel slid in from the right over the game, and mobile artboard 12 shows it full screen [RL-1, RL-5, VR-23..VR-28]. (Before the refresh, setup ended with "Hide rules" and the rules card, and game screens with "Show rules".)

Languages: every screen has the UA / EN toggle in the header (top right). Screens 1–13 show the default Ukrainian UI, with sample players Оля and Богдан and "UA" pressed. Screens 14, "Mobile setup, English", and 15, "Game setup, English", show the English UI with "EN" pressed [I18N-1..5]. The generator reads all text from `src/i18n/locales`, so the canvas uses exactly the app's strings.

Source files for the artboards are in [design-canvas/](design-canvas/) (`*.dc.html` plus `canvas.json`). They were generated from the board data, so board state and highlights are consistent with the rules below. Each artboard defines the palette tokens as `--wc-<token>` custom properties in its `<helmet>`, so a dark artboard differs from its light one only in that block (and the theme button's icon).

### Versus computer mode (approved 2026-11-17, #8)

Spec: [computer-opponent/spec.md](../computer-opponent/spec.md) (stories CM-n), shipped as [requirements VC](requirements.md#vc-versus-computer). The product owner approved these artboards on 2026-11-17 (#8). The setup screens 1, 7, 14 and 15 now start with the game mode switch, with **Two players** selected; the rest of each screen is unchanged [CM-1, CM-6, CM-34]. The sample person is Ярослава Петрук on Ukrainian screens and Alexandra Brown on English ones, both exactly 15 characters and never cut [GS-1, GB-5]. The person's color is coral and the computer's automatic color is teal, which is what the swatch rule gives for coral [CM-9, VR-37]. (Before the visual refresh the mockups used an illustrative red and green.) Desktop game screens are in Ukrainian and mobile game screens in English, so every new string appears in both languages.

Desktop page (second row):

16. Setup, Versus computer: game mode switch (Versus computer selected), difficulty switch (Normal selected) with the muted Normal hint below it (VC-26, added after approval, not drawn on the artboard), "Ви" fieldset with name and color, and a read-only "Суперник" fieldset with the robot, "Комп’ютер" and its automatic color [CM-1, CM-2, CM-4..7, CM-9]
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

- **Mode and difficulty switches**: a labelled `role="radiogroup"` styled like the language toggle (`rounded-md border border-border bg-surface p-0.5 shadow-sm`), stretched to full width with equal-width options. The selected option is `bg-accent text-on-accent`. Options are `min-h-8` from `sm` up and `min-h-11` on phones. Difficulty sits right under the mode switch and is shown only in Versus computer mode [CM-6].
- **Hint under a control**: one line of muted text (`text-sm text-muted`) right below the control it explains, tied to it with `aria-describedby`. The difficulty switch has one describing only the selected difficulty [VC-26], and the size input has "From 2 to 10" above its validation error [GS-2]; `BaseHint.vue` draws both.
- **Robot icon**: Material Symbols `smart_toy` (outlined, `viewBox="0 -960 960 960"`) as inline SVG with `fill: currentColor` and `aria-hidden="true"`. It is 20 px in Turn, 16 px in score rows, 24 px in the result heading and 18 px in the setup Opponent field. It always sits between the color swatch and the written name, which stays the accessible text [CM-13, CM-37].
- **Thinking**: `text-sm text-muted animate-pulse` in an `aria-live="polite"` element under the name in Turn (as on mobile artboard 24, on both layouts). The hint is hidden while the computer's move is pending.
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
| `setup.sizeHint` | From {min} to {max} (From 2 to 10) | Від {min} до {max} (Від 2 до 10) |
| `setup.easyHint` | The computer picks a random line. | Комп’ютер обирає випадкову лінію. |
| `setup.normalHint` | The computer takes squares whenever it can and tries not to give you any. | Комп’ютер забирає квадрати, коли може, і намагається не віддавати їх вам. |
| `setup.you` | You | Ви |
| `setup.opponent` | Opponent | Суперник |
| `players.computer` | Computer | Комп’ютер |
| `validation.computerName` | This name belongs to the computer | Це ім’я належить комп’ютеру |
| `validation.maxLength` | {field} can be at most {length} characters. | Поле «{field}» може містити не більше {length} символів. |
| `status.thinking` | Thinking… | Думає… |
| `status.yourTurn` | Your turn | Ваш хід |
| `status.computerDrew` | Computer drew a line | Комп’ютер провів лінію |
| `status.computerClaimedOne` | Computer drew a line and claimed a square | Комп’ютер провів лінію і зайняв квадрат |
| `status.computerClaimedTwo` | Computer drew a line and claimed two squares | Комп’ютер провів лінію і зайняв два квадрати |
| `result.youWon` | You won! | Ви перемогли! |
| `result.computerWon` | Computer won | Комп’ютер переміг |

`validation.computerName` (CM-8) and `validation.maxLength` (GS-1) aren't shown on an artboard. The rules text (`rules.step1`–`step5`) already reads neutrally in both languages ("Take turns…" / "Гравці по черзі…", "the other player"), so CM-35 needed no new wording.

### Visual refresh (approved 2026-11-18, #23)

Spec: [visual-refresh/spec.md](../visual-refresh/spec.md) (stories VR-n). The design follows the approved prototype (game layout A, logo combo 1); the prototype branch was deleted after the refresh was built. Every artboard above is restyled in light Warm cream: the header replaces the bare language toggle, the swatch picker replaces the color input, and the Show/Hide rules toggle is gone [VR-1..VR-10, VR-18, VR-28, VR-32]. The sample players are now coral (Оля, Ярослава Петрук, Ann) and teal (Богдан, Bob, the computer); teal is exactly the swatch the computer picks against coral [VR-37]. Desktop game artboards are 520 px wide so the 212 px result panel fits beside the board.

Desktop page, D row (dark):

- D1 Setup, D3 Mid-game, D4 Stop confirmation, D5 Result, D13 Rules panel [VR-12, VR-17]

Mobile page, D row (dark):

- D7 Setup, D8 Game, D10 Stop confirmation at 320 px, D11 Result, D12 Rules panel full screen [VR-12, VR-25]

"Brand and components" page:

- B1 Header: desktop light, dark and English; phone at 390 and 320 px; the theme and info buttons with their states [VR-13, VR-16, VR-18, VR-21, VR-22]
- B2 Swatch picker: the 8 named swatches in both languages, the player field with the selected swatch in light and dark, the same-swatch error, and every swatch as lines and a square fill on the light and dark board [VR-32..VR-38]
- B3 Logo set: the logo at 16–128 px on cream and cocoa, the SVG favicon on light and dark tab bars, the install icons on a cream tile with the maskable safe zone, and circle and squircle launcher masks [VR-19, VR-40..VR-43]

The remote Claude Design canvas is synced from these files separately.

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

// dots-and-boxes-game.model.ts
export type GameStatus = 'playing' | 'finished'
export type FinishReason = 'completed' | 'stopped'
export type GameMode = 'twoPlayers' | 'computer'
export type Difficulty = 'easy' | 'normal'

export class DotsAndBoxesGame {
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

## Rules (methods on `DotsAndBoxesGame`)

Follows the existing pattern where the model owns its logic.

| Method / getter | Behavior | Req |
| --- | --- | --- |
| `players`, `currentPlayer`, `getPlayerByName(name)`, `getOpponent(name)` | Player lookups by name. | — |
| `isGameStarted` | Both players and a size are set, so Page shows the game instead of setup. | GS-3 |
| `isFinished` | `status === 'finished'`. | END-7 |
| `isComputerGame` | `gameMode === 'computer'`. | VC-1 |
| `isComputerTurn` | Computer game, not finished, and the current player is the computer player. | VC-10, VC-12 |
| `setGameMode(mode, difficulty)` | Sets the mode; the difficulty is kept only in `'computer'` (default `'easy'`), else `null`. The constructor applies the same rule through one shared helper, so the default exists once. | VC-1, VC-4, VC-20 |
| `hasLine(a, b)` | Some line has key `Line.key(a, b)`. | MV-3 |
| `neighbors(dot)` | Up to 4 orthogonal dots inside `0..size`. | MV-3 |
| `validNeighbors(dot)` | `neighbors(dot)` without drawn edges. | MV-3, MV-5 |
| `isValidStartDot(dot)` | Not finished, inside the board, (`lines.length === 0` or some line touches `dot`), and at least one valid neighbor. | MV-1, MV-2, MV-4 |
| `canDraw(a, b)` | `isValidStartDot(a)` and `b` is in `validNeighbors(a)`. | MV-3 |
| `legalMoves()` | Every line the current player may draw now, each listed once with no owner: valid starts × their `validNeighbors`. The strategy uses it, so the rules stay in one place (ADR-0003). | VC-11 |
| `drawLine(a, b)` / `drawLine(line)` | Given a `Line` (e.g. from `legalMoves()`), draw it from whichever end is a valid start, since a `Line` stores its ends in board order. Guard `canDraw`. Push a `Line` owned by the current player. Each adjacent square (see below) with 4 drawn edges and no owner becomes a `Square` owned by the drawer. Pass the turn to the opponent. When all N² squares are owned, finish with `'completed'`. Returns the squares it closed. | SQ-1..3, TR-1, END-1 |
| `drawnSideCount(r, c)` | How many of the square's four edges are drawn (0..4); `isSquareClosed` is `=== 4`. | SQ-1, VC-17 |
| `squaresNextTo(line)` | The squares on either side of a line (see below), inside the board. Used by `drawLine` and the computer strategy, so square geometry lives in one place. | SQ-1, SQ-2, VC-17 |
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
src/pages/dots-and-boxes-connected/
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
    GameResult.vue    # replaces GameStatus when finished: winner/Draw, score, New game settings, Rematch
    PlayerScore.vue   # one score row: color swatch, name, score
  rules/
    GameRules.vue     # "How to play" content with the five numbered rules
    RulesPanel.vue    # modal rules panel (side panel / full screen), rendered once in App.vue
src/shared/
  components/AppLogo.vue              # the logo SVG (dot color, optional animation)
  components/BaseSegmentedControl.vue # labelled radiogroup switch (game mode, difficulty), optional hint
  components/BaseHint.vue             # muted hint text under a control (aria-describedby target)
  components/LanguageToggle.vue       # UA / EN buttons in the header
  components/PlayerName.vue           # displayed name, with the robot for the computer player
  components/RobotIcon.vue            # inline-SVG smart_toy icon
  composables/useDisplayName.ts       # stored name → displayed name
  components/RulesStoryboard.vue      # the rules panel's "In pictures" storyboard (RL-7)
  composables/useRulesPanel.ts        # shared open state of the rules panel
  rules-storyboard.ts                 # the storyboard's scripted 3×3 game and its four frames
  composables/useTheme.ts             # system preference, saved override, effective theme
  icons/                              # Material Symbols Rounded as inline-SVG components
src/utils/swatches.ts                 # SWATCHES (8 keys + hex), randomSwatch()
src/utils/computer-color.ts           # computerColorFor() over SWATCHES
```

All sizes and colors come from the approved canvas.

- **Game.vue**: a `flex items-start gap-6` row with GameBoard, then GameResult when finished, otherwise GameStatus. It holds `selectedDot` so GameStatus can show the hint:
  - no lines yet: "Pick any dot to start the first line."
  - Dot1 selected: "Pick a highlighted neighbor to draw the line. Pick the selected dot again to cancel."
  - otherwise: "Pick a highlighted dot to start a line."

  Stop and Rematch clear the selection. The old "Back" button is gone; Stop, then New game settings, leads back to setup.
- **GameBoard.vue** [GB-1..3, MV-4..8]
  - Absolutely positioned elements inside a `rounded-lg border-border bg-surface` box (the lighter "paper" surface, VR-5) of `N·cell + 32` px plus the border. `cell` is the square size: 48 px, or smaller on narrow screens (see Mobile). A dot's center is at `(16 + col·cell, 16 + row·cell)`.
  - Owned squares: `cell` px, owner color mixed at 30% over transparent, bold uppercase initial in the owner color.
  - Lines: `(cell + 4)`×4 px (horizontal) or 4×`(cell + 4)` px (vertical), centered on the dots, in the owner color.
  - Dots are square `<button>` tap areas of `min(cell, 44)` px, with no border radius so the corners stay tappable. Each has an `aria-label`, and its focus outline is drawn 2 px inside the tap area so the board edge doesn't clip it [MB-4]. States:
    - idle: 8 px `dot` dot, disabled
    - start: 20 px ring with a 2 px `accent` border and `accent/12` fill, 8 px `ink` dot [VR-6]
    - selected: 26 px ring in the current player's color (12% fill), 12 px dot in that color with a `surface` border
    - target: 22 px dashed ring in the current player's color (12% fill), 8 px `ink` dot
  - Click handling:
    - If the game is finished, ignore the click.
    - Clicking the selected dot cancels.
    - With a selection, clicking a valid target calls `game.drawLine(selected, dot)` and clears the selection.
    - Otherwise, clicking a valid start selects it (or switches the selection to it).
    - Anything else is ignored.
- **GameStatus.vue** [GB-4, END-2]: a `w-53` column (the same width as GameResult, so nothing moves when the result replaces it [MB-9]) with Turn (swatch and name), Score (`PlayerScore` rows), the hint and a Stop button (`BaseButton` secondary). Stop opens a dialog: a `fixed inset-0 bg-ink/40` backdrop and a `w-75 p-6 rounded-lg border shadow-lg` card with "Stop the game?", "Whoever owns more squares now wins.", the scores, and Cancel (secondary) and Stop game (primary). Clicking the backdrop cancels; confirming emits `stop`.
- **GameResult.vue** [END-3..6, UP-10..14]: a `w-53` column with New game settings (secondary) and Rematch (primary), then "Result" over the **result card**, then the Score list (`PlayerScore` rows, winner first). The card (`data-result-card`) is `flex flex-col items-center gap-2 rounded-2xl bg-accent-soft p-4 text-center`, top to bottom:
  - a 40 px `TrophyIcon` in `text-accent`, or a 40 px `RobotIcon` in `text-ink` when the computer won; nothing on a draw;
  - the `h3` heading ("`<name>` wins", "You won!", "Computer won" or "Draw"), wrapping (`wrap-break-word`);
  - the score (`data-result-score`) as `5 : 3` in `text-4xl font-bold tabular-nums`, winner first (player order on a draw). Each number is `text-ink` on a swatch chip, `rounded-xl border-2 px-2.5 min-w-14`, edged in the player's color and filled with `color-mix(in srgb, <color> 30%, var(--color-surface))`, so it stays readable on any saved hex in both themes (VR-17);
  - "All squares are filled." or "The game was stopped." in `text-sm text-muted`.
  - Entrance: `motion-safe:animate-result-in` (`result-in` in `styles.css`: fade from 0 and scale from 0.95, 250 ms ease-out), so nothing moves under `prefers-reduced-motion: reduce`.
  - New game settings: `StorageService.removeItem(CURRENT_GAME)` then `game.reset()`.
  - Rematch: `game.start()`.
- **PlayerScore.vue**: a `text-sm leading-6` row with a 12 px swatch, the full name through `PlayerName` (wrapping, see Player names) and a `tabular-nums` score.

Versus computer changes to these components are described in [Versus computer](#versus-computer-vc-125).

## Player names [GS-1, GB-5]

- **Required marker** [GS-1, GS-2]: `BaseLabel` takes a `required` prop that appends ` *` in an `aria-hidden="true"` `text-danger` span, and the matching `BaseInput` gets `aria-required="true"`. Used on each player's Name and on Size; the color swatches aren't marked. No "* required" legend.
- **PlayerField.vue**: the name `<input>` has `maxlength="15"`, and the field's rules add `max:15` so a pasted or restored value is still validated, with its own message `validation.maxLength` ("Player 2 name can be at most 15 characters.").
- **GameSetup.vue**: the size field starts at 4 and its rules are `required|integer|min_value:2|max_value:10`; the bounds are `MIN_SIZE`/`MAX_SIZE` in `src/static/board.ts`, which also fill the hint [GS-2]. Under the input sit the `setup.sizeHint` hint (`BaseHint`) and then any validation error, so the hint never disappears. The input's `aria-describedby` names the hint, plus the error's id while one shows, and `aria-invalid="true"` is set while there is an error.
- Names are never truncated. Every place that shows a name (GameStatus turn, PlayerScore, GameResult heading) drops `truncate` and uses `min-w-0 break-words`, so a long name wraps; the color swatch stays `shrink-0` and aligned to the first line.

## Persistence [PS-1..3]

`Game.vue`'s `watchEffect` saves the whole reactive game (including `gameMode` and `difficulty`) with `StorageService.setItem(CURRENT_GAME, game)`. `Page.vue` restores it with `StorageService.getItem(CURRENT_GAME, { applyParse: true })` and `dotsAndBoxesGame.reset(savedGame)`, and the constructors rebuild the `Line`, `Dot` and `Square` instances. A started, unfinished save without `currentPlayerName` (saved before gameplay existed) gets `start()` [PS-3]. `status` decides whether Game shows GameStatus or GameResult. The dot selection isn't saved.

## Mobile [MB-1..9]

The phone layout is the default, and `sm:` classes (640 px and up) restore the desktop layout described above.

- **Game.vue**: `flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-6`. The board wrapper is centered on phones (`self-center sm:self-start`), and the panel is full width (`w-full`, with `sm:w-53 sm:shrink-0` for both GameStatus and GameResult, so the centered group keeps its width when the game ends). From `sm` up, `justify-center` centers the board + panel group horizontally [MB-9].
- **Board size** (GameBoard): `cell = clamp(floor((viewportWidth − 16 − sidePanel − 34) / N), 24, 48)`.
  - `viewportWidth` is `document.documentElement.clientWidth`, which excludes a desktop scrollbar.
  - The 16 px is the app's `p-2` gutters, and the 34 px is the board's padding plus border.
  - `sidePanel` is 0 in the stacked phone layout. When the panel sits beside the board, it is 236 px: the widest panel (GameResult, 212 px) plus the 24 px gap. "Beside" is decided by the `(min-width: 40rem)` media query, the same one Tailwind's `sm` uses. For example, a 700 px wide window gives a 10×10 board 41 px squares next to the panel.
  - Both values update on window `resize`.
  - The board sits in an `overflow-x-auto max-w-full` wrapper for screens where 24 px squares still don't fit.
- **GameStatus** [END-8]: Stop first, at full width on phones with `min-h-11` (`w-full sm:w-auto sm:min-h-0`); then Turn and Score in a two-column grid on phones (`grid grid-cols-2 gap-4 sm:flex sm:flex-col`); then the hint. The live line under the turn has `min-h-[1lh]`. The hint area is a one-cell `grid` holding invisible, `aria-hidden` copies of every hint plus the real hint, so it is as tall as the longest hint; the real hint gets `invisible` while the computer thinks.
- **Stop dialog** card: `w-full max-w-75`, inside the `p-4` backdrop.
- **GameResult** [END-4, END-9, MB-6]: the button row comes first, in Stop's slot: `grid grid-cols-2 gap-2 sm:flex sm:flex-col`, both buttons `w-full min-h-11 sm:min-h-0`. On phones New game settings is left and Rematch right; from `sm` up Rematch is on top (`sm:order-first`). A label that does not fit wraps (no `truncate`/`whitespace-nowrap`).
- **Centering** [MB-9]: horizontal only. The setup root is `mx-auto max-w-130`; the game screen is centered by Game.vue's `sm:justify-center` (on phones it is already full width with the board `self-center`). Nothing is centered vertically (no `items-center`/`min-h-screen` on the page), so content stays top-aligned when its height changes. The board wrapper keeps `max-w-full overflow-x-auto`, a scroll container whose minimum width is 0, so a board that can't shrink scrolls inside itself rather than overflowing the page [MB-1, MB-3].
- **GameSetup**: the player fieldsets row becomes `flex flex-col gap-4 sm:flex-row` (16 px, as is the `<Form>` column between mode, difficulty, players, size and Start; inside the size field label, input, hint and error keep `gap-2`) [UP-3]; each fieldset is `min-w-0 flex-1`, so the two share the row equally ("You" and "Opponent" included).

## Rules [RL-1, RL-5, RL-7, VR-23..VR-31, APP-1]

- **GameRules.vue** [RL-1, RL-5]: a `section` (gap 12 px) labelled by its "How to play" heading (`text-sm font-semibold text-ink`). Below it, an ordered list of five rules (`text-sm text-ink-soft`, gap 8 px), each with a 20 px round `bg-surface-strong` number. It has no card styling of its own any more: it sits directly on the rules panel. The rules text comes from `rules.step1`–`step5` in `src/i18n/locales` (see Languages). The English wording is:
  1. Take turns drawing a line between two neighboring dots: left, right, up or down.
  2. The first line can go anywhere. After that, start from a dot that already has a line.
  3. Draw the fourth side of a square to claim it. One line can claim two squares.
  4. After every line, the turn passes to the other player.
  5. The game ends when all squares are claimed or someone presses Stop. Most squares wins; equal scores are a draw.
- **RulesStoryboard.vue** [RL-7]: rendered by `GameRules` below the steps. A `section` with `aria-hidden="true"` (`pt-2`, gap 8 px), an `h3` "In pictures" (`rules.storyboard.title`, `text-sm font-semibold text-ink-soft`), then an `ol` `grid grid-cols-2 gap-3` of four frames. Each frame is an inline `<svg>` (`w-full h-auto`, viewBox 176×176: the board's 48 px squares and 16 px padding, scaled to the column width, so it fits the 320 px full-screen panel) above a centered `text-xs text-ink-soft` caption (`rules.storyboard.frame1`–`frame4`).
  - Drawn like GameBoard, with SVG paints set to theme variables so the frames follow the theme live: board `var(--color-surface)` with a `var(--color-border)` outline (8 px radius), idle dots 8 px `var(--color-dot)`, owned squares in the owner color at 30% with its bold initial, 4 px round-capped lines in the owner color, Dot1 as a 24 px ring in the current player's color (12% fill) around a 10 px dot in that color with a `surface` stroke, neighbors as 20 px dashed rings (12% fill) around 8 px `var(--color-ink)` dots.
  - The frames come from `storyFrames()` in `src/shared/rules-storyboard.ts`, which plays a fixed 10-line script on a real `DotsAndBoxesGame` (players named `coral` and `teal`, the swatch keys, colored from `SWATCHES`), so every frame obeys the game rules: after line 1, before line 2 with Dot1 (1,1) picked, after line 5 (Coral owns square 0,0), after line 10 (Teal's line 1,1–2,1 closes squares 1,0 and 1,1).
  - Owner letters are `t('colors.coral' | 'colors.teal')`'s first letter, uppercased: C/T in English, К/Б in Ukrainian.
- **RulesPanel.vue** replaces `RulesToggle.vue` (the Show/Hide rules button and the inline rules on setup and game are gone) [VR-24..VR-29]. It is rendered once in `App.vue`, after `RouterView`:
  - Backdrop: `fixed inset-0 z-20 bg-black/40`, fading in and out over 200 ms. A click on it closes the panel.
  - Panel: an `aside` with `role="dialog"`, `aria-modal="true"`, labelled by the "How to play" heading. `fixed inset-y-0 right-0 z-30 flex w-full flex-col gap-4 overflow-y-auto bg-surface p-5 shadow-2xl`, and from `sm` up `sm:w-96 sm:rounded-l-3xl` (384 px, 24 px radius on the left edge). It slides in from the right (`translate-x-full` → 0, 250 ms ease-out; out in 200 ms ease-in). On phones it covers the whole screen.
  - Top row: a 44 px round close button on the right (`CloseIcon`, `text-ink-soft hover:bg-surface-muted`, `aria-label` `rules.close`). Then `GameRules`. Under `prefers-reduced-motion` the slide and fade are off.
  - Focus: moves to the close button on open, is trapped while it is open, and returns to the info button on close. ✕, a backdrop click and Esc all close it [VR-26, VR-29].
  - Closed by default on every screen, and the open state isn't saved [VR-27].
- **useRulesPanel.ts**: a module-level `isOpen` ref with `open()` and `close()`, shared by the header's info button, the panel and `Game.vue`.
- **Computer turn** [VR-31, RL-6]: `Game.vue` passes `isStopConfirmOpen || rulesPanel.isOpen` as `useComputerTurn`'s `paused`, so the computer waits while the panel is open, as with the Stop dialog.
- **index.html** [APP-1]: `<html lang="uk">` with `<title>Крапки й квадрати: ланцюжок</title>`, the default before the app starts. At runtime the title and `lang` follow the language (see Languages). The deploy workflow's `404.html` copy inherits the same defaults.

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
- **Message keys**: `rules.step1`–`step5` for the rules, `rules.storyboard.title` and `frame1`–`frame4` for the storyboard, `game.hintFirstLine` / `hintSelected` / `hintStart` for hints, `game.dotLabel` with `{row}`/`{col}`, `result.wins` with `{name}`, `players.computer` for the computer player's name, `setup.player` / `setup.playerName` with `{number}`. Player names are passed in as parameters and never translated.
- **Components** call `const { t } = useI18n()`. `PlayerField` takes `number` (1 or 2) instead of a `label` string.
- **LanguageToggle.vue** [I18N-3, I18N-5]:
  - A `role="group"` element labelled `t('language.label')`: `inline-flex rounded-md border border-border bg-surface p-0.5 shadow-sm`.
  - One button per locale, showing "UA" / "EN" with `aria-label` set to the language's own name ("Українська" / "English"), `lang` set to the locale, and `aria-pressed`.
  - Pressed style `bg-accent text-on-accent`; otherwise `text-ink-soft hover:bg-surface-muted`. Size `min-h-11 min-w-11 px-3 text-sm font-medium`, with `sm:min-h-8 sm:min-w-0` from 640 px up.
- **App.vue**: the header, above `RouterView`, so it's on every screen; see [Header](#header-vr-13-vr-16-vr-18vr-23). It replaces the old `<header class="mb-2 flex justify-end">` that held only `LanguageToggle`.
- **vite.config.ts**: `define` sets the vue-i18n esm-bundler flags: `__VUE_I18N_FULL_INSTALL__: true`, `__VUE_I18N_LEGACY_API__: false`, `__INTLIFY_PROD_DEVTOOLS__: false`.
- **StorageService.setItem** accepts a `string` as well as an `object`, and strings are stored as they are.

## Versus computer [VC-1..26]

### Computer player identity

- The computer player is always `player2`, stored under `COMPUTER_NAME = '__computer_player__'` (ADR-0001). The name is longer than the 15-character limit, so a person can't type it. Lines, owned squares, scores and `currentPlayerName` keep working by name.
- `createComputerPlayer(personColor)` builds it with `computerColorFor(personColor)` [VC-6]: the swatch (see [Swatch picker](#swatch-picker-vr-32vr-39)) with the largest "redmean" distance from the person's color; ties go to the earlier swatch. An unreadable color gets the first one (coral). This replaces the separate `COMPUTER_PALETTE` [VR-37].

### Display helper [VC-8]

- `useDisplayName()` returns `displayName(name)`: `t('players.computer')` for the computer player, otherwise the name as typed. It's the only place that turns a stored name into a shown one, and it follows the language toggle.
- `PlayerName.vue` wraps it, with a `RobotIcon` in front for the computer player (`iconSize`, default 16). It's used in the Turn (20 px) and in `PlayerScore` (score rows, the Stop dialog and the result scores).
- `GameResult.vue` puts a 40 px `RobotIcon` above the heading in the result card, in place of the trophy, when the computer wins. `GameBoard.vue` uses `displayName(...)` for the owned-square initial, and `ComputerOpponentField.vue` shows an 18 px robot with `displayName(COMPUTER_NAME)`.

### Icon

- `RobotIcon.vue`: Material Symbols `smart_toy` (outlined) as inline SVG, `viewBox="0 -960 960 960"`, `fill-current`, `aria-hidden="true"`, `focusable="false"`, `data-icon="robot"`, with a `size` prop in px. It needs no network request; future icons follow the same pattern.

### Computer strategy (`src/models/computer-strategy.ts`) [VC-16, VC-17]

- `chooseComputerLine(game, difficulty, random = Math.random)` is pure (CM-39): it reads `game.legalMoves()`, returns `null` when there are none, and otherwise hands them to `STRATEGIES[difficulty]`. It never changes the game.
- For each move it looks at the squares on either side (`game.squaresNextTo`) and how many of their sides are drawn now (`game.drawnSideCount`): a move **claims** each square that has 3 sides and **gives away** each square that has 2.
- **Easy**: `pickRandom(moves, random)`.
- **Normal**: if some move claims a square, a random one among those claiming the most; otherwise a random one among those giving away the fewest. A safe line gives away 0, so this picks a random safe line when one exists (CM-24).
- CM-25 (no safe line): the primary criterion, "the fewest squares the person could claim on their next turn", is the most squares any single line of theirs closes after the computer's line. When step 3 is reached no square has three sides (step 1 would have claimed it, and the missing side of a three-sided square is always a legal move), so the only three-sided squares afterwards are the ones the computer's line gave away. Those lie on opposite sides of that line and share no other side, so the person's best reply claims exactly one square for every candidate: the primary criterion always ties. The strategy therefore doesn't compute it; it goes straight to the secondary criterion, fewest squares given a third side, then the random source. The spec `with no safe line left, leaves me the fewest squares to claim on my next turn` pins this property by playing out every reply.
- `pickRandom` uses `Math.min(n - 1, floor(random() * n))`, so tests can pass a fixed random source.

### Computer turn (`src/pages/dots-and-boxes-connected/useComputerTurn.ts`) [VC-9..13, VC-21]

- `useComputerTurn(() => game, paused)` returns `{ isThinking, cancel }`.
- It watches `isComputerTurn && !paused() ? lines.length : null` with `immediate: true`, so a restored game resumes on mount. Every change cancels any pending move; when the value isn't `null`, it sets `isThinking` and schedules the move `COMPUTER_DELAY_MS` (1000 ms) later.
- The move re-checks `isComputerTurn`, asks `chooseComputerLine(game, game.difficulty)` (the model guarantees a computer game has one) and draws the line through the normal `drawLine(line)`, which picks the valid end as the start.
- `Game.vue` calls `cancel()` in `stop`, `rematch` and `newGameSettings`; unmounting cancels too.
- `GameStatus` exposes its Stop dialog through `v-model:confirming`; `Game.vue` passes that as `paused`, so the computer waits while the dialog is open and gets a fresh pause after Cancel (VC-13). The board stays locked meanwhile because `isComputerTurn` still holds.
- `Game.vue` passes `isThinking || isComputerTurn` to `GameBoard` as `locked` (every dot `idle`, clicks ignored) and to `GameStatus` as `thinking`.

### Status and board [VC-10, VC-14, VC-15]

- `GameStatus.vue`: on the person's turn in a computer game (`isComputerGame && !isComputerTurn`) the Turn reads `status.yourTurn` next to the person's swatch; otherwise it shows `PlayerName`. Under it, an always-rendered `<p aria-live="polite">` shows `status.thinking` with `animate-pulse` while `thinking`, and the hint (`data-hint`) is hidden then. Once the computer has drawn, and until the next line, it shows `status.computerDrew`, or `status.computerClaimedOne` / `status.computerClaimedTwo` when owned squares lie next to that newest line (`squaresNextTo`), so screen readers hear the move [CM-37]. It's derived from `lines`, so a reload on the person's turn shows it too, without announcing it.
- `GameBoard.vue`: `lastComputerLine` is the newest line when its owner is the computer player and the game isn't finished. It's derived from `lines`, so it survives a reload. That line gets `box-shadow: 0 0 0 4px color-mix(in srgb, <color> 40%, transparent)`.

### Result [VC-19]

- `GameResult.vue`: in a computer game the heading is `result.computerWon` or `result.youWon`; in Two players it's `result.wins` with the displayed name. Draw is unchanged, and the scores are sorted winner first, in the result card and in the Score list.

### Setup [VC-1..7, VC-26]

- `GameSetup.vue` has a `BaseSegmentedControl` for the game mode, and a second one for the difficulty only when the mode is `'computer'`, with `hint` set to `setup.easyHint` or `setup.normalHint` for the selected difficulty [VC-26]. The vee-validate `<Form>` has `keep-values`, so values typed in either mode survive a switch [VC-7].
  - Versus computer: a `PlayerField` with `legend="You"` (field label `setup.name`, so messages read "Name is not valid."), `reject-computer-name` and no other names to differ from, then `ComputerOpponentField` with `computerColorFor(values.player1.color)`.
  - Two players: the two `PlayerField`s as before.
  - `submit()` emits a `GameSetupForm`. In computer mode `player2 = createComputerPlayer(player1.color)`, and a second person typed earlier is ignored. `Page.vue` applies it with `setGameMode(...).setPlayer1(...).setPlayer2(...).setSize(...).start()`.
- `BaseSegmentedControl.vue` (generic over the value type): a visible label (`aria-hidden`) plus a `role="radiogroup"` with the same `aria-label`. Each option is a `role="radio"` button with `aria-checked`, `flex-1` and `min-h-11 sm:min-h-8`; the selected one is `bg-accent text-on-accent`. An optional `hint` prop renders a `BaseHint` below the group, and the group's `aria-describedby` points at it (id from `useId()`) [VC-26].
- `BaseHint.vue` (`src/shared/components/`): the muted hint under a control, a `<p>` with `text-sm text-muted` and the `id` the control's `aria-describedby` names. Any setup field can use it.
- `PlayerField.vue` registers `notComputerName`: the name, trimmed, with `'`, `’` and `ʼ` unified and lower-cased, must not equal `players.computer` of any locale in `SUPPORTED_LOCALES`, normalized the same way [VC-5].

### Preferences [VC-2]

- Storage keys `GAME_MODE` and `DIFFICULTY` (`src/static/storage-keys.ts`), next to `LOCALE`, are written as plain strings through `StorageService`.
- `GameSetup.vue` reads them when it's created. A missing or unknown value falls back to `'computer'` / `'normal'`.
- `submit()` writes both, so they change only when a game starts. The difficulty is written in Two players too, so the next Versus computer setup shows the last chosen difficulty.

## Visual refresh [VR-1..52]

Spec: [visual-refresh/spec.md](../visual-refresh/spec.md). Artboards: see [Visual refresh](#visual-refresh-approved-2026-11-18-23) under Visual draft. The game screen keeps its structure and component split (prototype variant A); only styling changes [VR-10].

### Palette and theme [VR-1..VR-5, VR-11..VR-17]

The **Warm cream** palette is a set of semantic CSS custom properties in `src/assets/styles.css`: light values on `:root`, dark values on `:root[data-theme='dark']`, exposed to Tailwind v4 through `@theme inline` as `--color-<token>`, so components write `bg-surface`, `text-ink`, `border-border` and so on, never raw `gray`/`blue`/`white`. (The prototype remapped Tailwind's `gray`, `blue` and `white` scales as a shortcut; that isn't carried over.) The canvas uses the same names as `--wc-<token>`.

| Token | Used for | Light | Dark |
| --- | --- | --- | --- |
| `paper` | app background, swatch ring gap | `#fbf5ec` | `#241c17` |
| `surface` | fields, board, rules panel, header buttons, dialog | `#fffdf8` | `#30261f` |
| `surface-muted` | hover background, read-only fields | `#f3e8d9` | `#3a2e26` |
| `surface-strong` | secondary button, rule numbers | `#ecdfcc` | `#45372d` |
| `border` | borders, secondary hover | `#e2d3bd` | `#574638` |
| `dot` | idle dots | `#bfa98f` | `#8c7663` |
| `muted` | hints, "Thinking…", captions | `#8f7963` | `#b7a28d` |
| `ink-soft` | labels, legends, rules text, icons | `#6a5544` | `#dccbb7` |
| `ink` | main text, dots on the board, logo dots, backdrops (`ink/40`) | `#4a3a2e` | `#f6ebdc` |
| `accent` (coral) | primary button, pressed toggle, selected switch option, start-dot ring, focus | `#e8735a` | `#f08c73` |
| `accent-hover` | primary hover | `#dc5f45` | `#f5a48f` |
| `accent-soft` | result card background (UP-10) | `#fdebe4` | `#3d2a22` |
| `on-accent` | text on `accent` | `#fffdf8` | `#241c17` |
| `secondary` (teal) | secondary accent | `#2a9d8f` | `#4db6a8` |
| `danger` | validation messages | `#c2412d` | `#ff9b85` |

The palette values are the prototype's (spec token table); `on-accent` and `danger` were added so text on coral and error messages stay readable in dark.

- **Font**: Nunito Variable (Latin + Cyrillic) from `@fontsource-variable/nunito`, bundled so it works offline; `--font-sans: 'Nunito Variable', ui-rounded, system-ui, sans-serif` [VR-2].
- **Shapes**: `--radius-md: 0.75rem` (12 px: buttons, fields, switches, the language toggle) and `--radius-lg: 1.25rem` (20 px: fieldsets, board, dialog). Shadows stay Tailwind's `shadow-sm` / `shadow-lg` [VR-3].
- **Buttons**: primary `bg-accent text-on-accent hover:bg-accent-hover` with an `accent` focus ring offset on `paper`; secondary `bg-surface-strong text-ink shadow-sm hover:bg-border`; both share `inline-flex items-center justify-center px-4 py-2 text-sm`, so side-by-side buttons are the same size and their labels sit centered [VR-4, MB-6].
- **Backdrops**: the Stop dialog uses `bg-ink/40`, the rules panel `bg-black/40`.
- **Player colors** stay as they are in both themes: lines in the owner's color, owned squares at 30% with the initial in the owner's color [VR-7].
- **useTheme.ts** [VR-11, VR-14, VR-15]: the system preference follows `matchMedia('(prefers-color-scheme: dark)')` live; the override is the saved `THEME` value (`src/static/storage-keys.ts`, through `StorageService`); the effective theme is the override, else the system preference. It sets `document.documentElement.dataset.theme`, and `toggle()` saves the opposite of the current theme as the override.
- `index.html` sets `data-theme` from the saved `THEME` (or the media query) in a small inline script before the app loads, so a reload doesn't flash the light theme.

### Header [VR-13, VR-16, VR-18..VR-23]

`App.vue`: `<header class="mb-4 flex items-center gap-2">` above `RouterView`, inside the existing `p-2` wrapper:

1. `AppLogo` at 32 px (`size-8`), animated, dots in `currentColor` = `ink` of the current theme.
2. The game name, `t('app.title')`, `mr-auto text-lg font-extrabold text-ink` (18 px, 800). It wraps on very narrow phones (320 px); the buttons never shrink [VR-22].
3. Theme button (`ThemeToggle.vue`): shows `DarkModeIcon` (moon) in light and `LightModeIcon` (sun) in dark; `aria-label` says what it switches to, `theme.dark` / `theme.light` [VR-13, VR-16].
4. Info button: `InfoIcon`, `aria-label` `rules.open`, `aria-expanded` bound to the rules panel, `aria-haspopup="dialog"`; opens the rules panel [VR-23].
5. `LanguageToggle` (unchanged behavior).

The two icon buttons are `flex size-11 sm:size-9 items-center justify-center rounded-full border border-border bg-surface text-ink-soft shadow-sm hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent`, with 20 px icons: 44 px tap targets on phones, 36 px from `sm` up [VR-21].

**Icons** (`src/shared/icons/`): `InfoIcon`, `CloseIcon`, `LightModeIcon`, `DarkModeIcon`, `TrophyIcon` (`emoji_events`, marked `data-icon="trophy"`), copied from Material Symbols Rounded (Apache-2.0, license note in the folder's README) as inline SVG components: `viewBox="0 -960 960 960"`, `fill="currentColor"`, `aria-hidden="true"`, a `size` prop (default 24). No icon font. `RobotIcon` keeps its place in `src/shared/components/`.

### Swatch picker [VR-32..VR-39]

- **swatches.ts**: `SWATCHES`, one list of key + hex, the same hex in both themes. The keys are also the i18n keys `colors.<key>`:

  | Key | Hex | English | Українська |
  | --- | --- | --- | --- |
  | `coral` | `#e8735a` | Coral | Кораловий |
  | `teal` | `#2a9d8f` | Teal | Бірюзовий |
  | `sunflower` | `#e2a93b` | Sunflower | Соняшниковий |
  | `sky` | `#4f93d1` | Sky | Небесний |
  | `lavender` | `#9479cf` | Lavender | Лавандовий |
  | `leaf` | `#6aa45a` | Leaf | Зелений |
  | `berry` | `#d0638c` | Berry | Ягідний |
  | `tangerine` | `#ee8a3c` | Tangerine | Мандариновий |

  `randomSwatch(except?)` returns a random swatch hex other than `except`. `randomHexColor()` goes once nothing uses it.
- **PlayerField.vue**: the fieldset becomes `flex min-w-0 flex-1 flex-col gap-3 rounded-lg border border-border p-4`: name field on top, color below. The color `<Field>` (same `player.color` value, a hex string, so `GameSetupForm` and `Player` don't change) renders a visible "Color" label (`aria-hidden`) and a `role="radiogroup"` with the same `aria-label`, laid out `grid grid-cols-4 gap-2 p-1` on every width. Each swatch is a `role="radio"` button with `aria-checked`, `aria-label` and `title` set to `t('colors.<key>')`, `size-8 rounded-full` in its hex, `hover:scale-110`, and a focus outline in `accent` (offset 4 px). The selected one is `scale-110 ring-3 ring-ink ring-offset-2 ring-offset-paper` [VR-33, VR-34].
- **GameSetup.vue**: `player1.color = randomSwatch()`, `player2.color = randomSwatch(player1.color)` [VR-35].
- **Different colors** [VR-36]: in Two players, each color field gets a `differentColor:<other color>` rule (registered in `PlayerField`); `generateMessage` gives it `colors.taken`. It's shown under the swatches through `BaseFieldError` (`text-danger`), like other field errors.
- **ComputerOpponentField.vue**: keeps its read-only color well (`bg-surface-muted`, rounded), filled with the computer's swatch [VR-37].
- **Old saves** [VR-39]: a save whose colors are any hex (not a swatch) loads and plays with those colors; the model doesn't check them. Setup only starts from swatches.

### Logo and app icons [VR-19, VR-20, VR-40..VR-43]

- **AppLogo.vue**: one SVG (`viewBox="0 0 100 100"`, `aria-hidden`): lines `(22,22)–(78,22)` coral `#e8735a` and `(22,22)–(22,78)` teal `#2a9d8f`, both `stroke-width` 11 with round caps; the "waiting" line `(78,22)–(78,78)` sunflower `#e2a93b`, `stroke-width` 9, `stroke-dasharray="0.1 16"`, round caps (so it reads as dots); four dots of radius 9 in the `dot` prop color, and a sunflower halo of radius 14 at 25% opacity behind the top-right dot. The SVG is built by `logoSvg(options)` in `src/shared/logo.ts`, the one source for the header, the favicon and the install icons: `dot` (a color or `currentColor`), `style`, `tile` (a background color; the logo then sits on a `rx=tileRadius` rect, default 22, scaled by `scale`, default 80%, around the center) and `size`. `AppLogo.vue` has no props: it renders `logoSvg({ dot: 'currentColor' })` with `v-html` in a `size-8` span.
- **Animation**: in `AppLogo`, the waiting line runs `logo-wait` (`stroke-dashoffset` 0 → −16.1, one dash period, 1.2 s, linear, infinite) only under `prefers-reduced-motion: no-preference` [VR-20].
- **Favicon** `public/favicon.svg`: the transparent logo with a `<style>` that makes the dots `#4a3a2e`, and `#f6ebdc` under `@media (prefers-color-scheme: dark)`, so the dots stay visible on dark tab bars [VR-41]. `favicon.ico` (16, 32, 48 px, light version) is the fallback.
- **Install icons**: the logo with cocoa dots on cream `#fbf5ec`: `pwa-192x192.png` and `pwa-512x512.png` on a rounded tile (`rx` 22, logo at 80%), `maskable-icon-512x512.png` (purpose `maskable`) and `apple-touch-icon-180x180.png` on a full-bleed square with the logo at 74%, so even the halo stays inside the safe-zone circle. `npm run generate-icons` (`scripts/generate-icons.ts`, with `sharp` and `png-to-ico` as dev dependencies) writes them and the favicons once; they are committed under `public/` [VR-42, VR-43].

### Installable app (PWA) [VR-44..VR-52]

- `vite-plugin-pwa` with `registerType: 'autoUpdate'`: a new service worker installs quietly and takes over the next time the game opens; nothing interrupts a game, and the saved game in localStorage is untouched [VR-48, VR-49].
- Workbox precaches every built asset (JS, CSS, the Nunito font files, icons, `index.html`, `404.html`) and falls back to `index.html` for navigations, so `/game` works offline after the first visit [VR-47].
- Manifests: `manifest.uk.webmanifest` (Ukrainian, `name` "Крапки й квадрати: ланцюжок", `short_name` «Крапки й квадрати», linked from `index.html` by the build) and `manifest.en.webmanifest` (`name` "Dots and Boxes: Connected", `short_name` "Dots & Boxes"). Both come from `app.title` and `app.shortName` [UP-15]. Both: `display: standalone`, `orientation: any`, `start_url` and `scope` from Vite's `base` (`/dots-and-boxes-connected/` on Pages), `background_color` and `theme_color` `#fbf5ec`, and the icons above [VR-45, VR-46, VR-50..VR-52].
- `index.html` has `<meta name="theme-color" content="#fbf5ec" media="(prefers-color-scheme: light)">` and `content="#241c17"` for dark [VR-46].
- `setLocale()` also swaps the `<link rel="manifest">` `href` to the locale's manifest, along with `lang` and the title [VR-50, VR-51]. The English `app.title` is "Dots and Boxes: Connected" [UP-15].

### Message keys

Added to both locales:

| Key | English | Українська |
| --- | --- | --- |
| `theme.light` | Light theme | Світла тема |
| `theme.dark` | Dark theme | Темна тема |
| `colors.<key>` | see [Swatch picker](#swatch-picker-vr-32vr-39) | |
| `colors.taken` | This color is already taken | Цей колір уже зайнятий |

Changed: `app.title` in English (since renamed, UP-15). `rules.show` and `rules.hide` are replaced by `rules.open` ("Rules" / "Правила", the info button) and `rules.close` ("Close rules" / "Закрити правила", the close button).

## Tests

Vitest with Vue Test Utils on jsdom (`npm test`). CI runs type-check, `npm run lint-check` and the tests on every pull request, and the deploy runs the same three checks before building; any failure blocks it (CM-40).

- Specs live in `__tests__/*.spec.ts` next to the code and are type-checked through `tsconfig.vitest.json`. `src/test/setup.ts` unmounts every wrapper and clears localStorage after each test.
- Model seam: `src/models/__tests__/` (game model, legal moves, game mode rehydration, and `computer-strategy.spec.ts` with a fixed random source).
- Page seam: `src/test/mount-game-page.ts` mounts the whole app at `/game` with real i18n, router and localStorage. `src/test/game-page.ts` is the page driver (`startGame`, `startComputerGame`, `clickDot`, `drawLine`, `waitForComputer`, `reload`, …) and the only code that knows the board's DOM. Page specs fake `setTimeout`/`clearTimeout` and stub `Math.random` for the first player.

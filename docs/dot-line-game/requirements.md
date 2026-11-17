# Dot-line game: requirements

Two players take turns drawing lines between neighboring dots on a square grid. Closing a square makes the player who closed it its owner. Whoever owns more squares wins.

Domain terms (Dot, Line, Square, Owned square, Dot1/Dot2, Turn, …) are defined in [GLOSSARY.md](../../GLOSSARY.md). Decisions behind the rules are in [docs/adr/](../adr/).

## GS: Game setup (existing screen)

- **GS-1**: Each player enters a name and a color. Names are required, at most 15 characters (the field doesn't accept more), and must differ case-insensitively. The color is used for that player's lines and owned squares. Validation messages use readable, translated field names ("Ім’я гравця 1" / "Player 1 name", "Розмір поля" / "Size"), never internal names like `player1.name` (I18N-1).
- **GS-2**: Size N is required, integer, 2 ≤ N ≤ 10.
- **GS-3**: Submitting a valid form starts the game. The first player is chosen at random (see TR-2).

Acceptance:
- Given the language is English and both names are "Ann" and "ann", when I submit, then I see "Values must be different" and the game doesn't start.
- Given the language is English and Player 1's name is empty, when I submit, then I see "Player 1 name is not valid." and the game doesn't start.
- Given the language is Ukrainian and Player 1's name is empty, when I submit, then I see "Поле «Ім’я гравця 1» заповнено некоректно." and the game doesn't start.
- Given a valid form, when I submit, then the game screen opens with an empty board of size N.
- Given I type a 20-character name, then the field keeps only the first 15 characters.

## GB: Game board

- **GB-1**: The board shows (N+1)×(N+1) dots. Each square is 48×48 px.
- **GB-2**: Every drawn line uses its owner's color.
- **GB-3**: An owned square is filled with the owner's color at about 30% opacity, with the first letter of the owner's name in the middle.
- **GB-4**: The screen always shows the current player (name and color swatch) and both players' scores (owned squares).
- **GB-5**: Player names are always shown in full, never cut with "…": in the turn, the scores, the Stop dialog and the result panel. A name too long for its space wraps onto the next line.

Acceptance:
- Given N=4, then 25 dots and 16 square cells of 48×48 px are rendered.
- Given Ann (red) owns square (0,0), then that cell has a translucent red fill with "A" in it.
- Given a 15-character name on a 390 px wide phone, then the turn, scores and result show the whole name.

## MV: Moves

- **MV-1**: When no lines exist, the current player can pick any dot as Dot1.
- **MV-2**: When at least one line exists, Dot1 must be the start or end of any existing line, from either player. A dot whose adjacent edges are all drawn can't be Dot1.
- **MV-3**: Dot2 must be the left, right, top or bottom neighbor of Dot1, inside the board, and that edge must not be drawn yet. Choosing a valid Dot2 draws the line for the current player.
- **MV-4**: Valid Dot1 candidates are visually highlighted. Other dots aren't clickable as Dot1.
- **MV-5**: After Dot1 is selected, Dot1 is marked as selected and its valid Dot2 neighbors are highlighted.
- **MV-6**: Clicking the selected Dot1 again cancels the selection.
- **MV-7**: With Dot1 selected, clicking another valid Dot1 candidate that isn't a valid Dot2 moves the selection to that dot.
- **MV-8**: Any other click (invalid dot, or a dot while the game is finished) does nothing.

Acceptance:
- Given an empty board, then every dot is highlighted as a valid start.
- Given a single line (1,1)–(1,2), then only dots (1,1) and (1,2) are valid starts.
- Given Dot1 = (1,1) and line (1,1)–(1,2) exists, then (0,1), (2,1) and (1,0) are highlighted as Dot2, and (1,2) isn't.
- Given Dot1 is selected, when I click it again, then nothing is selected and the valid starts are highlighted again.

## SQ: Squares

- **SQ-1**: When a new line completes the 4th edge of a square, the player who drew that line becomes the square's owner, whoever drew the other 3 edges.
- **SQ-2**: A single line can complete two squares, and the drawer owns both.
- **SQ-3**: An owned square never changes owner.

Acceptance:
- Given square (0,0) has 3 edges drawn by Bob, when Ann draws the 4th, then Ann owns (0,0) and Ann's score goes up by 1.
- Given the shared edge between (0,0) and (0,1) is the last missing edge of both, when Ann draws it, then Ann's score goes up by 2.

## TR: Turns

- **TR-1**: After every drawn line, the turn passes to the other player, even if the line closed a square.
- **TR-2**: The first player of a game is chosen at random (both at start and on Rematch).

Acceptance:
- Given Ann closes a square, then it's Bob's turn next.

## END: End of game

- **END-1**: The game ends automatically when all N² squares are owned.
- **END-2**: A **Stop** button ends the game early, after the player confirms.
- **END-3**: The winner is the player with more owned squares. Equal scores (including 0–0) are a **Draw**.
- **END-4**: When the game ends, the final board stays visible and a result panel shows the winner (name and color), or "Draw", plus both scores.
- **END-5**: **New game** in the result panel clears the saved game and opens the setup screen.
- **END-6**: **Rematch** in the result panel keeps both players and size, clears all lines and owned squares, and picks a new random first player.
- **END-7**: No moves are possible after the game ends.

Acceptance:
- Given N=2 and the last line closes the last square, then the result panel appears immediately.
- Given Ann 3, Bob 3 and I press Stop and confirm, then the result panel shows "Draw" with Ann 3 and Bob 3.
- Given I press Stop and cancel, then the game continues unchanged.

## PS: Persistence

- **PS-1**: The game state (players, size, lines, owned squares, current player, status) is saved to localStorage on every change.
- **PS-2**: On reload, a saved game is restored as it was: an in-progress game continues with the same current player, and a finished game shows the result panel. The current Dot1 selection isn't saved.
- **PS-3**: A game saved before gameplay existed (players and size set, but no current player) starts on load with a random first player.

Acceptance:
- Given a game in progress with 5 lines, when I reload, then the same 5 lines, owners and current player are shown.

## MB: Mobile

- **MB-1**: Every screen works from 320 px wide without horizontal page scrolling. The only exception is a board that can't shrink any further (MB-3), which scrolls inside its own area.
- **MB-2**: Below 640 px wide, the game screen stacks: the board on top, centered, and the panel below it at full width. In the panel, Turn and Score sit side by side, followed by the hint and a full-width Stop button.
- **MB-3**: Squares are 48 px when the board fits the screen. On narrower screens they shrink so the board fits the available width, down to 24 px.
- **MB-4**: Each dot's tap area is a square the size of one board square (at most 44 px), centered on the dot, so neighboring dots never share a tap area.
- **MB-5**: The Stop confirmation dialog fits the screen with at least 16 px on each side.
- **MB-6**: Below 640 px wide, the result panel sits below the board at full width, with New game and Rematch side by side at equal width.
- **MB-7**: Below 640 px wide, the setup form shows Player 1 above Player 2.
- **MB-8**: Below 640 px wide, buttons on the game screen are at least 44 px tall.

Acceptance:
- Given a 390 px wide phone and N=4, then squares are 48 px and the board is centered above the panel.
- Given a 390 px wide phone and N=10, then squares are 34 px and the whole board is visible without scrolling.
- Given a 320 px wide phone, when I press Stop, then the dialog has at least 16 px of space on both sides.
- Given a 1024 px wide screen, then the layout is the desktop one (board with the panel beside it).

## RL: Rules

- **RL-1**: A short "How to play" rules section explains the game in five points: how lines are drawn, where a line can start, how squares are claimed, that turns alternate, and how the game ends and who wins.
- **RL-2**: The setup screen and the game screen both end with a rules toggle button, with the rules shown below it when open. Both screens use the same rules component.
- **RL-3**: The rules are shown by default on the setup screen ("Hide rules") and hidden by default on the game screen ("Show rules"). Pressing the button switches them, and the open/closed state isn't saved.
- **RL-4**: The toggle button tells assistive technology whether the rules are shown (`aria-expanded`). Below 640 px wide it is full width and at least 44 px tall.
- **RL-5**: The rules text matches the game rules (MV-1..3, SQ-1..2, TR-1, END-1..3). When a rule changes, its text changes with it.

## APP: App

- **APP-1**: The browser tab title follows the language: "Точки й лінії" in Ukrainian and "Dot Line Game" in English (I18N-3).

Acceptance:
- Given I open the setup screen, then "How to play" is shown below the form, and the button above it reads "Hide rules".
- Given the rules are shown on setup, when I press "Hide rules", then they disappear and the button reads "Show rules".
- Given a game in progress, then the rules are hidden and the button at the bottom reads "Show rules". When I press it, the same five rules appear.
- Given a 390 px wide phone, then the rules button spans the screen width and is at least 44 px tall.
- Given the app is open in English, then the browser tab reads "Dot Line Game".

## I18N: Languages

- **I18N-1**: Every text the UI shows is available in Ukrainian and English: labels, buttons, hints, the Stop dialog, the result panel, the rules, validation messages, dot `aria-label`s and the browser tab title. Player names are shown exactly as typed.
- **I18N-2**: Ukrainian is the default language on the first visit.
- **I18N-3**: A language toggle ("UA" / "EN") sits at the top right of every screen. Switching changes all text at once, along with the page's `lang` attribute and the tab title.
- **I18N-4**: The chosen language is saved in localStorage and restored on reload.
- **I18N-5**: The toggle is a labelled button group. Each button has `aria-pressed` and the full language name for assistive technology, and below 640 px wide each button is at least 44×44 px.
- **I18N-6**: A validation message that's already on screen switches language the next time its field is validated.

Acceptance criteria elsewhere in this document quote the English text; the Ukrainian UI shows the matching translations from `src/i18n/locales/uk.ts`.

Acceptance:
- Given a first visit, then the setup screen shows "Налаштування гри" and "Як грати", and "UA" is pressed in the toggle.
- Given I press "EN", then the setup screen shows "Game Setup", the tab reads "Dot Line Game", and the page has `lang="en"`.
- Given I chose English, when I reload, then the app is still in English.
- Given a game in progress in Ukrainian, then the panel shows "Хід", "Рахунок" and "Зупинити", and player names are unchanged.
- Given a 390 px wide phone, then each toggle button is at least 44×44 px.

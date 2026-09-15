# Dot-line game: requirements

Two players take turns drawing lines between neighboring dots on a square grid. Closing a square makes the player who closed it its owner. Whoever owns more squares wins.

## Glossary

| Term | Meaning |
| --- | --- |
| Size **N** | Number of squares per side (the game is NxN squares). Chosen in setup. |
| Dot | Grid point `(row, col)`, `0 ≤ row, col ≤ N`. The board has (N+1)×(N+1) dots. |
| Square | Cell `(row, col)`, `0 ≤ row, col ≤ N-1`, bounded by 4 edges. |
| Line | A drawn edge between two orthogonally adjacent dots, owned by the player who drew it. The board has 2·N·(N+1) possible lines. |
| Owned (dirty) square | A square whose 4 edges are all drawn. Stored in `DotLineGame.dirtySquares`. |
| Dot1 / Dot2 | The first and second dot a player clicks to draw one line. |
| Current player | The player whose turn it is. |

## GS: Game setup (existing screen)

- **GS-1**: Each player enters a name and a color. Names are required and must differ case-insensitively. The color is used for that player's lines and owned squares.
- **GS-2**: Size N is required, integer, 2 ≤ N ≤ 10.
- **GS-3**: Submitting a valid form starts the game. The first player is chosen at random (see TR-2).

Acceptance:
- Given both names are "Ann" and "ann", when I submit, then I see "Values must be different" and the game doesn't start.
- Given a valid form, when I submit, then the game screen opens with an empty board of size N.

## GB: Game board

- **GB-1**: The board shows (N+1)×(N+1) dots. Each square is 48×48 px.
- **GB-2**: Every drawn line uses its owner's color.
- **GB-3**: An owned square is filled with the owner's color at about 30% opacity, with the first letter of the owner's name in the middle.
- **GB-4**: The screen always shows the current player (name and color swatch) and both players' scores (owned squares).

Acceptance:
- Given N=4, then 25 dots and 16 square cells of 48×48 px are rendered.
- Given Ann (red) owns square (0,0), then that cell has a translucent red fill with "A" in it.

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

## Confirmed in design review (2026-09-15)

These started as assumptions and were accepted with the design canvas:
- Stop asks for confirmation (END-2).
- The existing "Back" button on the game screen is replaced by Stop. Setup is reached only through New game (END-5).
- Rematch re-randomizes the first player (TR-2, END-6).
- Finished games are restored with the result panel on reload (PS-2).
- A dot with no undrawn adjacent edges isn't a valid Dot1 (MV-2).

## Source requirements coverage

Every statement from the product owner's brief and follow-up answers, and where it's specified.

| Source statement | Covered by |
| --- | --- |
| Game setup sets the size (NxN) and each player's name and color | GS-1, GS-2 |
| The player's color is used for their lines | GS-1, GB-2 |
| When everything is entered, Game.vue opens and the game starts | GS-3 |
| NxN squares shown as (N+1)×(N+1) dots; each square is 48×48 px | GB-1 |
| First move: click any dot, then only its left/right/top/bottom neighbor | MV-1, MV-3 |
| The line is drawn in the player's color | GB-2 |
| Later lines can start only where existing lines are, not at any dot | MV-2 |
| A player who closes a square with lines owns it, and `dirtySquares` is filled | SQ-1, SQ-2, SQ-3, design data model |
| Winner is whoever owns more squares | END-3 |
| The game ends when all squares are filled | END-1 |
| The game can be stopped; the player with more squares wins | END-2, END-3 |
| Answer: a line can start from the start or end of any line on the board | MV-2 |
| Answer: turns always alternate | TR-1 |
| Answer: equal scores show a draw | END-3 |
| Answer: highlight valid starts and neighbors, re-click cancels, another start switches | MV-4, MV-5, MV-6, MV-7 |
| Answer: result panel with New game and Rematch | END-4, END-5, END-6 |
| Answer: random first player | TR-2 |
| Answer: owned square has a translucent owner fill and the owner's initial | GB-3 |
| Answer: one game-level list of lines in the model | design data model |
| Existing app: the game is kept in localStorage | PS-1, PS-2, PS-3 |
| Follow-up request: take the mobile version into account | MB-1..MB-8 |

## Open / assumed (mobile)

The mobile request didn't specify these details. They are shown on the "Mobile" page of the design canvas for confirmation:
- The phone layout applies below 640 px wide (Tailwind `sm`) (MB-2, MB-6, MB-7, MB-8).
- On phones the board comes first and the panel follows below it (MB-2).
- Squares shrink to fit narrow screens instead of the board scrolling, with a 24 px minimum (MB-3).

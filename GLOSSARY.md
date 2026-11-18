# Dots and Boxes: Connected

A turn-based game on a square grid of dots: players draw lines between neighboring dots and claim the squares they close. Played by two people on one device, or by one person against the computer.

## Board

**Size**:
The number of squares per side, written N. The board is N×N squares and (N+1)×(N+1) dots.
_Avoid_: field size, grid size

**Dot**:
A grid point at a row and column, from 0 to N inclusive.
_Avoid_: point, node

**Line**:
A drawn edge between two orthogonally neighboring dots, belonging to the player who drew it.
_Avoid_: edge, stick, segment

**Square**:
A cell of the board bounded by four possible lines.
_Avoid_: cell, box

**Owned square**:
A square whose four lines are all drawn; it belongs to the player who drew the fourth line, for good.
_Avoid_: dirty square, closed square, captured square

## Moves

**Dot1**:
The first dot a player picks for a move, where the new line starts.
_Avoid_: start point, source

**Dot2**:
The second dot a player picks, a free neighbor of Dot1, where the new line ends.
_Avoid_: end point, target

**Valid start**:
A dot that can be Dot1 right now: any dot on an empty board, otherwise an end of an existing line that still has a free neighbor.

**Legal move**:
A line the current player may draw right now: from a valid start to one of its free neighbors.
_Avoid_: valid move, possible line

**Safe line**:
A line that doesn't give any square its third drawn side, so the opponent can't claim a square with their next line.

## Players and turns

**Player**:
A participant in a game, identified by a name that is unique within the game.
_Avoid_: user, gamer

**Computer player**:
A player whose moves the game makes automatically, shown as "Computer" in the current language.
_Avoid_: AI, bot, PC, robot

**Current player**:
The player whose turn it is.

**Turn**:
One player's chance to draw exactly one line; it always passes to the other player afterwards.
_Avoid_: round

**Score**:
The number of owned squares a player has.

## Game

**Game mode**:
Who the opponent is: **Two players** (two people on one device) or **Versus computer**.
_Avoid_: game type, variant

**Difficulty**:
How well the computer player plays: **Easy** or **Normal**. Only applies in Versus computer mode.
_Avoid_: level, strength

**Stop**:
Ending a game early, on request; the current scores decide the result.
_Avoid_: quit, abort, surrender

**Draw**:
A finished game where both players have the same score.
_Avoid_: tie

**Rematch**:
A new game with the same players, size, game mode and difficulty, on an empty board.

**Setup**:
Choosing the game mode, difficulty, players and size before a game starts. It opens with the game mode and difficulty of the last game started.
_Avoid_: settings screen, config

**New game settings**:
Leaving a finished game for setup, where everything can be chosen again.
_Avoid_: new game, change settings, config

**Result card**:
The hero card at the top of the result panel when a game ends: trophy (or robot), the winner or "Draw", the score as `5 : 3` and the reason (completed or stopped).
_Avoid_: game over screen, result screen, popup

## App

**App name**:
"Dots and Boxes: Connected" (uk «Крапки й квадрати: ланцюжок»). Dots and Boxes is the classic game; "Connected" names this app's house rule that every line after the first starts from an existing one (see Valid start). A product name only: inside the game the term stays Square.
_Avoid_: Dot-line game, Dots & Lines, Точки й лінії, box (for a square)

**Swatch**:
One of the 8 fixed, named player colors (coral, teal, sunflower, sky, lavender, leaf, berry, tangerine). A person picks one on the setup screen; the computer player gets the one that looks most different from the person's.
_Avoid_: color picker, palette color

**Rules panel**:
The panel with the "How to play" rules, opened from the info button in the header (or next to the setup title) and closed with ✕, a tap outside or Esc.
_Avoid_: rules drawer, rules modal, rules toggle

**Theme**:
The light or dark version of the app's Warm cream look; follows the device until the player switches it with the theme button in the header.
_Avoid_: mode (that word belongs to game mode), skin

# Dot-line game: requirements

Two players take turns drawing lines between neighboring dots on a square grid. Closing a square makes the player who closed it its owner. Whoever owns more squares wins. The two players are either two people on one device (**Two players**) or one person and the computer player (**Versus computer**, see [VC](#vc-versus-computer)).

Domain terms (Dot, Line, Square, Owned square, Dot1/Dot2, Turn, …) are defined in [GLOSSARY.md](../../GLOSSARY.md). Decisions behind the rules are in [docs/adr/](../adr/).

## GS: Game setup (existing screen)

- **GS-1**: Each player enters a name and a color. Names are required, at most 15 characters, and must differ case-insensitively. The field doesn't accept more than 15 characters, and a longer value that gets in anyway (pasted or restored) fails validation with "<field> can be at most 15 characters." The color is used for that player's lines and owned squares. Validation messages use readable, translated field names ("Ім’я гравця 1" / "Player 1 name", "Розмір поля" / "Size"), never internal names like `player1.name` (I18N-1). In Versus computer mode only the person's name and color are entered (VC-3), and the name must not be the computer's (VC-5).
- **GS-2**: Size N is required, a whole number, 2 ≤ N ≤ 10. A fractional size such as 2.5 is rejected.
- **GS-3**: Submitting a valid form starts the game in the chosen game mode (VC-1). The first player is chosen at random (see TR-2).

Acceptance:
- Given the language is English and both names are "Ann" and "ann", when I submit, then I see "Values must be different" and the game doesn't start.
- Given the language is English and Player 1's name is empty, when I submit, then I see "Player 1 name is not valid." and the game doesn't start.
- Given the language is Ukrainian and Player 1's name is empty, when I submit, then I see "Поле «Ім’я гравця 1» заповнено некоректно." and the game doesn't start.
- Given a valid form, when I submit, then the game screen opens with an empty board of size N.
- Given I type a 20-character name, then the field keeps only the first 15 characters.
- Given the language is English and the size is 2.5, when I submit, then I see "Size is not valid." and the game doesn't start.

## GB: Game board

- **GB-1**: The board shows (N+1)×(N+1) dots. Each square is 48×48 px.
- **GB-2**: Every drawn line uses its owner's color.
- **GB-3**: An owned square is filled with the owner's color at about 30% opacity, with the first letter of the owner's displayed name in the middle ("К" / "C" for the computer player, VC-8).
- **GB-4**: The screen always shows the current player (name and color swatch) and both players' scores (owned squares).
- **GB-5**: Player names are always shown in full, never cut with "…": in the turn, the scores, the Stop dialog and the result panel. A name too long for its space wraps onto the next line. The computer player's name is shown as described in VC-8.

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
- **TR-2**: The first player of a game is chosen at random (both at start and on Rematch), in both game modes; in Versus computer mode the computer may open (VC-9).

Acceptance:
- Given Ann closes a square, then it's Bob's turn next.

## END: End of game

- **END-1**: The game ends automatically when all N² squares are owned.
- **END-2**: A **Stop** button ends the game early, after the player confirms.
- **END-3**: The winner is the player with more owned squares. Equal scores (including 0–0) are a **Draw**.
- **END-4**: When the game ends, the final board stays visible and a result panel shows the winner (name and color), or "Draw", plus both scores.
- **END-5**: **New game** in the result panel clears the saved game and opens the setup screen.
- **END-6**: **Rematch** in the result panel keeps both players, the size, the game mode and the difficulty, clears all lines and owned squares, and picks a new random first player (VC-18).
- **END-7**: No moves are possible after the game ends.

Acceptance:
- Given N=2 and the last line closes the last square, then the result panel appears immediately.
- Given Ann 3, Bob 3 and I press Stop and confirm, then the result panel shows "Draw" with Ann 3 and Bob 3.
- Given I press Stop and cancel, then the game continues unchanged.

## PS: Persistence

- **PS-1**: The game state (players, size, lines, owned squares, current player, status, game mode, difficulty) is saved to localStorage on every change.
- **PS-2**: On reload, a saved game is restored as it was: an in-progress game continues with the same current player, and a finished game shows the result panel. The current Dot1 selection isn't saved. For a reload during the computer player's turn, see VC-21.
- **PS-3**: A game saved before gameplay existed (players and size set, but no current player) starts on load with a random first player.
- **PS-4**: A game saved before game modes existed loads as a Two players game (VC-22).

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

- **RL-1**: A short "How to play" rules section explains the game in five points: how lines are drawn, where a line can start, how squares are claimed, that turns alternate, and how the game ends and who wins. The wording is neutral ("Take turns…" / "Гравці по черзі…", "the other player"), so the same rules read correctly in both game modes (VC-23).
- **RL-2**: The setup screen and the game screen both end with a rules toggle button, with the rules shown below it when open. Both screens use the same rules component.
- **RL-3**: The rules are shown by default on the setup screen ("Hide rules") and hidden by default on the game screen ("Show rules"). Pressing the button switches them, and the open/closed state isn't saved.
- **RL-4**: The toggle button tells assistive technology whether the rules are shown (`aria-expanded`). Below 640 px wide it is full width and at least 44 px tall.
- **RL-5**: The rules text matches the game rules (MV-1..3, SQ-1..2, TR-1, END-1..3). When a rule changes, its text changes with it. The computer player follows the same rules (VC-11), so computer mode adds no rules text.

## APP: App

- **APP-1**: The browser tab title follows the language: "Точки й лінії" in Ukrainian and "Dot Line Game" in English (I18N-3).

Acceptance:
- Given I open the setup screen, then "How to play" is shown below the form, and the button above it reads "Hide rules".
- Given the rules are shown on setup, when I press "Hide rules", then they disappear and the button reads "Show rules".
- Given a game in progress, then the rules are hidden and the button at the bottom reads "Show rules". When I press it, the same five rules appear.
- Given a 390 px wide phone, then the rules button spans the screen width and is at least 44 px tall.
- Given the app is open in English, then the browser tab reads "Dot Line Game".

## I18N: Languages

- **I18N-1**: Every text the UI shows is available in Ukrainian and English: labels, buttons, hints, the Stop dialog, the result panel, the rules, validation messages, dot `aria-label`s and the browser tab title, plus the Versus computer texts (VC-24). Player names are shown exactly as typed; only the computer player's name is translated (VC-8).
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

## VC: Versus computer

One person plays against the **computer player**. Stories CM-1..40 and the decisions behind them are in [computer-opponent/spec.md](../computer-opponent/spec.md); each rule names the stories it covers.

Setup:

- **VC-1**: The setup screen starts with a **Game mode** switch: **Versus computer** or **Two players**. Two players works exactly as before computer mode existed (CM-1, CM-34).
- **VC-2**: On a first visit setup opens with Versus computer and Normal selected. Afterwards it opens with the game mode and difficulty of the last game started, including after New game. These choices are saved only when a game starts, not when the switches are pressed, and the difficulty is saved even when a Two players game starts, for the next Versus computer game (CM-2, CM-3, CM-7, CM-29).
- **VC-3**: In Versus computer mode the form asks only for the person's name and color (a "You" fieldset) and the size. A read-only "Opponent" fieldset shows the robot icon, "Computer" and the computer player's color (CM-4).
- **VC-4**: A **Difficulty** switch (**Easy** / **Normal**) sits right under the game mode switch and is shown only in Versus computer mode (CM-5, CM-6).
- **VC-5**: In Versus computer mode the person's name is rejected with "This name belongs to the computer" when it matches the computer player's name in any supported language ("Комп’ютер", "Computer"), ignoring case, surrounding spaces and the apostrophe variant (', ’ or ʼ). Two players mode has no such check (CM-8).
- **VC-6**: The computer player's color is chosen automatically from a fixed palette as the color that looks most different from the person's color, and follows the person's color while it's being picked. It can't be edited (CM-9).
- **VC-7**: Switching the game mode keeps everything already typed: names, colors and size (CM-10).

Playing:

- **VC-8**: The computer player is shown as "Комп’ютер" / "Computer" in the current language, following the language toggle, with a robot icon in front of the name in the turn, the scores, the Stop dialog and the setup Opponent field, and beside the result heading. The icon is decorative; the written name is the accessible text. Its owned squares show "К" / "C" (CM-12, CM-13, CM-37).
- **VC-9**: The first player is chosen at random (TR-2). When the computer player goes first, it moves on its own (CM-11).
- **VC-10**: On the computer player's turn, the turn shows its swatch, robot and name with a pulsing "Thinking…" below, announced politely to assistive technology, and the hint is hidden. After about one second the computer draws its line (CM-14, CM-15, CM-37).
- **VC-11**: The computer player follows the same rules as a person: only lines allowed by MV-1..3, one line per turn, the turn always passes (TR-1), the squares it closes become its owned squares and count toward its score (SQ-1..3), and the game ends as soon as the last square is owned (END-1) (CM-20, CM-21, CM-26).
- **VC-12**: During the computer player's turn the board is locked: no dot is highlighted and clicks on dots do nothing (CM-16).
- **VC-13**: Stop works during the computer player's turn, and stopping cancels its pending move. While the Stop dialog is open the computer player waits; Cancel gives it its usual pause again. Rematch, New game and leaving the game screen cancel it too (CM-17).
- **VC-14**: The computer player's newest line has a halo in its color until the person draws the next line. A finished game shows no halo (CM-18).
- **VC-15**: On the person's turn, the turn reads "Your turn" (with the person's swatch) instead of the person's name (CM-19).
- **VC-16**: **Easy** draws a random line among all the lines allowed right now (CM-22).
- **VC-17**: **Normal** draws, in order of preference: a line that claims the most squares (two before one); otherwise a random **safe line**; otherwise a line that gives the fewest squares a third side, so the person can claim the fewest on their next turn. Ties are broken at random (CM-23, CM-24, CM-25).

Result and saving:

- **VC-18**: Rematch keeps the game mode, the difficulty, the person's name and color, the computer player and the size, with a new random first player (END-6). If the computer player starts the rematch, it moves on its own (CM-28).
- **VC-19**: The result heading reads "You won!" or "Computer won" (with the robot), or "Draw", followed by both scores with the winner first. Two players keeps "<name> wins" (CM-27).
- **VC-20**: The game mode and difficulty are saved with the game (PS-1) and restored with it (PS-2). A saved Versus computer game without a difficulty loads as Easy (CM-30).
- **VC-21**: A reload during the computer player's turn restores the game, shows "Thinking…" and lets the computer move after the usual pause. A reload during the person's turn restores "Your turn" with the computer's newest line still highlighted (CM-31, CM-32).
- **VC-22**: A game saved before game modes existed loads as a Two players game (PS-4, CM-33).

Rules, languages and phones:

- **VC-23**: The "How to play" rules are the same in both game modes and worded neutrally (RL-1, RL-5, CM-35).
- **VC-24**: Every new text is available in Ukrainian and English: the mode and difficulty labels, "You" and "Opponent", the computer player's name, "Thinking…", "Your turn", "You won!", "Computer won" and the name-clash message (I18N-1, CM-36).
- **VC-25**: The game mode and difficulty switches are full width with equal-width options, at least 44 px tall below 640 px wide, and the setup and thinking indicator fit from 320 px wide (MB-1, MB-8, CM-38).

Acceptance (English UI):
- Given a first visit, then setup shows "Versus computer" and "Normal" selected, a "You" fieldset and an "Opponent" fieldset with "Computer".
- Given I switch to "Two players", then the difficulty switch disappears, the Player 1 and Player 2 fieldsets appear, and the name I typed is still there.
- Given I last started a Two players game, when I open setup again, then "Two players" is selected, and switching to "Versus computer" shows the difficulty I last chose.
- Given I switch the mode but don't start a game, when I reload, then setup opens with the mode of the last game started.
- Given Versus computer mode and my name is "computer", "Комп'ютер" or " КОМП’ЮТЕР ", when I submit, then I see "This name belongs to the computer" and the game doesn't start.
- Given my color is pure red (#ff0000), then the computer player gets the palette's teal (#1f9bb0).
- Given it's the computer player's turn, then the turn shows the robot, "Computer" and "Thinking…", every dot is idle, and after about one second a new line appears and the turn reads "Your turn".
- Given the computer player has just drawn a line, then that line has a halo until I draw mine.
- Given it's the computer player's turn and I press Stop and confirm, then no line is drawn and the result panel appears.
- Given it's the computer player's turn and the Stop dialog is open, then the computer doesn't move however long I wait; when I press Cancel, it moves after about one second.
- Given Normal and a square with three sides drawn, when the computer moves, then it draws the fourth side; if one line would close two squares, it draws that one.
- Given Normal, no square to claim and at least one safe line, when the computer moves, then it never gives a square its third side.
- Given I win 5 : 4, then the result reads "You won!"; given the computer wins, it reads "Computer won" with the robot.
- Given I reload during the computer player's turn, then "Thinking…" shows and the computer moves after about one second.
- Given a saved game without a game mode, when I reload, then it continues as a Two players game.

# Dots and Boxes: requirements

Two players take turns drawing lines between neighboring dots on a square grid. Closing a square makes the player who closed it its owner. Whoever owns more squares wins. The two players are either two people on one device (**Two players**) or one person and the computer player (**Versus computer**, see [VC](#vc-versus-computer)).

Domain terms (Dot, Line, Square, Owned square, Dot1/Dot2, Turn, Swatch, Rules panel, Theme, …) are defined in [GLOSSARY.md](../../GLOSSARY.md). Decisions behind the rules are in [docs/adr/](../adr/). The look, the header, the rules panel, the swatches and the installable app came with the visual refresh ([visual-refresh/spec.md](../visual-refresh/spec.md), stories VR-n); each rule names the stories it covers.

## GS: Game setup (existing screen)

- **GS-1**: Each player enters a name and picks a color from the swatches (GS-4). Names are required, at most 15 characters, and must differ case-insensitively. Each required name field shows `*` after its "Ім’я" / "Name" label (both players in Two players mode, the person in Versus computer mode); the `*` is hidden from screen readers, which announce the input as required instead. There is no "* required" legend, and the color isn't marked because a swatch is always picked. The field doesn't accept more than 15 characters, and a longer value that gets in anyway (pasted or restored) fails validation with "<field> can be at most 15 characters." The color is used for that player's lines and owned squares, and in Two players mode the two players' colors must differ (GS-5). Validation messages use readable, translated field names ("Ім’я гравця 1" / "Player 1 name", "Розмір поля" / "Size"), never internal names like `player1.name` (I18N-1). In Versus computer mode only the person's name and color are entered (VC-3), and the name must not be the computer's (VC-5).
- **GS-2**: Size N is required, a whole number, 2 ≤ N ≤ 10. Its "Розмір поля" / "Size" label ends with the same `*` marker as the names (GS-1), and the input is announced as required. A fractional size such as 2.5 is rejected. Setup opens with size 4. A muted hint "Від 2 до 10" / "From 2 to 10" always shows under the input and describes it for assistive technology; a validation error appears below the hint instead of replacing it, also describes the input, and the input is announced as invalid while it shows.
- **GS-3**: Submitting a valid form starts the game in the chosen game mode (VC-1). The first player is chosen at random (see TR-2).
- **GS-4**: A player's color is one of 8 round **swatches**: coral, teal, sunflower, sky, lavender, leaf, berry and tangerine, the same in the light and the dark theme. They form a radio group labelled "Колір" / "Color", and each swatch is announced by its name in the current language ("Кораловий" / "Coral", …). The picked swatch has a ring and is slightly larger (VR-32..VR-34, VR-38).
- **GS-5**: Setup opens with two different random swatches for Player 1 and Player 2. In Two players mode a player can't keep the other player's swatch: the form shows "Цей колір уже зайнятий" / "This color is already taken" and the game doesn't start. In Versus computer mode the computer player's color follows VC-6 (VR-35..VR-37).

Acceptance:
- Given the language is English and both names are "Ann" and "ann", when I submit, then I see "Values must be different" and the game doesn't start.
- Given the language is English and Player 1's name is empty, when I submit, then I see "Player 1 name is not valid." and the game doesn't start.
- Given the language is Ukrainian and Player 1's name is empty, when I submit, then I see "Поле «Ім’я гравця 1» заповнено некоректно." and the game doesn't start.
- Given a valid form, when I submit, then the game screen opens with an empty board of size N.
- Given I type a 20-character name, then the field keeps only the first 15 characters.
- Given the language is English and the size is 2.5, when I submit, then I see "Size is not valid." and the game doesn't start.
- Given I open setup in Two players mode, then Player 1 and Player 2 each have 8 swatches, with two different ones picked.
- Given Two players mode and both players pick "Berry", when I submit, then I see "This color is already taken" and the game doesn't start.

## GB: Game board

- **GB-1**: The board shows (N+1)×(N+1) dots. Each square is 48×48 px.
- **GB-2**: Every drawn line uses its owner's color.
- **GB-3**: An owned square is filled with the owner's color at about 30% opacity, with the first letter of the owner's displayed name in the middle ("К" / "C" for the computer player, VC-8).
- **GB-4**: The screen always shows the current player (name and a mark in their color) and both players' scores (owned squares).
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
- **END-4**: When the game ends, the final board stays visible and a result panel shows the winner (name and color), or "Draw", plus both scores. Its Settings and Rematch buttons sit at the top of the panel, exactly where Stop was during the game (UP-6). Below them a **result card** (accent-tinted) shows, top to bottom: a trophy for the winner (the robot when the computer won, nothing on a draw), the heading, the score as `5 : 3` in large type with the winner first and each number on its player's color chip, and why the game ended (all squares filled, or stopped). The Score list with names and colors stays below the card. The card fades and grows in once, and not at all when the device asks for reduced motion (UP-10..UP-14).
- **END-8**: During the game, Stop sits at the top of the side panel, above the turn, the score and the hint. The text below it keeps its height: the line under the turn ("Thinking…" or the computer's last line) always takes one line even when empty, and the hint area is as tall as the longest hint in the current language and is only hidden, not removed, while the computer thinks. So Stop never moves while you play (UP-4, UP-5).
- **END-9**: From 640 px wide, the result buttons (Rematch and Settings, NG-10) stack at the panel's full width with Rematch on top, so a label never wraps raggedly (UP-8). Below 640 px see MB-6.
- **END-5**: **Settings** («Налаштування», NG-10) in the result panel clears the saved game and opens the setup screen.
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
- **PS-5**: A game saved before the swatches, with any other player colors, loads and plays with its old colors (VR-39).
- **PS-6**: An app update never loses the saved game (VR-49, PWA-5).

Acceptance:
- Given a game in progress with 5 lines, when I reload, then the same 5 lines, owners and current player are shown.
- Given a saved game where Anna is #ff0000, when I reload, then Anna's lines are still #ff0000 and the game goes on.

## MB: Mobile

- **MB-1**: Every screen works from 320 px wide without horizontal page scrolling. The only exception is a board that can't shrink any further (MB-3), which scrolls inside its own area.
- **MB-2**: Below 640 px wide, the game screen stacks: the board on top, centered, and the panel below it at full width. In the panel, a full-width Stop button comes first, then Turn and Score side by side, then the hint (END-8).
- **MB-3**: Squares are 48 px when the board fits the screen. On narrower screens they shrink so the board fits the available width, down to 24 px.
- **MB-4**: Each dot's tap area is a square the size of one board square (at most 44 px), centered on the dot, so neighboring dots never share a tap area.
- **MB-5**: The Stop confirmation dialog fits the screen with at least 16 px on each side.
- **MB-6**: Below 640 px wide, the result panel sits below the board at full width, with Settings and Rematch side by side at equal width at the top of the panel (Settings on the left, UP-7). A label that does not fit wraps onto more lines; it is never cut off.
- **MB-7**: Below 640 px wide, the setup form shows Player 1 above Player 2.
- **MB-8**: Below 640 px wide, buttons on the game screen are at least 44 px tall.
- **MB-9**: On every screen width, the setup form and the game screen (the board with its panel, in progress or finished, side by side or stacked) are centered horizontally below the header, which keeps its full width. They stay top-aligned: nothing is centered vertically, so validation messages, the mode switch or the result replacing the status never move the content up or down.

Acceptance:
- Given a 390 px wide phone and N=4, then squares are 48 px and the board is centered above the panel.
- Given a 390 px wide phone and N=10, then squares are 34 px and the whole board is visible without scrolling.
- Given a 320 px wide phone, when I press Stop, then the dialog has at least 16 px of space on both sides.
- Given a 1024 px wide screen, then the layout is the desktop one (board with the panel beside it).

## RL: Rules

- **RL-1**: A short "How to play" rules section opens with the game's **goal**, one sentence with the game's name in bold: "**Dots and Boxes** — whoever owns more squares when the board is full wins." / «**Крапки й квадрати** — перемагає той, у кого більше квадратів, коли поле заповниться.» (NG-7). The same sentence, from the same translation, opens the setup screen (RL-2). Below it, the section explains the game in five points: how lines are drawn, where a line can start, how squares are claimed, that turns alternate, and how the game ends and who wins. The wording is neutral ("Take turns…" / "Гравці по черзі…", "the other player"), so the same rules read correctly in both game modes (VC-23).
- **RL-2**: The rules live only in the **rules panel**, opened by the info button ("Правила" / "Rules") in the header of every screen (HD-1), mid-game included; it is the only info button (NG-9). The setup screen opens with the goal sentence (RL-1) in muted text, centred, ending with an inline "How to play →" / «Як грати →» link that also opens the panel, at least 44 px tall below 640 px (NG-5, NG-6, UP-1). Below it, with a gap, comes the bigger "Settings" / «Налаштування» title (NG-8). The setup and game screens show no rules inline and have no Show/Hide rules button (VR-23, VR-28).
- **RL-3**: From 640 px wide the panel slides in from the right, 384 px wide, over a dimmed backdrop; below 640 px it covers the whole screen. It closes with its ✕ button ("Закрити правила" / "Close rules"), a tap on the backdrop or Esc. It is closed whenever the app loads, on both screens, never opens by itself, and its open state isn't saved (VR-24..VR-27).
- **RL-4**: The panel is a modal dialog labelled by its "How to play" heading. When it opens, focus moves to ✕; Tab and Shift+Tab stay inside it; when it closes, focus returns to whatever opened it, the header's info button or the setup's "How to play" link (UP-2). The info button and the link each report the panel with `aria-haspopup="dialog"` and `aria-expanded` (VR-29).
- **RL-5**: The rules text matches the game rules (MV-1..3, SQ-1..2, TR-1, END-1..3). When a rule changes, its text changes with it. The computer player follows the same rules (VC-11), so computer mode adds no rules text. The same goes for the storyboard captions (RL-7): "The first line goes anywhere." (MV-1), "Next lines start from a drawn one: pick a dot, then a neighbor." (MV-2, MV-3), "Draw the fourth side and the square is yours." (SQ-1) and "One line can close two squares." (SQ-2).
- **RL-6**: While the rules panel is open during the computer player's turn, the computer waits; once the panel closes it gets its usual pause before moving, as with the Stop dialog (VC-13, VR-31).
- **RL-7**: Below the five rules, the panel shows a still **storyboard** headed "In pictures" / «У картинках»: four small 3×3 boards in a 2×2 grid, each with a caption in the current language. The frames come from one scripted, legal game between a coral and a teal player (it ends Coral 1, Teal 2): (1) the first line on an empty board, "The first line goes anywhere." / «Першу лінію можна провести будь-де.»; (2) Teal has picked Dot1 at the end of that line and its free neighbors are highlighted, "Next lines start from a drawn one: pick a dot, then a neighbor." / «Наступні лінії починаються від уже проведеної: оберіть точку, потім сусідню.»; (3) Coral has drawn a fourth side and owns the square, "Draw the fourth side and the square is yours." / «Проведіть четверту сторону, і квадрат ваш.»; (4) Teal's single line has closed two squares, "One line can close two squares." / «Одна лінія може закрити два квадрати.». The boards are drawn in the app with the board's look and theme tokens, so they follow the light and dark theme live; the players' lines and squares use the coral and teal swatches (GS-4), and the owner letters are the initials of the color names in the current language (C/T, К/Б). Frames fill the panel's width, also on the full-screen phone panel, with no horizontal scroll. The storyboard is static, needs no image files (PWA-4) and is hidden from assistive technology, since the rules text says the same; the panel's labelling and focus trap are unchanged (RL-4).

Acceptance:
- Given I open the setup screen, then no rules are shown and the info button in the header reports the panel as closed.
- Given I press the info button, on setup or during a game, then the panel opens with "How to play" and the same five rules, and focus is on ✕.
- Given the panel is open, when I press ✕, tap the backdrop or press Esc, then it closes and focus is back on the info button.
- Given the panel is open, when I press Tab or Shift+Tab, then focus stays inside it.
- Given it's the computer player's turn and the panel is open, then the computer doesn't move however long I wait; when I close the panel, it moves after about one second.
- Given a 390 px wide phone, then the open panel covers the screen.
- Given I open the panel, then below the rules it shows "In pictures" and four captioned 3×3 boards in a 2×2 grid: one line on an empty board; Dot1 with highlighted neighbors; one owned square; two squares owned through one line.
- Given the panel is open, when I switch the language or the theme, then the heading, captions, owner letters and board colors follow at once.
- Given a 320 px wide phone, then the four boards fit the panel without horizontal scroll.

## TH: Look and theme

- **TH-1**: The app uses the **Warm cream** look: a cream "paper" background, cocoa-brown text, coral for the primary actions (Start, Rematch, Stop game) and teal as the secondary accent, the rounded Nunito font (Latin and Cyrillic, shipped with the app), rounded corners and soft shadows on buttons, fields, panels, dialogs and the board. The board sits on a lighter surface with clearly visible idle dots, and the start, selected and target dot highlights use the accent colors. Lines and owned squares keep their owner's color (GB-2, GB-3) (VR-1..VR-8).
- **TH-2**: The refresh changes the look, not the layout: the game screen keeps the board with the side panel, and every MB rule still holds (VR-9, VR-10).
- **TH-3**: There is a light and a dark **theme**. The dark theme has a warm cocoa background and light cream text. Text, dots and player colors stay readable in both (VR-12, VR-17).
- **TH-4**: Until the player presses the theme button, the theme follows the device's light or dark setting, also when that setting changes while the app is open (VR-11, VR-15).
- **TH-5**: The theme button in the header switches between light and dark. It shows a moon in the light theme and a sun in the dark one, and tells assistive technology what it switches to: "Темна тема" / "Dark theme" or "Світла тема" / "Light theme" (VR-13, VR-16).
- **TH-6**: The chosen theme is saved in localStorage and restored on reload, over the device setting, without a flash of the other theme (VR-14).

Acceptance:
- Given a first visit on a device in dark mode, then the app is dark; when the device switches to light, the app follows.
- Given the light theme, when I press the theme button ("Dark theme"), then the app turns dark and the button reads "Light theme".
- Given I chose the dark theme on a light device, when I reload, then the app is still dark.

## HD: Header and logo

- **HD-1**: Every screen has a header: the logo and the game's name on the left; the theme button (TH-5), the info button (RL-2) and the language button (I18N-3) on the right (VR-18, VR-23).
- **HD-2**: The game's name follows the language: "Крапки й квадрати" in Ukrainian and "Dots and Boxes" in English, in the header and the browser tab (APP-1) (VR-22, UP-15, NG-11).
- **HD-3**: The logo shows the game in one picture: four dots in a square, a coral line on top, a teal line on the left and a dashed sunflower line on the right "waiting" to close the square, with a soft halo on the dot it starts from. Its dots take the text color (cocoa in light, cream in dark). It is decorative; the game's name is the accessible text (VR-18).
- **HD-4**: In the header, the dashed line moves gently. When the device asks for reduced motion, it stays still (VR-19, VR-20).
- **HD-5**: The theme, info and language buttons are round and never shrink: below 640 px wide each is a 44×44 px circle, whatever the length of the game's name (VR-21, NG-2).
- **HD-6**: The favicon is the logo on a transparent background, with cocoa dots on light tab bars and cream dots on dark ones; browsers without SVG favicons get an `.ico` version (VR-40, VR-41).

Acceptance:
- Given any screen, then the header shows the logo, the game's name, the theme button, the info button and the language button (UA or EN).
- Given the language is English, then the header and the browser tab read "Dots and Boxes".
- Given a 390 px wide phone, then the theme, info and language buttons are 44×44 px circles.

## APP: App

- **APP-1**: The browser tab title follows the language: "Крапки й квадрати" in Ukrainian and "Dots and Boxes" in English (I18N-3, HD-2, UP-15, NG-11).

Acceptance:
- Given the app is open in English, then the browser tab reads "Dots and Boxes".

## PWA: Installable app

- **PWA-1**: The game can be installed to the home screen from the published site (under `/dots-and-boxes/`) as well as locally. The installed app opens full screen without browser bars (standalone), in portrait or landscape (VR-44, VR-45, VR-52).
- **PWA-2**: The install icon is the logo on a cream tile: 192 and 512 px icons on a rounded tile, and a 512 px maskable icon and a 180 px Apple touch icon on a full square that the launcher shapes itself, with the logo inside the central 80% safe zone so a circle or squircle mask never cuts it (VR-42, VR-43).
- **PWA-3**: The splash screen and status bar use the cream background; the status bar turns cocoa when the device is in dark mode (VR-46).
- **PWA-4**: After the first visit everything works offline: setup, playing, the computer player, the rules, both languages, the font and the icons. Reloading any app address offline opens the game (VR-47).
- **PWA-5**: A new version installs quietly and takes effect the next time the game is opened, with no update prompt; the saved game is kept (PS-6) (VR-48, VR-49).
- **PWA-6**: The installed app's name follows the language chosen before installing: "Крапки й квадрати" by default, "Dots and Boxes" with English. The short name launchers fall back to is the same, «Крапки й квадрати» / "Dots and Boxes" (VR-50, VR-51, UP-15, NG-11).

Acceptance (checked on a build with `BASE_PATH=/dots-and-boxes/` and by hand, not by unit tests):
- Given the build, then it contains the Ukrainian and English manifests, the service worker and every icon the manifests and `index.html` reference.
- Given I switch the language to English, then the page links the English manifest.
- Given I visited the game once, when I reload with the network off, then the game opens and plays, computer player included.
- Given an Android phone, when I install the game, then its icon fits the launcher mask and it opens full screen.

## I18N: Languages

- **I18N-1**: Every text the UI shows is available in Ukrainian and English: labels, buttons, hints, the Stop dialog, the result panel, the rules, validation messages, dot `aria-label`s, the browser tab title, the header buttons and the swatch names, plus the Versus computer texts (VC-24). Player names are shown exactly as typed; only the computer player's name is translated (VC-8).
- **I18N-2**: On the first visit (no saved language) the language follows the device: Ukrainian when the device language is Ukrainian (`navigator.language` starts with `uk`), English otherwise (AR-6). A saved language always wins (I18N-4, AR-7).
- **I18N-3**: One round language button sits in the header of every screen (HD-1, VR-18). It shows the current language ("UA" or "EN"), and a single tap switches to the other one, changing all text at once, along with the page's `lang` attribute, the tab title and the linked install manifest (PWA-6) (NG-3).
- **I18N-4**: The chosen language is saved in localStorage and restored on reload.
- **I18N-5**: Assistive technology hears the language button as the switch, in the target language's own words and marked with that language: "Switch to English" when Ukrainian is on, «Перейти на українську» when English is on. Below 640 px wide it is 44×44 px (HD-5) (NG-4).
- **I18N-6**: A validation message that's already on screen switches language the next time its field is validated.

Acceptance criteria elsewhere in this document quote the English text; the Ukrainian UI shows the matching translations from `src/i18n/locales/uk.ts`.

Acceptance:
- Given a first visit, then the setup screen shows "Налаштування", the header shows "Крапки й квадрати", and "UA" is pressed in the toggle.
- Given I press "EN", then the setup screen shows "Settings", the tab reads "Dots and Boxes", and the page has `lang="en"`.
- Given I chose English, when I reload, then the app is still in English.
- Given a game in progress in Ukrainian, then the panel shows "Хід", "Рахунок" and "Зупинити", and player names are unchanged.
- Given a 390 px wide phone, then each toggle button is at least 44×44 px.

## VC: Versus computer

One person plays against the **computer player**. Stories CM-1..40 and the decisions behind them are in [computer-opponent/spec.md](../computer-opponent/spec.md); each rule names the stories it covers.

Setup:

- **VC-1**: The setup screen starts with a **Game mode** switch: **Versus computer** or **Two players**. Two players works exactly as before computer mode existed (CM-1, CM-34).
- **VC-2**: On a first visit setup opens with Versus computer and Normal selected. Afterwards it opens with the game mode and difficulty of the last game started, including after Settings on the result panel. These choices are saved only when a game starts, not when the switches are pressed, and the difficulty is saved even when a Two players game starts, for the next Versus computer game (CM-2, CM-3, CM-7, CM-29).
- **VC-3**: In Versus computer mode the form asks only for the person's name and color (a "You" fieldset) and the size. A read-only "Opponent" fieldset shows the robot icon, "Computer" and the computer player's color (CM-4).
- **VC-4**: A **Difficulty** switch (**Easy** / **Normal**) sits right under the game mode switch and is shown only in Versus computer mode (CM-5, CM-6).
- **VC-26**: One muted line of hint text sits below the Difficulty switch and describes only the selected difficulty; it changes when the person switches difficulty and follows the language toggle. Easy: "The computer picks a random line." / "Комп’ютер обирає випадкову лінію." (VC-16). Normal: "The computer takes squares whenever it can and tries not to give you any." / "Комп’ютер забирає квадрати, коли може, і намагається не віддавати їх вам." (VC-17). The switch is described by the hint for assistive technology (`aria-describedby`). Two players mode has no difficulty switch, so no hint (#36).
- **VC-5**: In Versus computer mode the person's name is rejected with "This name belongs to the computer" when it matches the computer player's name in any supported language ("Комп’ютер", "Computer"), ignoring case, surrounding spaces and the apostrophe variant (', ’ or ʼ). Two players mode has no such check (CM-8).
- **VC-6**: The computer player's color is chosen automatically from the same swatches as the person's (GS-4): the swatch that looks most different from the person's color. It follows the person's color while it's being picked and can't be edited (CM-9, VR-37).
- **VC-7**: Switching the game mode keeps everything already typed: names, colors and size (CM-10).

Playing:

- **VC-8**: The computer player is shown as "Комп’ютер" / "Computer" in the current language, following the language toggle, with a robot icon in front of the name in the turn, the scores, the Stop dialog and the setup Opponent field, and beside the result heading. The icon is decorative; the written name is the accessible text. Its owned squares show "К" / "C" (CM-12, CM-13, CM-37).
- **VC-9**: The first player is chosen at random (TR-2). When the computer player goes first, it moves on its own (CM-11).
- **VC-10**: On the computer player's turn, the turn shows its swatch, robot and name with a pulsing "Thinking…" below, announced politely to assistive technology, and the hint is hidden. After about one second the computer draws its line. In the same place a short message then says what it did, also announced politely: "Computer drew a line", or "Computer drew a line and claimed a square" ("…two squares"), until the person draws (CM-14, CM-15, CM-37).
- **VC-11**: The computer player follows the same rules as a person: only lines allowed by MV-1..3, one line per turn, the turn always passes (TR-1), the squares it closes become its owned squares and count toward its score (SQ-1..3), and the game ends as soon as the last square is owned (END-1) (CM-20, CM-21, CM-26).
- **VC-12**: During the computer player's turn the board is locked: no dot is highlighted and clicks on dots do nothing (CM-16).
- **VC-13**: Stop works during the computer player's turn, and stopping cancels its pending move. While the Stop dialog is open the computer player waits; Cancel gives it its usual pause again. Rematch, Settings and leaving the game screen cancel it too (CM-17).
- **VC-14**: The computer player's newest line has a halo in its color until the person draws the next line. A finished game shows no halo (CM-18).
- **VC-15**: On the person's turn, the turn reads "Your turn" (with the person's swatch) instead of the person's name (CM-19).
- **VC-16**: **Easy** draws a random line among all the lines allowed right now (CM-22).
- **VC-17**: **Normal** draws, in order of preference: a line that claims the most squares (two before one); otherwise a random **safe line**; otherwise the line that leaves the person the fewest squares to claim on their next turn and, among those, gives the fewest squares a third side. Since the turn always passes (ADR-0002), the person's next line then claims at most one square whichever line the computer drew (the two squares beside a line share no other side), so in practice the choice comes down to the fewest squares given a third side. Remaining ties are broken at random (CM-23, CM-24, CM-25).

Result and saving:

- **VC-18**: Rematch keeps the game mode, the difficulty, the person's name and color, the computer player and the size, with a new random first player (END-6). If the computer player starts the rematch, it moves on its own (CM-28).
- **VC-19**: The result heading reads "You won!" (under the trophy) or "Computer won" (under the robot, in place of the trophy), or "Draw", followed by both scores with the winner first. Two players keeps "<name> wins" (CM-27, UP-12).
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
- Given I pick "Coral", then the computer player gets "Teal"; given I pick "Sunflower", it gets "Sky".
- Given it's the computer player's turn, then the turn shows the robot, "Computer" and "Thinking…", every dot is idle, and after about one second a new line appears and the turn reads "Your turn".
- Given the computer player has just drawn a line, then that line has a halo until I draw mine.
- Given it's the computer player's turn and I press Stop and confirm, then no line is drawn and the result panel appears.
- Given it's the computer player's turn and the Stop dialog is open, then the computer doesn't move however long I wait; when I press Cancel, it moves after about one second.
- Given Normal and a square with three sides drawn, when the computer moves, then it draws the fourth side; if one line would close two squares, it draws that one.
- Given Normal, no square to claim and at least one safe line, when the computer moves, then it never gives a square its third side.
- Given I win 5 : 4, then the result reads "You won!"; given the computer wins, it reads "Computer won" with the robot.
- Given I reload during the computer player's turn, then "Thinking…" shows and the computer moves after about one second.
- Given a saved game without a game mode, when I reload, then it continues as a Two players game.

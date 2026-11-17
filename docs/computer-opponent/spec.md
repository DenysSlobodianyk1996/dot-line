# Versus computer game mode: spec

Terms follow [GLOSSARY.md](../../GLOSSARY.md). Related decisions: [ADR-0001](../adr/0001-players-identified-by-name.md) (players identified by name), [ADR-0002](../adr/0002-turn-always-passes.md) (turn always passes), [ADR-0003](../adr/0003-lines-start-from-existing-lines.md) (lines start from existing lines). User stories carry IDs **CM-n** for commits.

## Problem Statement

The dot-line game can only be played by two people sharing one device. Someone on their own can't play at all, and there's no way to practise against an opponent that always has time for a game.

## Solution

The setup screen gets a **game mode** switch: **Versus computer** (the default) or **Two players** (today's game, unchanged). In Versus computer mode the person enters only their own name, color and the size, and picks a **difficulty**, **Easy** or **Normal**. The **computer player** plays by exactly the same rules. On its turn it "thinks" for about a second, with a robot icon and a pulsing "Thinking…", then draws its line, which stays highlighted until the person answers. The result panel speaks to the person: "You won!", "Computer won" or "Draw". The mode and difficulty are remembered between games, saved with the game, and survive a reload, including a reload in the middle of the computer's turn.

## User Stories

### Setup

1. **CM-1**: As a player, I want to choose between Versus computer and Two players on the setup screen, so that I can play alone or with a friend.
2. **CM-2**: As a first-time visitor, I want Versus computer to be selected by default, so that I can start playing alone right away.
3. **CM-3**: As a returning player, I want setup to open in the game mode I used last, so that I don't have to switch it every time.
4. **CM-4**: As a player in Versus computer mode, I want to enter only my name, my color and the size, so that setup is quick and I'm not asked about a second person.
5. **CM-5**: As a player in Versus computer mode, I want to choose the difficulty, Easy or Normal, so that the game matches my skill.
6. **CM-6**: As a player, I want the difficulty choice to appear only in Versus computer mode, so that Two players setup stays as simple as today.
7. **CM-7**: As a player, I want the difficulty to default to Normal and to remember my last choice, so that I keep my preferred challenge.
8. **CM-8**: As a player, I want setup to reject my name if it matches the computer's name in either language (ignoring case), with a translated message, so that the screen never shows two "Computer"s.
9. **CM-9**: As a player, I want the computer to get a color clearly different from mine automatically, so that I can always tell our lines and squares apart.
10. **CM-10**: As a player, I want my name, color and the size to stay filled in when I switch the game mode, so that switching doesn't make me retype anything.

### Playing against the computer

11. **CM-11**: As a player, I want the first player to be chosen at random, so that sometimes the computer opens and sometimes I do, as in Two players mode (TR-2).
12. **CM-12**: As a player, I want the computer's name to appear in my current language ("Комп'ютер" / "Computer") and follow the language toggle, so that the UI stays consistent.
13. **CM-13**: As a player, I want a robot icon next to the computer's name in the turn, the scores, the Stop dialog and the result, so that I can tell at a glance which player is the computer.
14. **CM-14**: As a player, I want the Turn area to show the robot and a pulsing "Thinking…" for about one second on the computer's turn, so that I know the game is working and whose move it is.
15. **CM-15**: As a player, I want the computer's line to appear after that pause, so that its move is easy to follow rather than instant.
16. **CM-16**: As a player, I want the board locked during the computer's turn (no valid-start highlights, clicks ignored), so that I can't move out of turn.
17. **CM-17**: As a player, I want Stop to keep working during the computer's turn, and stopping to cancel the computer's pending move, so that I can end the game at any time (END-2).
18. **CM-18**: As a player, I want the computer's last line highlighted until I draw my next line, so that I can see what it just did.
19. **CM-19**: As a player, I want the Turn area to say "Your turn" when it's my turn, so that I don't have to read my own name to know it's me.
20. **CM-20**: As a player, I want the computer to follow the same rules as a person: first line anywhere, later lines from an existing line, one line per turn, and the turn always passes (MV-1..3, TR-1, ADR-0002, ADR-0003), so that the game is fair.
21. **CM-21**: As a player, I want squares the computer closes to become its owned squares and count toward its score, exactly as for a person (SQ-1..3), so that scoring is the same in both modes.
22. **CM-22**: As a beginner, I want the Easy computer to draw a random legal line, so that I can win while learning.
23. **CM-23**: As a player on Normal, I want the computer to claim a square whenever it can, preferring a line that claims two, so that it punishes my mistakes.
24. **CM-24**: As a player on Normal, I want the computer, when it can't claim a square, to draw a safe line (one that gives no square its third side), picked at random among safe lines, so that it doesn't hand me squares and doesn't play the same game every time.
25. **CM-25**: As a player on Normal, I want the computer, when no safe line is left, to draw the line that leaves me the fewest squares to claim on my next turn, so that it plays sensibly to the end.
26. **CM-26**: As a player, I want the game to end, and the result to show, as soon as the last square is owned, whoever drew the last line (END-1).

### Result, Rematch and New game

27. **CM-27**: As a player, I want the result panel to say "You won!", "Computer won" or "Draw" with both scores, so that the outcome speaks to me.
28. **CM-28**: As a player, I want Rematch to keep the game mode, the difficulty, my name and color, the computer and the size, with a new random first player, so that I can replay instantly. If the computer starts the rematch, it moves on its own.
29. **CM-29**: As a player, I want New game to take me to setup with my last game mode and difficulty already selected, so that I can change them or start again quickly.

### Saving and reloading

30. **CM-30**: As a player, I want the game mode and difficulty saved with the game, so that a reload continues the same kind of game (PS-1, PS-2).
31. **CM-31**: As a player, I want a reload during the computer's turn to restore the game and then let the computer think and move, so that a reload never gets the game stuck.
32. **CM-32**: As a player, I want a reload during my turn to restore it as my turn, with the computer's last line still highlighted, so that nothing changes under me.
33. **CM-33**: As a returning player, I want a game saved before this feature existed to load as a Two players game, so that an old game in progress isn't lost.

### Two players, rules, languages and phones

34. **CM-34**: As two people sharing a device, we want Two players mode to work exactly as before, so that the new mode costs us nothing.
35. **CM-35**: As a player, I want the "How to play" rules worded neutrally ("players take turns" rather than "two players"), so that they read correctly in both game modes (RL-5).
36. **CM-36**: As a player, I want all new text (mode and difficulty labels, the computer's name, "Thinking…", "Your turn", the result wording, the name-clash message) in Ukrainian and English, so that the whole UI follows my language (I18N-1).
37. **CM-37**: As a screen-reader user, I want "Thinking…" and the computer's move announced politely, and the robot icon to be decorative next to the computer's written name, so that I can follow the computer's turn without seeing it.
38. **CM-38**: As a phone user, I want the game mode and difficulty switches and the thinking indicator to fit from 320 px wide with tap targets of at least 44 px, so that computer mode works on my phone (MB-1, MB-8).

### Developers

39. **CM-39**: As a developer, I want the computer's choice of line to be a pure function of the game, the difficulty and a random source, so that the strategy is unit-testable with fixed positions and deterministic tie-breaks.
40. **CM-40**: As a developer, I want type-check, lint and tests to run on every pull request and before every deploy, so that a broken computer player never reaches the live site.

## Implementation Decisions

- **Game model**
  - The game gains a **game mode** (Two players or Versus computer) and a **difficulty** (Easy or Normal; empty in Two players).
  - The JSON-rehydrating constructor defaults a missing game mode to Two players, so old saves keep working (CM-33).
  - The model exposes whether the current player is the computer player, and a query listing every **legal move** as distinct lines. That query is built on the existing valid-start and free-neighbor checks (ADR-0003), so the rules exist in one place.
  - Drawing a line works the same for both players; the computer gets no special path through the rules.
- **Computer player identity** (ADR-0001)
  - The computer player is always the second player, stored under a fixed internal name that is never displayed.
  - Ownership of lines and owned squares, scores and the current player keep working by name.
  - Wherever a player's name is shown, a single display helper turns the internal name into the translated "Комп'ютер" / "Computer" plus the robot icon. Everything else shows the person's name as typed.
- **Computer strategy module**
  - A new pure module answers "which line does the computer draw now?" for a given game, difficulty and random source. The random source defaults to the real one; tests pass a fixed one.
  - Easy picks uniformly from legal moves.
  - Normal applies, in order:
    1. take a line that claims the most squares (two before one);
    2. else a random **safe line**;
    3. else the line minimizing the number of squares the person could claim on their next turn.
  - Ties are broken by the random source.
  - The module never mutates the game.
- **Computer turn**
  - The game screen watches for "playing, and it's the computer player's turn". When that holds, it waits about 1000 ms and then draws the strategy's line through the normal draw operation.
  - The pending move is cancelled on Stop, on Rematch, on New game and when the screen unmounts. A finished game never schedules a move.
  - The same watch covers a freshly restored game, which is how a reload during the computer's turn resumes (CM-31).
  - While the move is pending the board is locked: no valid-start highlights, and clicks are ignored.
- **Last computer line highlight**
  - Derived from saved state rather than stored separately: the newest line, if the computer player drew it and the game is still playing.
  - It disappears as soon as the person draws, and survives a reload (CM-32).
- **Setup**
  - The setup form's result gains the game mode and difficulty.
  - In Versus computer mode the second player isn't entered; the computer player is attached with its internal name and an automatic color. The color is picked from a fixed palette as the color farthest from the person's color.
  - Name validation adds a rule rejecting the computer's display name in any supported language, case-insensitively, with its own translated message.
  - Values already typed are kept when the mode is switched.
- **Preferences**
  - The last game mode and difficulty are saved in localStorage through the existing storage service, alongside the language preference.
  - They're read when setup opens. On a first visit: Versus computer and Normal.
- **Status, result and rules wording**
  - Computer mode adds four pieces of text: "Your turn" on the person's turn, "Thinking…" with the robot icon on the computer's turn (in a polite live region), result titles "You won!" / "Computer won" (Draw unchanged), and neutral rules wording.
  - Every new message key is added to both locales (the Ukrainian locale is typed against the English one).
- **Icon**
  - Material Symbols `smart_toy` is embedded as an inline-SVG icon component. It uses the current text color, is `aria-hidden` and has no network dependency. Future icons follow the same pattern.
- **Docs**
  - When the feature ships, its rules move into the gameplay `requirements.md` as a new numbered section, with the matching `design.md` changes. The design canvas (local files and the remote canvas) is updated, then reviewed **before** implementation starts.

## Testing Decisions

- **What makes a good test**
  - Tests check external behavior only: what a player sees and can do, or what the model's public interface returns.
  - They never assert private state, internal method calls or component internals, so refactors don't break them.
- **Tooling**: Vitest with Vue Test Utils on jsdom, run by `npm test` and in CI on pull requests and before deploys.
- **Seam 1: the game model and the strategy**
  - Plain unit tests over constructed board positions. Examples:
    - Normal claims a square when one has three sides, preferring the double.
    - Normal never draws an unsafe line while a safe one exists.
    - With only unsafe lines left, Normal picks the one giving away the fewest squares.
    - Easy only ever returns legal moves.
    - The legal-move list obeys ADR-0003.
    - Old saves rehydrate as Two players.
  - A fixed random source makes tie-breaks deterministic.
- **Seam 2: the whole game page**
  - The route's page is mounted with real i18n and real localStorage, using fake timers for the computer's pause and a stubbed `Math.random` for the first player.
  - Tests drive it like a player: choose the mode and difficulty, start, click dots, advance time.
  - They check "Thinking…", the locked board, the computer's highlighted line, "Your turn", the result wording, Rematch and New game.
  - A reload is simulated by remounting from what was saved, including mid-computer-turn.
- **No other seams** for new behavior: the computer-turn timer, the display helper and individual new components are covered through seam 2.
- **Prior art**: the repo has no tests yet. Earlier tickets add the harness and tests for the existing models, the storage service and the existing components, which become the prior art and the safety net for this feature.

## Out of Scope

- A Hard difficulty or any look-ahead search.
- Online or networked play, and computer-vs-computer games.
- Undo or move history.
- Any change to the game rules in either mode.
- Choosing or editing the computer's name or color.
- Animating the line being drawn (beyond the pause and the highlight), and sound.
- The 15-character name limit and showing names uncut (GS-1, GB-5): a separate change with its own ticket.

## Further Notes

- **Design gate**: the design canvas gets new and updated artboards (desktop and mobile, UA and EN): setup with the mode switch in both modes, the difficulty switch, the computer thinking, the computer's highlighted line, and the "You won!" / "Computer won" results. It must be reviewed by the product owner before implementation tickets start; test-harness tickets can run in parallel.
- **Assumed during spec writing, not discussed explicitly**: CM-10 (typed values survive a mode switch), CM-37 (polite live region, decorative icon), the palette-based automatic color for the computer player, and that the computer player is always the second player internally. Confirm these at design review.
- The ~1 s pause is a fixed delay, not a measure of real computing time. Even Normal's strategy is instant on a 10×10 board.

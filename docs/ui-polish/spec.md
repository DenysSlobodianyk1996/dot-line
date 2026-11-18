# UI polish and rename to Dots and Boxes: Connected: spec

Terms follow [GLOSSARY.md](../../GLOSSARY.md). User stories carry IDs **UP-n** for commits. Shipped rules this touches: GS-1..GS-5, END-4..END-6, MB-6, MB-8, MB-9, RL-1, VC-18, VC-19, PWA-1..PWA-6, APP-1 and I18N in [requirements](../dot-line-game/requirements.md).

**Status**: agreed in a grilling session on 2026-11-18, not started. Issue: see the parent issue "UI polish and rename to Dots and Boxes: Connected". The Android release ([spec](../android-release/spec.md)) waits for this one, because its store screenshots show the new result card and the new name.

## Problem Statement

Small things make the setup and game screens feel unfinished:

- Setup has no way to read the rules next to its title. The only way is the info button in the header, which children don't connect with the form.
- The setup fields sit close together (8 px), so the form looks cramped.
- On the game screen, the Stop button moves up and down while you play. The lines above it ("Thinking…", the computer's last move, the move hint) appear, disappear and change length.
- The result buttons (New game settings, Rematch) wrap raggedly inside the 212 px side panel on wider screens.
- The buttons are text only and harder to recognise for children who can't read yet.
- When the game ends, nothing celebrates it. The result panel looks like the status panel with a bigger heading, and the board doesn't change.

The app is also called "Dots & Lines" / «Точки й лінії», a made-up name. The game is the classic **Dots and Boxes** (Édouard Lucas, 1889), and people search for that name. This app plays it with one house rule: every line after the first must start from an existing line. We want the product to carry the established name plus that distinguishing rule.

## Solution

- **Setup** gets an info button next to its title. It opens the same rules panel as the header button. The fields get 16 px gaps.
- **Side panel buttons go to the top.** Stop sits at the top of the status panel. When the game ends, New game settings and Rematch take its place in the result panel, so the actions never move. The status text below keeps a stable height.
- **Result buttons don't wrap.** On phones they sit side by side in two columns. On wider screens they stack full width, with Rematch on top.
- **Buttons get icons**: a hand for Stop, a gear for New game settings, and a refresh arrow for Rematch.
- **A hero result card** marks the end of the game. It is an accent-tinted card with a trophy, the winner, a large score (`5 : 3`) and the reason.
- **Rename**: the app becomes **Dots and Boxes: Connected** / **«Крапки й квадрати: ланцюжок»** everywhere. That covers the header, tab title, install manifests, docs, code names, the package name, the GitHub repo (`dots-and-boxes-connected`) and the Pages URL (`/dots-and-boxes-connected/`).

## User Stories

### Setup

1. **UP-1**: As a player on setup, I want an info button next to the "Game Setup" title, so that I can read the rules right where I'm choosing the game.
2. **UP-2**: As a player using the keyboard, I want focus to return to the info button I opened the rules panel with, so that I don't lose my place in the form.
3. **UP-3**: As a player, I want more space (16 px) between the setup fields, so that the form is easier to read and tap.

### Game side panel

4. **UP-4**: As a player, I want Stop at the top of the side panel, so that it doesn't move while the turn text and hints change.
5. **UP-5**: As a player, I want the turn, score and hint area to keep its height while the computer thinks and while I select dots, so that nothing below it jumps.
6. **UP-6**: As a player, I want New game settings and Rematch to appear exactly where Stop was when the game ends, so that I find them without searching.
7. **UP-7**: As a player on a phone, I want the two result buttons side by side in two equal columns, so that both are reachable with a thumb.
8. **UP-8**: As a player on a wider screen, I want the result buttons stacked full width (Rematch on top), so that they never wrap raggedly in the narrow panel.
9. **UP-9**: As a child who can't read yet, I want icons on Stop (hand), New game settings (gear) and Rematch (refresh), so that I can recognise each button.

### End of game

10. **UP-10**: As a player, I want the result to appear as a hero card (accent-tinted, with a trophy, the winner's swatch and name, and a large score), so that the end of the game feels like an event.
11. **UP-11**: As a player, I want a draw to show a hero card without a trophy, with both swatches and equal scores, so that a draw reads as "nobody won" and not as an error.
12. **UP-12**: As a player against the computer, I want the hero card to say "You won!" or "Computer won" with the robot icon, so that it's clear who won.
13. **UP-13**: As a player who prefers less motion, I want the card's entrance animation off when my device asks for reduced motion, so that nothing moves unnecessarily.
14. **UP-14**: As a player, I want the hero card readable in both themes, so that the celebration works at night too.

### Name

15. **UP-15**: As a player, I want the app called "Dots and Boxes: Connected" (en) and «Крапки й квадрати: ланцюжок» (uk) in the header, tab title and installed app, so that I recognise the game I know.
16. **UP-16**: As a returning player, I want my saved game, language, theme, mode and difficulty kept after the rename and the URL change, so that nothing resets.
17. **UP-17**: As a contributor, I want code, docs, the package name, the repo and the Pages URL to use the new name, so that one name is used everywhere.

## Implementation Decisions

### Info button on setup (UP-1, UP-2)

- The setup title row becomes `flex items-center justify-center gap-2`: the `<h3>` plus a `BaseIconButton` with `InfoIcon`, the same `aria-label` (`rules.open`), `aria-haspopup="dialog"` and `aria-expanded` as the header button.
- `useRulesPanel().open()` remembers the opener (`document.activeElement` at open time). `RulesPanel` returns focus to the remembered opener, falling back to the header button. The `returnFocusTo` prop either becomes the fallback or goes away.
- No new strings.

### Setup spacing (UP-3)

- In `GameSetup.vue`, the `<Form>` (`:9`) and the players row (`:23`) change from `gap-2` to `gap-4`. Inside the size field, label, input, hint and error keep `gap-2`.

### Side panel (UP-4..UP-9)

- **GameStatus**: the order becomes Stop, then turn and score, then the hint. The Stop row stays full width on phones (`min-h-11`, MB-8) and auto width on `sm+`.
- **Stable height**: the announcement `<p>` always takes one line (`min-h-[1lh]`, or a non-breaking space when empty). The hint is always rendered and is hidden with `invisible` while the computer thinks, not removed with `v-if`. The hint area reserves the height of its longest text in the current language (two lines at the panel width). Long player names may still wrap; that's accepted.
- **GameResult**: the button row moves to the top. Classes: `grid grid-cols-2 gap-2 sm:flex sm:flex-col`. On phones the order is New game settings then Rematch (left to right). On `sm+` Rematch comes first (`sm:order-first`), so it sits on top. Both are `w-full`, `min-h-11 sm:min-h-0`.
- **Icons**: new `StopHandIcon` (Material Symbols Rounded `back_hand`), `SettingsIcon` (`settings`) and `RefreshIcon` (`refresh`) in `src/shared/icons/`, same shape as `InfoIcon` (`size` prop, `fill="currentColor"`, `aria-hidden`). The button labels stay, and the icon sits before the label (`inline-flex items-center gap-2`). Add them to the icons README.
- The Stop confirm dialog's buttons are unchanged.

### Hero result card (UP-10..UP-14)

- **Design first**: update the design canvas artboards (`ResultWinner`, `ResultDraw`, `MobileResult`, `DarkResultWinner`, `DarkMobileResult`, `ComputerResult*`, `MobileComputerResult*`) and get them reviewed before the code.
- **Card**: `rounded-2xl` with an accent tint (a new `--wc-accent-soft` token, light and dark, exposed to Tailwind as `bg-accent-soft`), padding 16 px. The card sits below the button row.
- **Content**, top to bottom:
  - a trophy icon (Material Symbols Rounded `emoji_events`, new `TrophyIcon`) or the robot icon when the computer won; no trophy on a draw;
  - the heading ("You won!", "Computer won", "<name> wins!", or "Draw") as it is today;
  - the score as `5 : 3` in `text-4xl font-bold`, each number in its player's color with a swatch, the winner on the left;
  - the reason (completed or stopped) in muted text.
- The existing Score list (`PlayerScore` rows) stays below the card for player names and colors.
- **Motion**: one entrance (fade plus scale from 0.95, ≤300 ms) under `motion-safe:` only. No confetti.
- **Contrast**: player colors may be any hex in saved games, so the score numbers get a text outline or sit on swatch chips. Choose one in the design pass and check it in both themes (VR-17).
- No change to the board in this issue.

### Rename (UP-15..UP-17)

- **Names**:
  - `app.title`: en "Dots and Boxes: Connected", uk «Крапки й квадрати: ланцюжок». This drives the header, `document.title` and both manifest `name`s.
  - Manifest `short_name`: "Dots & Boxes" / «Крапки й квадрати», because launchers truncate long names.
- **Code**:
  - `DotLineGame` → `DotsAndBoxesGame`; `dot-line-game.model.ts` → `dots-and-boxes-game.model.ts`.
  - `src/pages/dot-line-game/` → `src/pages/dots-and-boxes-connected/`.
  - Tests and helpers follow.
  - `package.json` `name` → `dots-and-boxes-connected`.
  - The route stays `/game`.
- **Docs**: `docs/dot-line-game/` → `docs/dots-and-boxes-connected/`, with links updated in every doc. The glossary title, `CLAUDE.md`, `README.md` and `docs/README.md` change, and so do the visible app name and logo alt text in the design canvas artboards.
- **Storage**: the keys (`CURRENT_GAME`, `LOCALE`, `GAME_MODE`, `DIFFICULTY`, `THEME`) have no app prefix, and localStorage is per origin (`<user>.github.io`), not per path. So saved data survives the URL change and needs no migration. A test asserts the key names stay as they are.
- **Repo and URL**:
  - `gh repo rename dots-and-boxes-connected`, then update the local remote.
  - `deploy.yml` builds with `BASE_PATH=/dots-and-boxes-connected/`.
  - GitHub redirects the old repo URLs; Pages doesn't redirect `/dot-line/`. No redirect page, because nobody uses the old URL (decided).
  - Update absolute links in docs (`github.com/.../dot-line` → `.../dots-and-boxes-connected`).
- **Glossary**: inside the game the term stays **Square** ("box" remains an _Avoid_ word). "Dots and Boxes: Connected" is only the **App name**.

## Testing Decisions

- Tests check external behaviour through the page driver (`src/test/game-page.ts`). Extend the driver; don't query the DOM in specs.
- **Info button**: clicking the setup info button opens the rules panel. Closing it returns focus to that button, and the header button still gets focus back when it was the opener.
- **Side panel**: Stop comes before the turn and score in DOM order. The hint element stays in the DOM while the computer thinks. When the game ends, the result buttons render in the same slot.
- **Result card**: it shows the trophy for a win, no trophy for a draw, the robot icon when the computer wins, and the score text `5 : 3` with the winner first.
- **Rename**: the header and `document.title` show the new names in both languages. The manifest file names are unchanged. A saved game under `CURRENT_GAME` still restores.
- Layout (no wrapping, stable height, both themes, 390 px and desktop) is checked in the browser, not in unit tests. Verify the Pages build with `BASE_PATH=/dots-and-boxes-connected/ npm run build`.

## Out of Scope

- Board changes at the end of the game (dimming, winner glow). Considered as a prototype variant and not chosen.
- Confetti or sounds.
- A redirect from the old `/dot-line/` URL.
- Renaming the `/game` route or the storage keys.
- Anything Android (see the [Android release spec](../android-release/spec.md)).

## Further Notes

- Do the rename last within this parent, after the UI sub-issues. It moves every file those sub-issues touch, so renaming first would cause conflicts on parallel branches.
- Ship the whole parent as one PR from `feat/ui-polish-and-rename`, which already holds this spec. As with #35, merge `master` in before opening the PR.
- After shipping, fold UP-n into `requirements.md` (GS, MB, END, APP, PWA) and mark this spec as shipped in `docs/README.md`.

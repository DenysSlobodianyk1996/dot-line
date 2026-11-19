# Short name, game goal and a lighter header: spec

Terms follow [GLOSSARY.md](../../GLOSSARY.md). User stories carry IDs **NG-n** for commits. Shipped rules this touches: HD-1, HD-2, HD-5, APP-1, PWA-6, RL-1..RL-4, I18N-3, I18N-5, END-5, END-9, MB-6, UP-1, UP-2, UP-15, UP-17 and AR-* app id mentions in [requirements](../dots-and-boxes/requirements.md).

**Status**: agreed in a grilling session on 2026-11-19, shipped (#68–#71); NG-n folded into [requirements](../dots-and-boxes/requirements.md). Issue #67. Branch `feat/short-name-and-goal`.

## Problem Statement

On a phone (390 px) the header doesn't fit:

- The name «Крапки й квадрати: ланцюжок» wraps onto three lines and squeezes the header buttons, so the round theme and info buttons turn into ovals.
- The UA | EN toggle takes two buttons' worth of width.

The app opens straight on the setup screen, and players have told us it isn't clear what the game is about. The goal (own more squares) is only in the rules panel, which nobody opens before playing.

The setup screen also repeats the header's info button next to its title, and its title «Налаштування гри» and the result panel's «Налаштування гри» / "New game settings" are longer than they need to be.

## Solution

- **Name**: drop "Connected" / «ланцюжок» everywhere. The app is **Dots and Boxes** / **«Крапки й квадрати»**: header, tab title, install manifests, Android launcher name, Play listing texts, the Android app id, the package name, code and docs folders, the GitHub repo and the Pages URL.
- **Header**: header buttons never shrink, so they stay round. The language toggle becomes one round button that shows the current language and switches to the other one on a tap.
- **Game goal**: one sentence, "Dots and Boxes — whoever owns more squares when the board is full wins." / «Крапки й квадрати — перемагає той, у кого більше квадратів, коли поле заповниться.» It opens the setup screen (with a "How to play →" link to the rules panel) and the rules panel.
- **Settings**: the setup screen's title becomes **Settings** / **«Налаштування»**, bigger, below the goal. Its info button goes. The result panel's "New game settings" button becomes **Settings** / **«Налаштування»**.

## User Stories

### Header

1. **NG-1**: As a player on a phone, I want the header to show the short name «Крапки й квадрати» / "Dots and Boxes", so that it fits on one or two lines and leaves room for the buttons.
2. **NG-2**: As a player on a phone, I want the theme, info and language buttons to stay round 44 px circles, whatever the name's length, so that the header looks finished.
3. **NG-3**: As a player, I want one round language button that shows the current language ("UA" / "EN") and switches to the other on a tap, so that the header needs less space.
4. **NG-4**: As a player using a screen reader, I want the language button announced as the action it does ("Switch to English" / «Перейти на українську»), with the button's text in its own language, so that I know what a tap does.

### Game goal

5. **NG-5**: As a new player, I want the setup screen to open with one sentence that names the game and says how to win, so that I know what I'm about to play before I choose the settings.
6. **NG-6**: As a new player, I want a "How to play →" / «Як грати →» link right after that sentence, so that I can open the rules from the setup screen.
7. **NG-7**: As a player reading the rules, I want the rules panel to start with the same sentence, so that the goal comes before the steps.

### Settings

8. **NG-8**: As a player, I want the setup screen titled "Settings" / «Налаштування», bigger and below the goal sentence, so that the title is short and the screen reads top-down: what the game is, then how to set it up.
9. **NG-9**: As a player, I want only the header's info button to open the rules (no second one on the setup screen), so that there is one way to the rules and less clutter.
10. **NG-10**: As a player on the result panel, I want the "New game settings" button called "Settings" / «Налаштування», so that it fits next to Rematch.

### Name

11. **NG-11**: As a player, I want the app called "Dots and Boxes" (en) and «Крапки й квадрати» (uk) in the header, browser tab, installed web app and Android launcher, so that the name is short and the same everywhere.
12. **NG-12**: As a returning web player, I want my saved game, language, theme, mode and difficulty kept after the URL change, so that nothing resets.
13. **NG-13**: As a contributor, I want the code, docs, package name, Android app id, repo and Pages URL free of "connected", so that one name is used everywhere.

## Implementation Decisions

### Header (NG-1..NG-4)

- `App.vue` shows `t('app.shortName')`. `app.title` and `app.shortName` become the same text in each language: "Dots and Boxes" and «Крапки й квадрати» (the English short name loses its `&`). Keep both keys: `app.title` feeds the tab title and the manifests' `name`, `app.shortName` their `short_name`.
- `BaseIconButton` gets `shrink-0`, which fixes the ovals (the cause was flex shrinking, not the size).
- `LanguageToggle.vue` becomes a single `BaseIconButton`: text "UA" / "EN" for the current locale (`text-sm font-bold`, `lang` set to the current locale), and a click calls `setLocale()` with the other locale. `aria-label` is a new key `language.switchTo` in the **target** language's own words: "Switch to English" when Ukrainian is on, «Перейти на українську» when English is on, with `lang` on the label's language. No `aria-pressed` and no group. Two locales only; a third language would need a menu, out of scope.
- `language.label`, `language.uk` and `language.en` go if nothing else uses them.

### Game goal (NG-5..NG-7)

- One new key `rules.goal`, with the game's name in a slot so it can be bold: en `{name} — whoever owns more squares when the board is full wins.`, uk `{name} — перемагає той, у кого більше квадратів, коли поле заповниться.` Render it with `<i18n-t keypath="rules.goal">` and a `<strong>` holding `t('app.shortName')`.
- **Setup**: the goal `<p>` comes first (muted `text-ink-soft`, centred), ending with an inline link button "How to play →" / «Як грати →» (new key `rules.howToPlay`, `text-accent underline`, ≥ 44 px tap height below `sm`). The link calls `useRulesPanel().open(...)`.
- **Rules panel**: the same sentence as the first paragraph under the "How to play" heading, above the five steps, at full ink.
- The rules panel never opens by itself; RL-3's "closed whenever the app loads" stays.

### Settings (NG-8..NG-10)

- `setup.title` becomes "Settings" / «Налаштування», rendered at `text-2xl font-extrabold`, with `mt-6` (or similar) separating it from the goal.
- The setup info button and its `data-setup-rules-button` go. The setup's goal link and the header button can both open the panel. Focus returns to whichever opened it. `useRulesPanel` keeps the opener logic for that, but RL-2, RL-4, UP-1 and UP-2 are reworded: there is one info *button*, plus the setup link.
- `game.newGameSettings` text becomes "Settings" / «Налаштування»; the key may be renamed to `game.settings`. The gear icon stays.

### Rename (NG-11..NG-13)

- **Web**: `index.html` title and meta, `vite.config.ts` manifest names via the locale files, `package.json`/`package-lock.json` name `dots-and-boxes`.
- **Pages**: the repo is renamed `dots-and-boxes` by the owner in GitHub settings; `deploy.yml` builds with the repo name, `/dots-and-boxes/` after the rename. No redirect from the old URL: nobody uses the app yet. localStorage is per origin (`*.github.io`), so saved data survives (NG-12).
- **Android**: app id `app.dotsandboxes` (debug `app.dotsandboxes.debug`) in `capacitor.config.ts`, `android/app/build.gradle` (`namespace`, `applicationId`), `strings.xml` (`package_name`, `custom_url_scheme`) and the `MainActivity` package, moved from `java/app/dotsandboxes/connected/` to `java/app/dotsandboxes/`. `app_name` and `title_activity_main` become "Dots and Boxes"; a new `values-uk/strings.xml` sets «Крапки й квадрати». `capacitor.config.ts` `appName` "Dots and Boxes".
- **Play**: `docs/store/*.md` titles and texts drop "Connected" / «ланцюжок», and the checklist notes the new app id. No Play Console work in this spec.
- **Code and docs**: `src/pages/dots-and-boxes-connected/` → `src/pages/dots-and-boxes/`, `docs/dots-and-boxes-connected/` → `docs/dots-and-boxes/`, plus every link to them, `GLOSSARY.md`'s title, `CLAUDE.md`, `README.md`, `docs/README.md`. Older shipped specs keep their history but their links are fixed. Do this as one rename-only commit, separate from behaviour changes.

## Testing Decisions

- Tests check external behaviour through the page driver (`src/test/game-page.ts`); extend it rather than querying the DOM in specs.
- **Header**: the header shows "Dots and Boxes" / «Крапки й квадрати»; `document.title` matches. The language button shows the current language, one click switches all text and `<html lang>`, its accessible name is the switch action, and the choice survives a reload.
- **Goal**: the setup screen shows the goal sentence in both languages; its "How to play" link opens the rules panel, and closing returns focus to the link. The rules panel shows the same sentence before the steps. There is no setup info button.
- **Settings**: the setup heading reads "Settings" / «Налаштування»; the result panel's button reads the same and still clears the saved game and opens setup (END-5).
- **Rename**: a saved `CURRENT_GAME` still restores. Android-side, `scripts/` tests stay green; the id change is checked with `npm run android:apk` and `cap sync` output, not unit tests.
- Layout (round buttons, no header wrap past two lines at 390 px, both themes) is checked in the browser. Verify the Pages build with `BASE_PATH=/dots-and-boxes/ npm run build` and the capacitor build (no `sw.js`/manifests).
- Regenerate the Play Store images with `npm run store:screenshots` and update the design canvas boards that show the header, setup and rules panel; game-only boards keep the old header, noted in `design.md`.

## Out of Scope

- Opening the rules panel automatically on first launch.
- A welcome or onboarding screen.
- A redirect from `/dots-and-boxes-connected/`.
- Play Console: a new app for the new id, the listing title, uploads.
- More than two languages (the one-button toggle assumes two).
- Renaming the `/game` route or the storage keys.

## Further Notes

- The new app id makes the Android app a different app for Google Play. Fine now (nothing published); after the first upload the id is fixed for good.
- After shipping, fold NG-n into `requirements.md` (HD, APP, PWA, RL, I18N, END, MB) and mark this spec shipped in `docs/README.md`.

# Visual refresh and installable app (PWA): spec

Terms follow [GLOSSARY.md](../../GLOSSARY.md). Related decisions: [ADR-0001](../adr/0001-players-identified-by-name.md) (players identified by name). User stories carry IDs **VR-n** for commits.

**Status**: shipped in [#33](https://github.com/DenysSlobodianyk1996/dots-and-boxes/pull/33) (#23–#30); browser and device QA passed (#31); shipped behavior is in [requirements](../dots-and-boxes/requirements.md) (GS-4, GS-5, PS-5, PS-6, RL-2..RL-6, TH, HD, APP-1, PWA, VC-6). Issue: [#22](https://github.com/DenysSlobodianyk1996/dots-and-boxes-connected/issues/22). Prototype: the throwaway branch `prototype/visual-refresh` (game layouts A/B/C, logo combos) was deleted once the refresh was built; its verdict was layout A (side panel), logo combo 1, Warm cream light/dark, rules panel and swatch picker, all of which now live in the code, the requirements and the design canvas. This spec changed shipped requirements RL-2..RL-4, GS-1 (color part), CM-9 (VC-6) and I18N-3; `docs/dots-and-boxes-connected/requirements.md` now describes the result.

## Problem Statement

The game is meant for children and is heading towards being a mobile game, but today it looks and behaves like a plain web form. It uses default grays and a strong blue, has no app icon of its own (only a generic favicon), and can't be installed on a phone's home screen or played without a connection. The rules sit in a Show/Hide block that pushes the board and the setup form around. Players pick their color from a free color picker, which gives children too many options and lets them choose harsh or near-identical colors. There is no dark theme, so playing in the evening is glaring.

## Solution

The game gets a soft, friendly look called **Warm cream**: a cream "paper" background, cocoa-brown text, coral and teal accents, rounded shapes and the rounded Nunito font. It comes in a light and a dark version (warm cocoa at night). The theme follows the device by default, and a sun/moon button in the header switches it.

A new **logo** tells the game in one picture: four dots in a square, two lines already drawn (coral on top, teal on the left), and a dashed sunflower-yellow line on the right that is "waiting" to close the square. The logo appears in the header, as the favicon (transparent background) and as the install icon (on a cream tile).

The **rules** move behind an info button in the header. It opens a **rules panel** that slides in from the right, or covers the whole screen on phones, and closes with ✕, a tap outside it or Esc. The setup and game screens no longer show rules inline.

Players pick their color from **8 soft swatches** instead of a color picker. The computer player picks from the same swatches.

The game becomes an **installable app (PWA)**: it can be added to the home screen, opens full screen with its own icon and name, works fully offline after the first visit, and updates itself quietly. The installed app's name follows the chosen language ("Точки й лінії" by default, "Dots & Lines" in English).

The game screen keeps today's structure: the board with the side panel next to it, stacked on phones (prototype variant A).

## User Stories

### Look and feel

1. **VR-1**: As a child, I want soft, warm colors instead of bright blue and gray, so that the game feels friendly and calm.
2. **VR-2**: As a child, I want rounded, easy-to-read letters, so that the text feels playful and is easy to read.
3. **VR-3**: As a player, I want buttons, fields, panels and the board to have rounded corners and gentle shadows, so that the whole game looks like one consistent toy.
4. **VR-4**: As a player, I want the primary buttons (Start, Rematch, Stop game) in coral, so that the main action is always easy to spot.
5. **VR-5**: As a player, I want the board on a lighter "paper" surface, with clearly visible idle dots, so that I can see where I can play.
6. **VR-6**: As a player, I want the start-dot, selected-dot and target-dot highlights to use the accent colors, so that the move hints fit the new look and stay clearly visible.
7. **VR-7**: As a player, I want owned squares and lines to stay in each player's color, so that I can still tell at a glance who owns what.
8. **VR-8**: As a player, I want the Stop dialog, the result panel and validation messages restyled in the same palette, so that no screen looks out of place.
9. **VR-9**: As a player on a phone, I want every restyled screen to keep the mobile rules (MB-1..MB-8: no horizontal scroll, 44 px tap targets, stacked layout), so that the refresh doesn't make the game harder to play on small screens.
10. **VR-10**: As a player, I want the game screen to keep its current layout (board with the side panel; stacked below 640 px), so that the refresh changes how it looks, not how it works.

### Light and dark theme

11. **VR-11**: As a player, I want the game to follow my device's light or dark setting by default, so that it matches the rest of my phone.
12. **VR-12**: As a player, I want a dark Warm cream theme (warm cocoa background, light cream text), so that playing in the evening isn't glaring.
13. **VR-13**: As a player, I want a sun/moon button in the header that switches between light and dark, so that I can choose regardless of my device setting.
14. **VR-14**: As a returning player, I want my theme choice remembered after a reload, so that I don't have to switch it again.
15. **VR-15**: As a player, I want the game to keep following the device setting until I press the theme button, so that the default stays automatic.
16. **VR-16**: As a player using assistive technology, I want the theme button to say what it will switch to ("Dark theme" / "Light theme") in my language, so that I know what it does.
17. **VR-17**: As a player, I want every color pair (text on background, dots on the board, player colors on the board) to stay readable in both themes, so that nothing disappears in the dark.

### Header and logo

18. **VR-18**: As a player, I want a header on every screen with the logo and the game's name on the left and the theme, rules and language buttons on the right, so that the app has a recognizable home and the controls are always in the same place.
19. **VR-19**: As a player, I want the logo's dashed "waiting" line to move gently in the header, so that the logo feels alive and hints at the next move.
20. **VR-20**: As a player who prefers less motion, I want the logo animation off when my device asks for reduced motion, so that nothing moves unnecessarily.
21. **VR-21**: As a player, I want the header buttons to be at least 44 px on phones, so that small fingers can hit them.
22. **VR-22**: As a player, I want the game's name in the header and the browser tab to follow the chosen language, so that it is consistent with the rest of the UI.

### Rules panel

23. **VR-23**: As a player, I want an info button in the header on every screen, so that I can read the rules at any moment, including mid-game.
24. **VR-24**: As a player, I want the rules to open in a panel that slides in from the right on wide screens, so that the board and the form stay where they are.
25. **VR-25**: As a player on a phone, I want the rules panel to cover the whole screen, so that the rules are easy to read.
26. **VR-26**: As a player, I want to close the rules panel with a ✕ button, by tapping outside it, or with Esc, so that getting back to the game is effortless.
27. **VR-27**: As a player, I want the rules panel closed by default on both the setup and the game screen, so that the screens stay uncluttered.
28. **VR-28**: As a player, I want the setup and game screens to no longer show the rules inline (no Show/Hide rules button), so that the rules live in one place.
29. **VR-29**: As a player using a keyboard or screen reader, I want the rules panel to behave as a dialog: focus moves into it when it opens, stays inside while it is open, returns to the info button when it closes, and the info button reports whether the panel is open, so that I never get lost.
30. **VR-30**: As a player, I want the rules text itself unchanged (five points, neutral wording, RL-1 and RL-5), so that the rules stay correct in both game modes.
31. **VR-31**: As a player, I want the computer to wait while the rules panel is open during its turn, so that it doesn't move while I'm reading (as with the Stop dialog, VC-13).

### Player colors

32. **VR-32**: As a child, I want to pick my color from 8 round, soft swatches (coral, teal, sunflower, sky, lavender, leaf, berry, tangerine), so that choosing is quick and every option looks nice.
33. **VR-33**: As a player, I want the selected swatch clearly marked (ring and slightly larger), so that I can see which color I picked.
34. **VR-34**: As a player using assistive technology, I want the swatches to be a labelled radio group with each color's name in my language, so that I can pick a color without seeing it.
35. **VR-35**: As a player, I want setup to start with two different random swatches for Player 1 and Player 2, so that the default colors are never the same.
36. **VR-36**: As a player in Two players mode, I want to be prevented from picking the same swatch as the other player, so that our lines and squares are never the same color.
37. **VR-37**: As a player in Versus computer mode, I want the computer to take the swatch that looks most different from mine, so that our colors are always easy to tell apart (replaces the separate computer palette in CM-9).
38. **VR-38**: As a player, I want each swatch to read well as a line and as a light square fill on both the light and the dark board, so that colors work in either theme.
39. **VR-39**: As a returning player with a game saved before the refresh, I want my game to load with its old colors, so that an unfinished game isn't lost or broken.

### App icon

40. **VR-40**: As a player, I want a favicon showing the game's logo, so that I can find the game among my browser tabs.
41. **VR-41**: As a player with a dark browser tab bar, I want the favicon to stay visible, so that the logo doesn't disappear on dark backgrounds.
42. **VR-42**: As a player who installs the game, I want a home-screen icon showing the logo on a soft cream tile, so that it looks good next to other apps on Android and iOS.
43. **VR-43**: As an Android player, I want a maskable icon whose logo stays inside the safe zone, so that the launcher's circle or squircle mask never cuts the dots off.

### Installable and offline

44. **VR-44**: As a player on a phone, I want to add the game to my home screen, so that I can open it like any other app.
45. **VR-45**: As a player, I want the installed game to open full screen, without browser bars, in portrait or landscape, so that it feels like a real game.
46. **VR-46**: As a player, I want the installed game's splash and status bar to use the cream background (cocoa in dark), so that starting the app doesn't flash white.
47. **VR-47**: As a player, I want the game to work fully offline after my first visit (setup, playing, the computer player, the rules, both languages, the font and icons), so that I can play on a plane or in the car.
48. **VR-48**: As a player, I want new versions to install quietly and take effect the next time I open the game, so that I'm never interrupted mid-game by an update prompt.
49. **VR-49**: As a player, I want an update never to lose my current game, so that I can continue where I left off.
50. **VR-50**: As a Ukrainian-speaking player, I want the installed app to be named "Точки й лінії", so that it reads naturally on my home screen.
51. **VR-51**: As an English-speaking player, I want the installed app to be named "Dots & Lines" when I've chosen English before installing, so that the name matches my language.
52. **VR-52**: As a player, I want the app installable and working from the published GitHub Pages address (under `/dot-line/`), so that installing works from the real site, not only locally.

## Implementation Decisions

- **Design tokens.** The Warm cream palette is defined once as semantic CSS custom properties (background, surface, border, muted and main text, accent, accent hover, secondary accent) with a light set on the root and a dark set selected by a `data-theme="dark"` attribute on the root element, exposed to Tailwind v4 through `@theme`. Components use the semantic tokens; the prototype's trick of remapping Tailwind's `gray`/`blue`/`white` scales is **not** carried over. Reference values from the prototype:

  | token | light | dark |
  | --- | --- | --- |
  | background | `#fbf5ec` | `#241c17` |
  | surface | `#fffdf8` | `#30261f` |
  | border | `#e2d3bd` | `#574638` |
  | idle dot | `#bfa98f` | `#8c7663` |
  | muted text | `#8f7963` | `#b7a28d` |
  | text | `#4a3a2e` | `#f6ebdc` |
  | accent (coral) | `#e8735a` | `#f08c73` |
  | secondary accent (teal) | `#2a9d8f` | `#4db6a8` |

- **Font.** Nunito (variable, Latin + Cyrillic) is bundled with the app through its npm package, not loaded from a font CDN, so it is part of the offline cache.
- **Icons.** Material Symbols Rounded (Apache-2.0) icons are copied as inline SVG Vue components in a shared icons folder, one component per icon (info, close, light mode, dark mode, and any others the restyle needs). No icon font is loaded.
- **Theme module.** A small shared composable owns the theme: the system preference (`prefers-color-scheme`, kept live), an optional user override, the effective theme, and a toggle. It applies the effective theme to the root `data-theme` attribute and saves the override under a new `THEME` storage key through `StorageService`. With no saved override the system preference wins (VR-11, VR-15).
- **Header.** `App.vue` gets the header: logo and translated game name on the left; theme button, info button and the existing `LanguageToggle` on the right. New i18n keys for the theme button labels and the swatch names are added to both locale files.
- **Rules panel.** A new rules panel component replaces `RulesToggle`. It reuses `GameRules` for the content, renders once at app level, and is opened through a shared composable (open state, open, close) that the info button and the game screen both use. It is a modal dialog: labelled by the rules title, focus moved in on open, trapped while open, restored to the info button on close, closed on ✕, backdrop and Esc. The computer turn treats "rules panel open" like "Stop dialog open" and waits (VR-31): the existing pause hook for the computer turn takes the panel's open state as a second pause reason.
- **Requirements changes.** RL-2..RL-4 are replaced by the rules-panel behavior (VR-23..VR-29); RL-1 and RL-5 stay. GS-1's color part becomes a swatch choice that must differ between the two players (VR-32..VR-36). CM-9's computer palette becomes the swatch set (VR-37). I18N-3's "top right of every screen" becomes "in the header of every screen".
- **Swatches.** One shared list of 8 swatches (key + hex), the same hex in both themes:

  ```ts
  // from the prototype; keys double as i18n keys (colors.<key>)
  coral #e8735a · teal #2a9d8f · sunflower #e2a93b · sky #4f93d1
  lavender #9479cf · leaf #6aa45a · berry #d0638c · tangerine #ee8a3c
  ```

  The player color field becomes a radio group of swatches bound to the same `player.color` form value (a hex string), so the `GameSetupForm` and `Player` shapes don't change and old saves with any hex still render (VR-39). Setup initialises the two players with two different random swatches; a new validation rule rejects a color equal to the other player's in Two players mode. `computerColorFor()` keeps its "most different color" logic but draws from the swatch list, which replaces the separate computer palette. The old random-hex helper is removed if nothing else uses it.
- **Logo.** One SVG source of truth (viewBox 100×100): 2×2 dots, top line coral, left line teal, a dashed sunflower right line with a soft halo on its start dot (prototype combo 1). Variants derived from it: transparent with cocoa dots (in-app light), transparent with cream dots (in-app dark), the favicon (an SVG favicon that switches dot color with `prefers-color-scheme`, plus an `.ico` fallback), and the install icons on a cream tile with the logo scaled into the 80% maskable safe zone (192, 512, maskable 512, apple-touch 180). The header logo is a Vue component taking the dot color from the theme; its dashed-line animation respects `prefers-reduced-motion`.
- **Icon generation.** The PNG and ICO install icons are generated from the SVG source by a one-off script (dev dependency) and committed under `public/`; they are not generated on every build.
- **PWA.** `vite-plugin-pwa` with `registerType: 'autoUpdate'` and a Workbox precache of every built asset (JS, CSS, fonts, icons, `index.html`, `404.html`), plus navigation fallback to `index.html` so deep links work offline. Manifest: `display: standalone`, `orientation: any`, `start_url` and `scope` derived from Vite's `base` (`/dot-line/` on Pages, `/` locally), `background_color`/`theme_color` cream, icons as above. A `theme-color` meta tag per color scheme covers the dark status bar.
- **Localized manifest.** Two manifests are published: Ukrainian (default, `name` "Точки й лінії") and English (`name` "Dots & Lines"), neither with a `short_name`. `index.html` links the Ukrainian one; `setLocale()` swaps the `<link rel="manifest">` `href` along with `lang` and the title, so the name used at install time matches the chosen language (VR-50, VR-51). The English `app.title` message changes to "Dots & Lines" to match.
- **Game screen.** The game screen keeps today's structure and component split (prototype variant A); only styling changes. Variants B (scoreboard) and C (playmat HUD) are not built.
- **Deployment.** The deploy workflow keeps copying `index.html` to `404.html`; the service worker and manifests are emitted by the build under the same base path. No workflow change is expected beyond what the build already does.

## Testing Decisions

- A good test drives the app the way a player does and checks what the player sees or what is saved; it never reaches into component internals or CSS classes. Visual appearance (colors, shadows, font) is checked by eye, not by tests.
- **One seam**: the whole-page seam already used by every behavior spec, `mountGamePage({ storage })` with the page driver in `src/test/game-page.ts`. The driver is the only place that knows the DOM, so it is extended rather than queried from specs:
  - `openRules()` / `closeRules(how: 'button' | 'backdrop' | 'escape')` / `isRulesOpen()`, replacing the old rules-toggle helpers;
  - `pickSwatch(player, colorKey)` and `selectedSwatch(player)`, replacing the color-input helper that `startGame` / `startComputerGame` use today;
  - `toggleTheme()` and `theme()` (reads the root `data-theme`), with `matchMedia` stubbed for the system preference;
  - `manifestHref()` (reads the `<link rel="manifest">` `href`).
- Behaviors covered through that seam: rules panel open/close paths, closed by default on both screens, focus in/out, no inline rules on setup or game screen, computer waits while the panel is open; swatch selection, default two different swatches, same-swatch rejection in Two players, computer swatch most different from the person's; theme follows system, toggle overrides and survives reload (calling `mountGamePage` again), language switch swaps the manifest link; an old save with a non-swatch hex color still loads and plays.
- Existing specs that change with this work: `RulesToggle.spec.ts` is replaced by a rules-panel spec; `game-screen.spec.ts`, `computer-game.spec.ts` and `smoke.spec.ts` keep their assertions and only go through the updated driver helpers.
- **PWA and icons** are verified by a build check, not unit tests: after `npm run build` with `BASE_PATH=/dot-line/`, the output contains both manifests, the service worker, and every referenced icon; then a manual QA pass on `npm run preview` (Chrome DevTools Application panel / Lighthouse: installable, maskable icon, service worker precache; reload with the network offline; install on an Android phone and an iPhone).
- Prior art: `src/pages/dots-and-boxes/__tests__/game-screen.spec.ts` and `computer-game.spec.ts` (page-driver specs, reload by remounting, faked timers for the computer turn), `src/pages/dots-and-boxes/rules/__tests__/RulesToggle.spec.ts` (what the rules spec replaces).

## Out of Scope

- Packaging as a native app (Capacitor, TWA) and publishing to app stores; the PWA is the first step towards that, a separate effort.
- The alternative game-screen layouts from the prototype (variant B scoreboard, variant C playmat HUD).
- Other palette moods (cool mint, sunny meadow, crayon notebook) and user-selectable palettes.
- Sound, haptics and new animations beyond the logo's waiting line and the rules panel slide.
- Offline-specific UI (an "you are offline" banner) and an update prompt; updates stay silent.
- Push notifications, background sync, online multiplayer.
- Changes to gameplay rules, the computer player's strategy or the rules text.

## Further Notes

- The prototype showed that a transparent logo with cocoa dots vanishes on dark browser tab bars; hence the scheme-aware SVG favicon (VR-41).
- The prototype's remap of Tailwind's `gray`/`blue`/`white` scales was a shortcut to restyle everything at once; the real build should move components to semantic tokens so a future palette or theme doesn't depend on misleading class names.
- `docs/dots-and-boxes/design.md` and the design canvas should get the new palette, header, rules panel and swatch picker before implementation (docs workflow step 3).
- Material Symbols are Apache-2.0; keep the license note next to the inlined icon components.

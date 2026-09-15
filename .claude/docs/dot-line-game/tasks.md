# Dot-line game: tasks

Ordered implementation checklist for [requirements.md](requirements.md) and [design.md](design.md). Tick each item when it's done, and reference its IDs in the commit.

- [x] **1. Model refactor**: add `Dot` and `Line { from, to, ownerName }`. Simplify `Square` to `{ row, col, ownerName }` and remove `LinePosition`. Add `lines`, `currentPlayerName`, `status` and `finishReason` to `DotLineGame`. Rehydrate nested classes in constructors and use `??` defaults. Export everything from `src/models/index.ts`. _(PS-2)_
- [x] **2. Rules**: add `Line.key`, `hasLine`, `neighbors`, `validNeighbors`, `isValidStartDot`, `canDraw`, `drawLine`, `stop`, `scoreOf`, `winner` and `start` to the models. _(MV-1..3, SQ-1..3, TR-1..2, END-1..3, END-6)_
- [x] **3. Setup → start**: `Page.vue` `gameSetup()` calls `start()` after the setters, so a random first player is picked. Old saves without a current player call `start()` on load. _(GS-3, TR-2, PS-3)_
- [x] **4. Board rendering**: `game/GameBoard.vue` with absolutely positioned 48 px squares, dots and colored lines, and owned squares with translucent fill plus initial. _(GB-1..3)_
- [x] **5. Selection UX**: valid-start highlight, selected Dot1, valid-target highlight, cancel by re-click, switch start, ignore invalid clicks. Selection lives in `Game.vue` (`v-model:selected-dot`). _(MV-4..8)_
- [x] **6. Status bar**: `game/GameStatus.vue` with current player, scores, hint, and Stop with a confirmation dialog. The "Back" button is removed from `Game.vue`. _(GB-4, END-2)_
- [x] **7. Result panel**: `game/GameResult.vue` beside the final board with winner or Draw, scores, New game, Rematch. _(END-4..7)_
- [x] **8. Persistence**: save and restore of in-progress, finished and old-format games through the existing `watchEffect` and `reset(savedGame)`. _(PS-1..3)_
- [ ] **9. QA**
  - Done: the rules were checked against the real models with a script covering GS-2..3, MV-1..3, TR-1..2, SQ-1..3, END-1..3, END-5..7 and PS-2..3. `npm run type-check` and `npm run build-only` pass, and the dev server serves `/game`.
  - `npm run lint` reports only `vue/multi-word-component-names` for `Page.vue` and `Game.vue`. That error already exists on `master`.
  - Remaining: click through the acceptance criteria in a browser at N=2 and N=4.

## Mobile

- [x] **10. Mobile design**: add a "Mobile" page to the design canvas with setup, N=4 and N=10 games, Stop confirmation (320 px) and result at 390 px. _(MB-1..8)_
- [x] **11. Responsive board**: `GameBoard.vue` computes the square size from the viewport width (24–48 px), sizes dot tap areas to `min(cell, 44)`, and scrolls inside its own area as a last resort. _(MB-1, MB-3, MB-4)_
- [x] **12. Stacked game screen**: `Game.vue`, `GameStatus.vue` and `GameResult.vue` stack below 640 px, with 44 px buttons and a Stop dialog that fits 320 px. _(MB-2, MB-5, MB-6, MB-8)_
- [x] **13. Stacked setup**: `GameSetup.vue` puts Player 2 below Player 1 below 640 px. _(MB-7)_
- [ ] **14. Mobile QA**
  - Done: the square-size formula gives 48 px at N=4 on 320 and 390 px, 34 px at N=10 on 390 px, 27 px at N=10 on 320 px, and 48 px at 1024 px, and every board fits. Type-check, build and lint (only the existing `master` errors) pass, the responsive classes are in the built CSS, and the dev server compiles every changed component.
  - Remaining: check the MB acceptance criteria in a browser at 320, 390 and 1024 px wide.
- [x] **15. Review fixes**
  - From 640 px up, the square size accounts for the side panel, so large boards no longer scroll beside it (for example N=10 at 640–754 px). Both panels no longer shrink.
  - The window is measured with `clientWidth`.
  - Dot tap areas are square, and the focus outline isn't clipped at the board edge.
  - The setup name field fills its fieldset.
  - The hint reads "Pick the selected dot again to cancel.".

  _(MB-1, MB-3, MB-4, MB-7)_

## Rules

- [ ] **16. Rules design**: add the rules toggle and card to the setup screens (open) and game screens (closed) on both canvas pages, plus "Game, rules open" artboards for phone and desktop. _(RL-1..4)_
- [ ] **17. Rules component**: `rules/GameRules.vue` with the five rules, and `rules/RulesToggle.vue` with the accessible Show/Hide button and `defaultOpen`. _(RL-1, RL-4, RL-5)_
- [ ] **18. Wire rules into screens**: `GameSetup.vue` (open by default) and `Game.vue` (closed by default), with the toggle at the bottom. _(RL-2, RL-3)_
- [ ] **19. Tab title**: `index.html` title "Dot Line Game". _(APP-1)_
- [ ] **20. Rules QA**: render setup and game in a browser at phone and desktop widths, and check the toggle and the title.

## Languages

- [x] **21. i18n setup**: install `vue-i18n`, add `src/i18n/` with `en.ts`/`uk.ts`, `setLocale()` with localStorage and document `lang`/title, the vee-validate `generateMessage`, and the Vite feature flags. _(I18N-1..4, I18N-6, APP-1)_
- [x] **22. Translate the UI**: move every visible string in setup, game, status, result, board `aria-label`s, rules and the rules toggle to `t()`. _(I18N-1, GS-1)_
- [x] **23. Language toggle**: `LanguageToggle.vue` in an `App.vue` header at the top right. _(I18N-3, I18N-5)_
- [x] **24. Docs**: update the README and CLAUDE.md for languages. _(I18N-1..4)_
- [ ] **25. Languages QA**
  - Done: headless Chrome rendered a GitHub Pages build of setup and a game in progress, in both languages.
    - First visit is Ukrainian with UA pressed; a saved `LOCALE` of `en` gives English.
    - `<html lang>`, the tab title, setup, status, hints, rules and dot `aria-label`s are in the expected language, and player names are unchanged.
    - Screenshots at 390 px (phone) and 1024 px (desktop) match the design canvas.
    - `npm run type-check` passes; lint reports only the existing `Game.vue`/`Page.vue` naming errors.
  - Remaining: press the UA/EN toggle in a real browser, and check that validation messages switch language on the next validation (I18N-3, I18N-6).

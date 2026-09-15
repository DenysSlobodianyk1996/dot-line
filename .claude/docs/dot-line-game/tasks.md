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

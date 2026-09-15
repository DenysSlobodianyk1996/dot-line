# Dot-line game: tasks

Ordered implementation checklist for [requirements.md](requirements.md) and [design.md](design.md). Tick each item when it's done, and reference its IDs in the commit.

- [ ] **1. Model refactor**: add `Dot` and `Line { from, to, ownerName }`. Simplify `Square` to `{ row, col, ownerName }` and remove `LinePosition`. Add `lines`, `currentPlayerName`, `status` and `finishReason` to `DotLineGame`. Rehydrate nested classes in constructors and use `??` defaults. Export everything from `src/models/index.ts`. _(PS-2)_
- [ ] **2. Rules**: add `lineKey`, `hasLine`, `neighbors`, `validNeighbors`, `isValidStartDot`, `canDraw`, `drawLine`, `stop`, `scores`, `winner` and `start` to `DotLineGame`. _(MV-1..3, SQ-1..3, TR-1..2, END-1..3, END-6)_
- [ ] **3. Setup → start**: `Page.vue` `gameSetup()` calls `start()` after the setters, so a random first player is picked. _(GS-3, TR-2)_
- [ ] **4. Board rendering**: `game/GameBoard.vue` SVG with 48 px squares, dots, colored lines, and owned squares with translucent fill plus initial. _(GB-1..3)_
- [ ] **5. Selection UX**: valid-start highlight, selected Dot1, valid-target highlight, cancel by re-click, switch start, ignore invalid clicks. _(MV-4..8)_
- [ ] **6. Status bar**: `game/GameStatus.vue` with current player, scores, and Stop with confirmation. Remove the "Back" button from `Game.vue`. _(GB-4, END-2)_
- [ ] **7. Result panel**: `game/GameResult.vue` overlay with winner or Draw and scores, New game, Rematch. _(END-4..7)_
- [ ] **8. Persistence**: verify save and restore of in-progress and finished games through the existing `watchEffect` and `reset(savedGame)`. _(PS-1..2)_
- [ ] **9. QA**: walk through every acceptance criterion in requirements.md at N=2 and N=4. Run `npm run type-check` and `npm run lint`.

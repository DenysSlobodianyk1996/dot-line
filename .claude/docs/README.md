# Specs

Feature specs for spec-driven development. A spec here is the source of truth for a feature. Code follows the spec, not the other way round.

## Workflow

1. **Requirements** (`requirements.md`) define what the feature does. Each requirement has a stable ID (`MV-2`, `END-3`, …) and acceptance criteria.
2. **Design** (`design.md`) defines how it's built: data model, rule algorithms, components, and a link to the visual draft.
3. **Tasks** (`tasks.md`) list the ordered implementation steps. Each step references the requirement IDs it covers; tick it when done.

Rules:
- If behavior needs to change, update the spec first, then the code.
- Reference requirement IDs in commit messages (for example, `feat(MV-4): highlight valid start dots`).
- Items under "Open / assumed" in requirements are not final. Confirm them with the product owner before relying on them, and move each one into a numbered requirement once confirmed.

## Index

| Feature | Status | Docs |
| --- | --- | --- |
| Dot-line game (gameplay + mobile) | Implemented (browser QA pending) | [requirements](dot-line-game/requirements.md) · [design](dot-line-game/design.md) · [tasks](dot-line-game/tasks.md) |

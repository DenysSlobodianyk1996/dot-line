# Docs

Specs are the source of truth for behavior: code follows the spec, not the other way round. For the project overview, rules and setup, see the [root README](../README.md).

## Layout

```
GLOSSARY.md               domain terms (root of the repo)
docs/
  adr/                    decisions that are surprising or hard to reverse
  agents/                 config for the agent skills (issue tracker, labels, domain docs)
  <feature>/
    requirements.md       numbered rules (MV-2, END-3, …) with acceptance criteria
    design.md             how it's built, plus the visual draft
    design-canvas/        Claude Design source files (*.dc.html, canvas.json)
    spec.md               feature spec for new work (problem, user stories, decisions)
```

## Workflow

1. **Shape the idea**: `/grill-with-docs` interviews the idea and updates `GLOSSARY.md` and `docs/adr/` as terms and decisions settle.
2. **Spec**: `/to-spec` writes `docs/<feature>/spec.md` and publishes the same spec as a GitHub issue. User stories carry stable IDs (for example `CM-3`).
3. **Design**: update the design canvas (local files and the remote canvas) and get it reviewed before implementation starts.
4. **Tickets**: `/to-tickets` splits the spec into GitHub sub-issues with blocking links. Tickets are the task list; there is no `tasks.md`.
5. **Build**: `/implement` per ticket (test-first with `/tdd`, then `/code-review`), and `/pr` for the pull request.

Rules:
- If behavior needs to change, update the spec first, then the code. Shipped behavior is described in the feature's `requirements.md`.
- Reference requirement or story IDs in commit messages (for example, `feat(MV-4): highlight valid start dots`).

## Index

| Feature | Status | Docs |
| --- | --- | --- |
| Dots and Boxes: Connected (gameplay, mobile, rules, languages) | Shipped | [requirements](dots-and-boxes-connected/requirements.md) · [design](dots-and-boxes-connected/design.md) |
| Visual refresh and installable app (PWA) | Shipped (#33, device QA #31 passed) | [spec](visual-refresh/spec.md) · [requirements TH, HD, PWA, RL](dots-and-boxes-connected/requirements.md#th-look-and-theme) · [design](dots-and-boxes-connected/design.md#visual-refresh-vr-152) |
| Versus computer game mode | Shipped (#21, browser QA #19 passed) | [spec](computer-opponent/spec.md) · [requirements VC](dots-and-boxes-connected/requirements.md#vc-versus-computer) · [design](dots-and-boxes-connected/design.md#versus-computer-vc-125) |
| UI polish and rename to Dots and Boxes: Connected | Spec agreed | [spec](ui-polish/spec.md) |
| Android release on Google Play | Spec agreed (blocked by UI polish) | [spec](android-release/spec.md) |
| Short name, game goal and a lighter header | Spec agreed | [spec](short-name-and-goal/spec.md) |

# The turn always passes, even after claiming a square

After every line the turn goes to the other player, including when that line closed one or two squares. This deliberately differs from classic dots-and-boxes, where closing a square earns another move; the product owner chose strict alternation.

## Consequences

- There are no chains of consecutive captures, so the classic "double-cross" strategy doesn't apply. The computer player's strategy is built for these rules, not borrowed from dots-and-boxes solvers.
- Don't "fix" this to match the classic game without a new decision.

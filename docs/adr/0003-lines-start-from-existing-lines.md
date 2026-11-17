# Every line after the first starts from an existing line

The first line can go anywhere; each later line must start at an end of a line already on the board (either player's). In classic dots-and-boxes any free edge can be drawn. The product owner chose this rule, so the drawing always grows as one connected shape.

## Consequences

- A dot with no free neighbors can't be Dot1, even if lines touch it.
- Move generation, the "valid start" highlight and the computer player all go through the same start-dot check; don't bypass it for "any free edge".

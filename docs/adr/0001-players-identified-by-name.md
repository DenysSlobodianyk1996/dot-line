# Players are identified by name

Lines, owned squares and the current player store the owning player's **name**, not an index or a generated ID. Names are short, readable in saved games, and already required to be unique (case-insensitively) at setup, so a separate ID would add a second identity to keep in sync.

## Consequences

- Player names must stay unique within a game, and a player can't be renamed mid-game.
- The computer player is stored under a fixed internal name that is never shown. Its display name ("Комп'ютер" / "Computer") is translated at render time, so a saved game keeps working after the language changes. A person's name may not match the computer's display name in either language.

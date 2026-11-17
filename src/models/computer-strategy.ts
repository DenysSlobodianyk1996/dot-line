import type { Difficulty, DotLineGame } from './dot-line-game.model'
import type { Line } from './line.model'

/** Returns a number in [0, 1), like Math.random. Tests pass a fixed one. */
export type RandomSource = () => number

/** Picks a line out of the current legal moves; must not change the game. */
type Strategy = (game: DotLineGame, moves: Line[], random: RandomSource) => Line

function pickRandom<T>(items: T[], random: RandomSource): T {
  const index = Math.min(items.length - 1, Math.floor(random() * items.length))
  return items[index]!
}

// Easy: any legal move, uniformly at random (CM-22)
const easy: Strategy = (_game, moves, random) => pickRandom(moves, random)

const STRATEGIES: Record<Difficulty, Strategy> = {
  easy,
  // TODO(#15): Normal (CM-23..25): claim the most squares, else a random safe line,
  // else the line giving away the fewest squares; ties broken by `random`.
  normal: easy,
}

/**
 * Which line the computer player draws now (CM-39): a pure function of the game, the difficulty
 * and a random source. Returns null when there's no legal move. The caller draws the line through
 * the normal `drawLine`, so the computer goes through the same rules as a person (CM-20).
 */
export function chooseComputerLine(
  game: DotLineGame,
  difficulty: Difficulty,
  random: RandomSource = Math.random,
): Line | null {
  const moves = game.legalMoves()
  if (moves.length === 0) return null
  return STRATEGIES[difficulty](game, moves, random)
}

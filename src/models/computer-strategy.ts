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

// how many sides are drawn now on each square beside a line
function sideCountsBeside(game: DotLineGame, line: Line): number[] {
  return game.squaresNextTo(line).map(({ row, col }) => game.drawnSideCount(row, col))
}

// how many squares this line closes (each had three sides drawn)
const claims = (sides: number[]) => sides.filter((n) => n === 3).length
// how many squares this line gives a third side, so the other player could claim them next
const givesAway = (sides: number[]) => sides.filter((n) => n === 2).length

// the moves scoring highest
function best(moves: Line[], score: (move: Line) => number): Line[] {
  const scores = moves.map(score)
  const top = Math.max(...scores)
  return moves.filter((_, index) => scores[index] === top)
}

// Normal: claim the most squares (two before one, CM-23); else a random safe line (CM-24);
// else the line giving away the fewest squares (CM-25). Ties go to the random source.
const normal: Strategy = (game, moves, random) => {
  const sideCountsByMove = new Map(moves.map((move) => [move.key, sideCountsBeside(game, move)]))
  const sidesOf = (move: Line) => sideCountsByMove.get(move.key) ?? []

  const claiming = best(moves, (move) => claims(sidesOf(move)))
  if (claims(sidesOf(claiming[0]!)) > 0) return pickRandom(claiming, random)

  return pickRandom(
    best(moves, (move) => -givesAway(sidesOf(move))),
    random,
  )
}

const STRATEGIES: Record<Difficulty, Strategy> = { easy, normal }

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

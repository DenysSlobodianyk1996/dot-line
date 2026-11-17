import { describe, expect, it } from 'vitest'
import { chooseComputerLine, COMPUTER_NAME, Dot, DotLineGame, Line } from '@/models'

const ann = { name: 'Ann', color: '#ff0000' }
const computer = { name: COMPUTER_NAME, color: '#32a06e' }
const dot = (row: number, col: number) => new Dot({ row, col })

function computerGame(size: number) {
  return new DotLineGame({
    player1: ann,
    player2: computer,
    size,
    currentPlayerName: COMPUTER_NAME,
  }).setGameMode('computer', 'easy')
}

// a random source that always returns the same value
const fixed = (value: number) => () => value

describe('computer strategy: Easy', () => {
  it('only ever returns a legal move (CM-20, CM-22, ADR-0003)', () => {
    const game = computerGame(3)
    game.drawLine(dot(1, 1), dot(1, 2))
    game.drawLine(dot(1, 2), dot(2, 2))
    const legal = game.legalMoves().map((line) => line.key)

    for (const value of [0, 0.25, 0.5, 0.75, 0.999]) {
      const line = chooseComputerLine(game, 'easy', fixed(value))
      expect(legal).toContain(line?.key)
    }
  })

  it('picks uniformly by the random source, so every legal move can be chosen (CM-22)', () => {
    const game = computerGame(2)
    game.drawLine(dot(0, 0), dot(0, 1))
    game.drawLine(dot(0, 0), dot(1, 0))
    // legal moves: 0,1-0,2  0,1-1,1  1,0-1,1  1,0-2,0
    const picked = [0, 0.3, 0.6, 0.9].map(
      (value) => chooseComputerLine(game, 'easy', fixed(value))?.key,
    )

    expect(new Set(picked)).toEqual(new Set(['0,1-0,2', '0,1-1,1', '1,0-1,1', '1,0-2,0']))
  })

  it('does not change the game', () => {
    const game = computerGame(2)
    game.drawLine(dot(0, 0), dot(0, 1))
    const before = JSON.stringify(game)

    chooseComputerLine(game, 'easy', fixed(0.5))

    expect(JSON.stringify(game)).toBe(before)
  })

  it('returns no line when there is no legal move (END-7)', () => {
    const game = computerGame(2)
    game.stop()

    expect(chooseComputerLine(game, 'easy', fixed(0))).toBeNull()
  })
})

// A Normal game whose board already has these lines, e.g. '0,0-0,1' (placed without the turn rules,
// and none of them closes a square).
function normalGame(size: number, lineKeys: string[]) {
  const lines = lineKeys.map((key) => {
    const [from, to] = key.split('-').map((end) => {
      const [row, col] = end.split(',').map(Number)
      return dot(row!, col!)
    })
    return new Line({ from, to, ownerName: ann.name })
  })
  return new DotLineGame({
    player1: ann,
    player2: computer,
    size,
    lines,
    currentPlayerName: COMPUTER_NAME,
  }).setGameMode('computer', 'normal')
}

const RANDOM_VALUES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.999]

// every line Normal picks over a spread of random values
function normalPicks(game: DotLineGame) {
  return new Set(
    RANDOM_VALUES.map((value) => chooseComputerLine(game, 'normal', fixed(value))?.key),
  )
}

describe('computer strategy: Normal', () => {
  it('claims two squares with one line when it can, over a single claim (CM-23)', () => {
    // 3×3: squares 0,0 and 0,1 miss only their shared side 0,1-1,1; square 2,2 misses only 2,3-3,3
    // prettier-ignore
    const game = normalGame(3, [
      '0,0-0,1', '0,0-1,0', '1,0-1,1',
      '0,1-0,2', '0,2-1,2', '1,1-1,2',
      '2,2-2,3', '2,2-3,2', '3,2-3,3',
    ])

    expect(normalPicks(game)).toEqual(new Set(['0,1-1,1']))
  })

  it('claims a single square when that is the only claim (CM-23)', () => {
    // 2×2: square 0,0 misses only 0,1-1,1
    const game = normalGame(2, ['0,0-0,1', '0,0-1,0', '1,0-1,1'])

    expect(normalPicks(game)).toEqual(new Set(['0,1-1,1']))
  })

  it('draws only safe lines while one exists, picked at random among them (CM-24)', () => {
    // 3×3: the center square 1,1 has two sides, so 1,1-2,1 and 2,1-2,2 would give it a third
    const game = normalGame(3, ['1,1-1,2', '1,2-2,2'])

    expect(normalPicks(game)).toEqual(
      new Set(['0,1-1,1', '1,0-1,1', '0,2-1,2', '1,2-1,3', '2,2-3,2', '2,2-2,3']),
    )
  })

  it('with no safe line left, gives away the fewest squares (CM-25)', () => {
    // 3×3 with the whole border and the center's top and bottom drawn: corners and the center have
    // two sides, the left and right middle squares one, the top and bottom middle squares two.
    // Lines between a corner and the top or bottom middle square give away two squares; the rest one.
    // prettier-ignore
    const game = normalGame(3, [
      '0,0-0,1', '0,1-0,2', '0,2-0,3',
      '3,0-3,1', '3,1-3,2', '3,2-3,3',
      '0,0-1,0', '1,0-2,0', '2,0-3,0',
      '0,3-1,3', '1,3-2,3', '2,3-3,3',
      '1,1-1,2', '2,1-2,2',
    ])

    expect(normalPicks(game)).toEqual(
      new Set(['1,0-1,1', '1,2-1,3', '2,0-2,1', '2,2-2,3', '1,1-2,1', '1,2-2,2']),
    )
  })

  it('does not change the game', () => {
    const game = normalGame(2, ['0,0-0,1', '0,0-1,0', '1,0-1,1'])
    const before = JSON.stringify(game)

    chooseComputerLine(game, 'normal', fixed(0.5))

    expect(JSON.stringify(game)).toBe(before)
  })
})

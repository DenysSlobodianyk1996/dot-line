import { describe, expect, it } from 'vitest'
import { chooseComputerLine, COMPUTER_NAME, Dot, DotLineGame } from '@/models'

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

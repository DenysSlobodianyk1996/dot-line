import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPUTER_NAME, Dot, DotsAndBoxesGame, Line } from '@/models'

const ann = { name: 'Ann', color: '#ff0000' }
const bob = { name: 'Bob', color: '#0000ff' }
const dot = (row: number, col: number) => new Dot({ row, col })
type Edge = [number, number, number, number]

function newGame(size: number, first = 'Ann') {
  return new DotsAndBoxesGame({ player1: ann, player2: bob, size, currentPlayerName: first })
}

/** Draws each edge for whoever's turn it is; fails if a move is rejected. */
function play(game: DotsAndBoxesGame, edges: Edge[]) {
  for (const [r1, c1, r2, c2] of edges) {
    expect(game.canDraw(dot(r1, c1), dot(r2, c2)), `edge ${[r1, c1, r2, c2]}`).toBe(true)
    game.drawLine(dot(r1, c1), dot(r2, c2))
  }
}

const allDots = (size: number) =>
  Array.from({ length: (size + 1) ** 2 }, (_, i) => dot(Math.floor(i / (size + 1)), i % (size + 1)))

// every edge of a 2x2 board, each starting from an existing line.
// Ann draws odd moves, Bob even: Bob closes (0,1) on move 10, Ann (1,1) on 11,
// Bob (0,0) and (1,0) on 12, so Bob wins 3-1.
const FULL_2X2: Edge[] = [
  [0, 0, 0, 1],
  [0, 1, 0, 2],
  [0, 2, 1, 2],
  [1, 2, 2, 2],
  [2, 2, 2, 1],
  [2, 1, 2, 0],
  [2, 0, 1, 0],
  [1, 0, 0, 0],
  [0, 1, 1, 1],
  [1, 1, 1, 2],
  [1, 1, 2, 1],
  [1, 0, 1, 1],
]

afterEach(() => {
  vi.restoreAllMocks()
})

describe('moves', () => {
  it('lets any dot start the first line on an empty board (MV-1)', () => {
    const game = newGame(2)

    for (const d of allDots(2)) {
      expect(game.isValidStartDot(d)).toBe(true)
    }
  })

  it('only lets the ends of existing lines start a line once one exists (MV-2)', () => {
    const game = newGame(3)
    play(game, [[1, 1, 1, 2]])

    const starts = allDots(3).filter((d) => game.isValidStartDot(d))
    expect(starts.map((d) => d.key)).toEqual(['1,1', '1,2'])
    expect(game.canDraw(dot(0, 0), dot(0, 1))).toBe(false)
  })

  it('does not let a dot with no free neighbor start a line (MV-2, ADR-0003)', () => {
    const game = newGame(2)
    play(game, [
      [0, 0, 0, 1],
      [0, 0, 1, 0],
    ])

    expect(game.isValidStartDot(dot(0, 0))).toBe(false)
    expect(game.isValidStartDot(dot(0, 1))).toBe(true)
  })

  it('only lets a line end at an undrawn neighbor inside the board (MV-3)', () => {
    const game = newGame(3)
    play(game, [[1, 1, 1, 2]])

    expect(game.validNeighbors(dot(1, 1)).map((d) => d.key)).toEqual(['0,1', '2,1', '1,0'])
    expect(game.canDraw(dot(1, 1), dot(1, 2))).toBe(false) // already drawn
    expect(game.canDraw(dot(1, 1), dot(2, 2))).toBe(false) // diagonal
    expect(game.canDraw(dot(1, 1), dot(1, 3))).toBe(false) // not adjacent
    expect(game.canDraw(dot(1, 2), dot(1, 3))).toBe(true)
  })

  it('ignores a rejected line: nothing is drawn and the turn stays (MV-3)', () => {
    const game = newGame(2)
    play(game, [[0, 0, 0, 1]])

    expect(game.drawLine(dot(0, 1), dot(0, 0))).toEqual([])
    expect(game.lines).toHaveLength(1)
    expect(game.currentPlayerName).toBe('Bob')
  })

  it('draws the line for the current player', () => {
    const game = newGame(2)
    play(game, [[0, 0, 0, 1]])

    expect(game.hasLine(dot(0, 1), dot(0, 0))).toBe(true)
    expect(game.lines[0]?.ownerName).toBe('Ann')
  })
})

describe('owned squares', () => {
  it('gives the square to whoever draws its 4th edge (SQ-1)', () => {
    const game = newGame(2, 'Bob')
    play(game, [
      [0, 0, 0, 1], // Bob
      [0, 1, 0, 2], // Ann
      [0, 0, 1, 0], // Bob
      [0, 2, 1, 2], // Ann
      [1, 0, 1, 1], // Bob
    ])

    const closed = game.drawLine(dot(0, 1), dot(1, 1)) // Ann

    expect(closed.map((s) => [s.row, s.col, s.ownerName])).toEqual([[0, 0, 'Ann']])
    expect(game.getSquare(0, 0)?.ownerName).toBe('Ann')
    expect(game.scoreOf('Ann')).toBe(1)
    expect(game.scoreOf('Bob')).toBe(0)
  })

  it('gives both squares to the drawer when one line closes two (SQ-2)', () => {
    const game = newGame(2)
    play(game, [
      [0, 0, 0, 1],
      [0, 1, 0, 2],
      [0, 2, 1, 2],
      [1, 2, 1, 1],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
    ])

    const closed = game.drawLine(dot(0, 1), dot(1, 1)) // Ann, 7th line

    expect(closed).toHaveLength(2)
    expect(game.getSquare(0, 0)?.ownerName).toBe('Ann')
    expect(game.getSquare(0, 1)?.ownerName).toBe('Ann')
    expect(game.scoreOf('Ann')).toBe(2)
  })

  it('never changes the owner of an owned square (SQ-3)', () => {
    const game = newGame(2)
    play(game, FULL_2X2.slice(0, 10)) // Bob owns (0,1)

    play(game, FULL_2X2.slice(10)) // later lines next to (0,1)

    expect(game.getSquare(0, 1)?.ownerName).toBe('Bob')
    expect(game.dirtySquares).toHaveLength(4)
  })
})

describe('turns', () => {
  it('passes the turn after every line (TR-1)', () => {
    const game = newGame(2)

    play(game, [[0, 0, 0, 1]])
    expect(game.currentPlayer).toEqual(bob)
    play(game, [[0, 1, 0, 2]])
    expect(game.currentPlayer).toEqual(ann)
  })

  it('passes the turn even after a line that claims a square (TR-1, ADR-0002)', () => {
    const game = newGame(2)
    play(game, FULL_2X2.slice(0, 9))
    expect(game.currentPlayerName).toBe('Bob')

    expect(game.drawLine(dot(1, 1), dot(1, 2))).toHaveLength(1) // Bob claims (0,1)
    expect(game.currentPlayerName).toBe('Ann')
  })

  it('picks a random first player on start (TR-2)', () => {
    const game = new DotsAndBoxesGame({ player1: ann, player2: bob, size: 2 })

    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(game.start().currentPlayerName).toBe('Ann')

    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    expect(game.start().currentPlayerName).toBe('Bob')
  })

  it('starts a rematch on a clear board with the same players and size (TR-2, END-6)', () => {
    const game = newGame(2)
    play(game, FULL_2X2)

    game.start()

    expect(game.lines).toEqual([])
    expect(game.dirtySquares).toEqual([])
    expect(game.status).toBe('playing')
    expect(game.finishReason).toBeNull()
    expect(game.players).toEqual([ann, bob])
    expect(game.size).toBe(2)
  })
})

describe('end of game', () => {
  it('finishes once every square is owned, and the higher score wins (END-1, END-3)', () => {
    const game = newGame(2)

    play(game, FULL_2X2.slice(0, 11))
    expect(game.isFinished).toBe(false)

    play(game, FULL_2X2.slice(11))
    expect(game.isFinished).toBe(true)
    expect(game.finishReason).toBe('completed')
    expect(game.scoreOf('Bob')).toBe(3)
    expect(game.scoreOf('Ann')).toBe(1)
    expect(game.winner).toEqual(bob)
  })

  it('finishes early on Stop (END-2)', () => {
    const game = newGame(2)
    play(game, [[0, 0, 0, 1]])

    game.stop()

    expect(game.isFinished).toBe(true)
    expect(game.finishReason).toBe('stopped')
  })

  it('keeps a completed game completed when Stop is pressed afterwards', () => {
    const game = newGame(2)
    play(game, FULL_2X2)

    game.stop()

    expect(game.finishReason).toBe('completed')
  })

  it('has no winner on equal scores, including 0-0 (END-3)', () => {
    const game = newGame(2)
    game.stop()
    expect(game.winner).toBeNull()

    const tied = newGame(2, 'Bob')
    play(tied, [
      [0, 0, 0, 1], // Bob
      [0, 1, 0, 2], // Ann
      [0, 0, 1, 0], // Bob
      [0, 2, 1, 2], // Ann
      [1, 0, 1, 1], // Bob
      [0, 1, 1, 1], // Ann claims (0,0)
      [1, 1, 1, 2], // Bob claims (0,1)
    ])
    tied.stop()
    expect(tied.scoreOf('Ann')).toBe(1)
    expect(tied.scoreOf('Bob')).toBe(1)
    expect(tied.winner).toBeNull()
  })

  it('allows no moves after the game ends (END-7)', () => {
    const game = newGame(2)
    play(game, [[0, 0, 0, 1]])
    game.stop()

    expect(allDots(2).some((d) => game.isValidStartDot(d))).toBe(false)
    expect(game.drawLine(dot(0, 1), dot(0, 2))).toEqual([])
    expect(game.lines).toHaveLength(1)
  })
})

describe('rehydration', () => {
  const roundTrip = (game: DotsAndBoxesGame) =>
    new DotsAndBoxesGame(JSON.parse(JSON.stringify(game)))

  it('restores lines, owned squares, current player and status, including row/col 0 (PS-1, PS-2)', () => {
    const game = newGame(2)
    play(game, FULL_2X2.slice(0, 10))

    const restored = roundTrip(game)

    expect(restored).toEqual(game)
    expect(restored.lines.map((l) => [l.key, l.ownerName])).toEqual(
      game.lines.map((l) => [l.key, l.ownerName]),
    )
    expect(restored.hasLine(dot(0, 0), dot(0, 1))).toBe(true)
    expect(restored.getSquare(0, 1)?.ownerName).toBe('Bob')
    expect(restored.currentPlayer).toEqual(ann)
    expect(restored.status).toBe('playing')
  })

  it('continues a restored game with the same rules (PS-2)', () => {
    const game = newGame(2)
    play(game, FULL_2X2.slice(0, 11))

    const restored = roundTrip(game)
    const closed = restored.drawLine(dot(1, 0), dot(1, 1))

    expect(closed).toHaveLength(2)
    expect(restored.isFinished).toBe(true)
    expect(restored.winner).toEqual(bob)
  })

  it('restores a finished game as finished (PS-2)', () => {
    const game = newGame(2)
    play(game, [[0, 0, 0, 1]])
    game.stop()

    const restored = roundTrip(game)

    expect(restored.isFinished).toBe(true)
    expect(restored.finishReason).toBe('stopped')
  })

  it('reset keeps the same object and replaces its state (PS-2)', () => {
    const saved = JSON.parse(JSON.stringify(newGame(2, 'Bob')))
    const game = new DotsAndBoxesGame()

    game.reset(saved)

    expect(game.currentPlayerName).toBe('Bob')
    expect(game.isGameStarted).toBe(true)
    game.reset()
    expect(game.isGameStarted).toBe(false)
  })

  it('restores a save without a current player so start can pick one (PS-3)', () => {
    const legacy = new DotsAndBoxesGame(
      JSON.parse(JSON.stringify({ player1: ann, player2: bob, size: 3 })),
    )

    expect(legacy.isGameStarted).toBe(true)
    expect(legacy.currentPlayerName).toBeNull()

    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    expect(legacy.start().currentPlayer).toEqual(bob)
  })
})

describe('game mode', () => {
  const roundTrip = (game: DotsAndBoxesGame) =>
    new DotsAndBoxesGame(JSON.parse(JSON.stringify(game)))
  const computer = { name: COMPUTER_NAME, color: '#32a06e' }

  function computerGame(first: string) {
    return new DotsAndBoxesGame({
      player1: ann,
      player2: computer,
      size: 2,
      currentPlayerName: first,
    }).setGameMode('computer', 'easy')
  }

  it('loads a save from before game modes as Two players (CM-33)', () => {
    const legacy = new DotsAndBoxesGame(
      JSON.parse(JSON.stringify({ player1: ann, player2: bob, size: 2, currentPlayerName: 'Ann' })),
    )

    expect(legacy.gameMode).toBe('twoPlayers')
    expect(legacy.difficulty).toBeNull()
    expect(legacy.isComputerTurn).toBe(false)
  })

  it('saves the game mode and difficulty with the game (CM-30)', () => {
    const restored = roundTrip(computerGame('Ann'))

    expect(restored.gameMode).toBe('computer')
    expect(restored.difficulty).toBe('easy')
  })

  it("knows when it is the computer player's turn (CM-11)", () => {
    const game = computerGame(COMPUTER_NAME)
    expect(game.isComputerTurn).toBe(true)

    game.drawLine(dot(0, 0), dot(0, 1))
    expect(game.isComputerTurn).toBe(false)
    expect(game.lines[0]?.ownerName).toBe(COMPUTER_NAME)
  })

  it('is never the computer turn once the game is finished (CM-17)', () => {
    const game = computerGame(COMPUTER_NAME)
    game.stop()

    expect(game.isComputerTurn).toBe(false)
  })

  it('keeps the game mode and difficulty on a rematch (CM-28)', () => {
    const game = computerGame('Ann')
    game.stop()

    game.start()

    expect(game.gameMode).toBe('computer')
    expect(game.difficulty).toBe('easy')
  })

  it('has no difficulty in Two players mode', () => {
    const game = newGame(2).setGameMode('twoPlayers', 'easy')

    expect(game.difficulty).toBeNull()
  })
})

describe('legal moves', () => {
  const keys = (game: DotsAndBoxesGame) =>
    game
      .legalMoves()
      .map((line) => line.key)
      .sort()

  it('lists every edge of an empty board once (MV-1)', () => {
    const game = newGame(2)

    // a 2x2 board has 12 edges
    expect(keys(game)).toHaveLength(12)
    expect(new Set(keys(game)).size).toBe(12)
  })

  it('only lists undrawn lines from the ends of existing lines (MV-2, MV-3, ADR-0003)', () => {
    const game = newGame(2)
    play(game, [
      [0, 0, 0, 1],
      [0, 0, 1, 0],
    ])

    // 0,0 has no free neighbor; 0,1 and 1,0 are the only valid starts
    expect(keys(game)).toEqual(['0,1-0,2', '0,1-1,1', '1,0-1,1', '1,0-2,0'])
  })

  it('agrees with canDraw for every listed line (ADR-0003)', () => {
    const game = newGame(3)
    play(game, [
      [1, 1, 1, 2],
      [1, 2, 2, 2],
    ])

    const moves = game.legalMoves()
    expect(moves.length).toBeGreaterThan(0)
    for (const line of moves) {
      expect(game.canDraw(line.from, line.to) || game.canDraw(line.to, line.from)).toBe(true)
    }
  })

  it('is empty once the game is finished (END-7)', () => {
    const game = newGame(2)
    play(game, [[0, 0, 0, 1]])
    game.stop()

    expect(game.legalMoves()).toEqual([])
  })

  it('draws a listed line whichever of its ends is the valid start (MV-2, CM-20)', () => {
    const game = newGame(2)
    play(game, [[1, 0, 1, 1]])
    // stored in board order as 0,0-1,0, but only its second end 1,0 is a valid start
    const up = game.legalMoves().find((line) => line.key === '0,0-1,0')!

    game.drawLine(up)

    expect(game.hasLine(dot(0, 0), dot(1, 0))).toBe(true)
    expect(game.currentPlayerName).toBe('Ann')
  })

  it('rejects a line given as a Line when neither end is a valid start (MV-2)', () => {
    const game = newGame(2)
    play(game, [[0, 0, 0, 1]])

    game.drawLine(new Line({ from: dot(2, 1), to: dot(2, 2) }))

    expect(game.lines).toHaveLength(1)
    expect(game.currentPlayerName).toBe('Bob')
  })
})

describe('square geometry', () => {
  it('finds the squares on either side of a line, inside the board', () => {
    const game = newGame(2)
    const at = (line: Line) => game.squaresNextTo(line).map(({ row, col }) => `${row},${col}`)

    expect(at(new Line({ from: dot(1, 0), to: dot(1, 1) }))).toEqual(['0,0', '1,0'])
    expect(at(new Line({ from: dot(0, 1), to: dot(1, 1) }))).toEqual(['0,0', '0,1'])
    expect(at(new Line({ from: dot(0, 0), to: dot(0, 1) }))).toEqual(['0,0'])
    expect(at(new Line({ from: dot(1, 2), to: dot(2, 2) }))).toEqual(['1,1'])
  })

  it('counts how many sides of a square are drawn', () => {
    const game = newGame(2)
    expect(game.drawnSideCount(0, 0)).toBe(0)

    play(game, [
      [0, 0, 0, 1],
      [0, 1, 1, 1],
      [1, 1, 1, 0],
    ])

    expect(game.drawnSideCount(0, 0)).toBe(3)
    expect(game.drawnSideCount(0, 1)).toBe(1)
    expect(game.drawnSideCount(1, 1)).toBe(0)
  })
})

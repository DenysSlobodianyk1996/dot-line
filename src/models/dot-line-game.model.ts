import type { Player } from './player.model'
import { Dot } from './dot.model'
import { Line } from './line.model'
import { Square } from './square.model'

export type GameStatus = 'playing' | 'finished'
export type FinishReason = 'completed' | 'stopped'

const DIRECTIONS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

export class DotLineGame {
  public player1: Player | null
  public player2: Player | null
  public size: number | null
  public lines: Line[]
  public dirtySquares: Square[] // owned squares only
  public currentPlayerName: string | null
  public status: GameStatus
  public finishReason: FinishReason | null

  constructor({
    player1,
    player2,
    size,
    lines,
    dirtySquares,
    currentPlayerName,
    status,
    finishReason,
  }: Partial<DotLineGame> = {}) {
    this.player1 = player1 ?? null
    this.player2 = player2 ?? null
    this.size = size ? Number(size) : null
    this.lines = (lines ?? []).map((line) => new Line(line))
    this.dirtySquares = (dirtySquares ?? []).map((square) => new Square(square))
    this.currentPlayerName = currentPlayerName ?? null
    this.status = status ?? 'playing'
    this.finishReason = finishReason ?? null
  }

  setPlayer1(player1: Player) {
    this.player1 = player1
    return this
  }
  setPlayer2(player2: Player) {
    this.player2 = player2
    return this
  }
  setSize(size: number) {
    // the setup number input can deliver a string
    this.size = Number(size)
    return this
  }

  get players(): Player[] {
    return [this.player1, this.player2].filter((player): player is Player => !!player)
  }

  get currentPlayer(): Player | null {
    return this.getPlayerByName(this.currentPlayerName)
  }

  getPlayerByName(name: string | null): Player | null {
    return this.players.find((p) => p.name === name) ?? null
  }

  getOpponent(name: string): Player | null {
    return this.players.find((p) => p.name !== name) ?? null
  }

  get isGameStarted(): boolean {
    return !!this.player1 && !!this.player2 && !!this.size && this.size > 0
  }

  get isFinished(): boolean {
    return this.status === 'finished'
  }

  get totalSquares(): number {
    return (this.size ?? 0) ** 2
  }

  scoreOf(name: string): number {
    return this.dirtySquares.filter((square) => square.ownerName === name).length
  }

  get winner(): Player | null {
    const [first, second] = this.players
    if (!first || !second) return null
    const difference = this.scoreOf(first.name) - this.scoreOf(second.name)
    if (difference === 0) return null
    return difference > 0 ? first : second
  }

  hasLine(a: Dot, b: Dot): boolean {
    const key = Line.key(a, b)
    return this.lines.some((line) => line.key === key)
  }

  isInside(dot: Dot): boolean {
    const size = this.size ?? 0
    return dot.row >= 0 && dot.col >= 0 && dot.row <= size && dot.col <= size
  }

  neighbors(dot: Dot): Dot[] {
    return DIRECTIONS.map(
      ([rowStep, colStep]) => new Dot({ row: dot.row + rowStep, col: dot.col + colStep }),
    ).filter((neighbor) => this.isInside(neighbor))
  }

  validNeighbors(dot: Dot): Dot[] {
    return this.neighbors(dot).filter((neighbor) => !this.hasLine(dot, neighbor))
  }

  isValidStartDot(dot: Dot): boolean {
    if (this.isFinished || !this.isInside(dot)) return false
    if (this.lines.length > 0 && !this.lines.some((line) => line.touches(dot))) return false
    return this.validNeighbors(dot).length > 0
  }

  canDraw(from: Dot, to: Dot): boolean {
    return this.isValidStartDot(from) && this.validNeighbors(from).some((dot) => dot.equals(to))
  }

  getSquare(row: number, col: number): Square | null {
    return this.dirtySquares.find((square) => square.row === row && square.col === col) ?? null
  }

  isSquareClosed(row: number, col: number): boolean {
    const dot = (r: number, c: number) => new Dot({ row: r, col: c })
    return (
      this.hasLine(dot(row, col), dot(row, col + 1)) &&
      this.hasLine(dot(row + 1, col), dot(row + 1, col + 1)) &&
      this.hasLine(dot(row, col), dot(row + 1, col)) &&
      this.hasLine(dot(row, col + 1), dot(row + 1, col + 1))
    )
  }

  /** Draws a line for the current player and returns the squares it closed. */
  drawLine(from: Dot, to: Dot): Square[] {
    const ownerName = this.currentPlayerName
    if (!ownerName || !this.canDraw(from, to)) return []

    const line = new Line({ from, to, ownerName })
    this.lines.push(line)

    const closedSquares = this.squaresNextTo(line)
      .filter(({ row, col }) => !this.getSquare(row, col) && this.isSquareClosed(row, col))
      .map(({ row, col }) => new Square({ row, col, ownerName }))
    this.dirtySquares.push(...closedSquares)

    this.currentPlayerName = this.getOpponent(ownerName)?.name ?? null
    if (this.dirtySquares.length >= this.totalSquares) {
      this.finish('completed')
    }
    return closedSquares
  }

  stop() {
    if (!this.isFinished) {
      this.finish('stopped')
    }
  }

  start() {
    const players = this.players
    this.lines = []
    this.dirtySquares = []
    this.status = 'playing'
    this.finishReason = null
    this.currentPlayerName = players[Math.floor(Math.random() * players.length)]?.name ?? null
    return this
  }

  reset(game?: Partial<DotLineGame> | null) {
    Object.assign(this, new DotLineGame(game ?? {}))
  }

  private squaresNextTo(line: Line): { row: number; col: number }[] {
    const { row, col } = line.from
    const size = this.size ?? 0
    const candidates = line.isHorizontal
      ? [
          { row: row - 1, col },
          { row, col },
        ]
      : [
          { row, col: col - 1 },
          { row, col },
        ]
    return candidates.filter((s) => s.row >= 0 && s.col >= 0 && s.row < size && s.col < size)
  }

  private finish(reason: FinishReason) {
    this.status = 'finished'
    this.finishReason = reason
  }
}

export interface GameSetupForm {
  player1: Player
  player2: Player
  size: number
}

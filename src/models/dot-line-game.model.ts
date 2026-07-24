import type { Player } from './player.model'
import type { Square } from './square.model'

export class DotLineGame {
  public player1: Player | null
  public player2: Player | null
  public size: number | null
  public dirtySquares: Square[]

  constructor({ player1, player2, size, dirtySquares }: Partial<DotLineGame> = {}) {
    this.player1 = player1 || null
    this.player2 = player2 || null
    this.size = size || null
    this.dirtySquares = dirtySquares || []
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
    this.size = size
    return this
  }
  setDirtySquares(dirtySquares: Square[]) {
    this.dirtySquares = dirtySquares
    return this
  }

  get isGameStarted(): boolean {
    return !!this.player1 && !!this.player2 && !!this.size && this.size > 0
  }

  reset(game?: DotLineGame) {
    Object.assign(this, new DotLineGame(game))
    return
  }
}

export interface GameSetupForm {
  player1: Player
  player2: Player
  size: number
}

import type { Player } from './player.model'

export class Square {
  x: number | null = null // row index from 0 to n-1
  y: number | null = null // col index from 0 to n-1
  owner: Player | null = null
  lines: SquareLine[] = []

  setX(x: number) {
    this.x = x
    return this
  }
  setY(y: number) {
    this.y = y
    return this
  }
  setOwner(owner: Player) {
    this.owner = owner
    return this
  }
  setLines(lines: SquareLine[]) {
    this.lines = Array.from(new Set(lines))
    return this
  }
}

export type SquareLine = 'left' | 'right' | 'top' | 'bottom'

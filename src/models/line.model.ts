import { Dot } from './dot.model'

export class Line {
  from: Dot // normalized: from is before to (by row, then col)
  to: Dot
  ownerName: string | null

  constructor({ from, to, ownerName }: Partial<Line> = {}) {
    const a = new Dot(from)
    const b = new Dot(to)
    const isOrdered = Line.isBefore(a, b)
    this.from = isOrdered ? a : b
    this.to = isOrdered ? b : a
    this.ownerName = ownerName ?? null
  }

  static key(a: Dot, b: Dot): string {
    return Line.isBefore(a, b) ? `${a.key}-${b.key}` : `${b.key}-${a.key}`
  }

  private static isBefore(a: Dot, b: Dot): boolean {
    return a.row < b.row || (a.row === b.row && a.col <= b.col)
  }

  get key(): string {
    return Line.key(this.from, this.to)
  }

  get isHorizontal(): boolean {
    return this.from.row === this.to.row
  }

  touches(dot: Dot): boolean {
    return this.from.equals(dot) || this.to.equals(dot)
  }

  setOwner(ownerName: string) {
    this.ownerName = ownerName
    return this
  }
}

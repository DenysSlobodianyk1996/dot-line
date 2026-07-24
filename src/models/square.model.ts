export class Square {
  x: number | null = null // row index from 0 to n-1
  y: number | null = null // col index from 0 to n-1
  ownerName: string | null = null
  lines: Line[] = []

  constructor({ x, y, ownerName, lines }: Partial<Square> = {}) {
    this.x = x || null
    this.y = y || null
    this.ownerName = ownerName || null
    this.lines = (lines || []).filter(Boolean).map((line) => new Line(line))
  }

  setX(x: number) {
    this.x = x
    return this
  }
  setY(y: number) {
    this.y = y
    return this
  }
  setOwner(ownerName: string) {
    this.ownerName = ownerName
    return this
  }
  setLines(lines: Line[]) {
    this.lines = lines
    return this
  }
}

export class Line {
  ownerName: string | null
  position: LinePosition | null

  constructor({ ownerName, position }: Partial<Line> = {}) {
    this.ownerName = ownerName || null
    this.position = position || null
  }

  setOwner(ownerName: string) {
    this.ownerName = ownerName
    return this
  }

  setPosition(position: LinePosition) {
    this.position = position
    return this
  }
}

export type LinePosition = 'left' | 'right' | 'top' | 'bottom'

export class Dot {
  row: number // row index from 0 to n
  col: number // col index from 0 to n

  constructor({ row, col }: Partial<Dot> = {}) {
    this.row = row ?? 0
    this.col = col ?? 0
  }

  get key(): string {
    return `${this.row},${this.col}`
  }

  equals(dot: Dot | null | undefined): boolean {
    return !!dot && dot.row === this.row && dot.col === this.col
  }
}

export class Square {
  row: number // row index from 0 to n-1
  col: number // col index from 0 to n-1
  ownerName: string | null

  constructor({ row, col, ownerName }: Partial<Square> = {}) {
    this.row = row ?? 0
    this.col = col ?? 0
    this.ownerName = ownerName ?? null
  }

  setOwner(ownerName: string) {
    this.ownerName = ownerName
    return this
  }
}

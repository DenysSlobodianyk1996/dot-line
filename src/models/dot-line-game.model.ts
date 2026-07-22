import type { Player } from "./player.model";
import type { Square } from "./square.model";

export class DotLineGame {
  public player1: Player | null = null;
  public player2: Player | null = null;
  public size: number | null = null;
  public dirtySquares: Square[] = [];

  addPlayer1(player1: Player) {
    this.player1 = player1;
    return this;
  }
  addPlayer2(player2: Player) {
    this.player2 = player2;
    return this;
  }
  setSize(size: number) {
    this.size = size;
    return this;
  }
  setDirtySquares(dirtySquares: Square[]) {
    this.dirtySquares = dirtySquares;
    return this;
  }
}

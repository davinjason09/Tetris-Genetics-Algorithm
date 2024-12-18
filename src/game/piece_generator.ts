import { Grid } from './grid';
import { Piece, PieceType } from './piece';

export class RandomPieceGenerator {
  private bag: PieceType[];
  private index: number;

  constructor() {
    this.bag = [
      PieceType.O,
      PieceType.J,
      PieceType.L,
      PieceType.Z,
      PieceType.S,
      PieceType.T,
      PieceType.I,
    ];
    this.shuffleBag();
    this.index = -1;
  }

  public nextPiece(grid: Grid): Piece {
    this.index++;

    if (this.index >= this.bag.length) {
      this.index = 0;
      this.shuffleBag();
    }

    return Piece.fromIndex(this.bag[this.index], grid);
  }

  private shuffleBag(): void {
    let currentIndex: number = this.bag.length;
    let temporaryValue: number;
    let randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      temporaryValue = this.bag[currentIndex];
      this.bag[currentIndex] = this.bag[randomIndex];
      this.bag[randomIndex] = temporaryValue;
    }
  }
}

import { Piece } from './piece';

export class RandomPieceGenerator {
  private bag: number[];
  private index: number;

  constructor() {
    this.bag = [0, 1, 2, 3, 4, 5, 6];
    this.shuffleBag();
    this.index = -1;
  }

  public nextPiece(): Piece {
    this.index++;

    if (this.index >= this.bag.length) {
      this.index = 0;
      this.shuffleBag();
    }

    return Piece.fromIndex(this.bag[this.index]);
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

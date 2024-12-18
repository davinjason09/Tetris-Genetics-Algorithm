import { Grid } from './grid';

export enum PieceType {
  O = 0,
  J,
  L,
  Z,
  S,
  T,
  I,
}

export class Piece {
  cells: number[][];
  row: number;
  column: number;

  constructor(cells: number[][]) {
    this.cells = cells;
    this.row = 0;
    this.column = 0;
  }

  static fromIndex(index: PieceType, grid: Grid): Piece {
    let piece: Piece;
    switch (index) {
      case PieceType.O:
        piece = new Piece([
          [1, 1],
          [1, 1],
        ]);
        break;
      case PieceType.J:
        piece = new Piece([
          [2, 0, 0],
          [2, 2, 2],
          [0, 0, 0],
        ]);
        break;
      case PieceType.L:
        piece = new Piece([
          [0, 0, 3],
          [3, 3, 3],
          [0, 0, 0],
        ]);
        break;
      case PieceType.Z:
        piece = new Piece([
          [4, 4, 0],
          [0, 4, 4],
          [0, 0, 0],
        ]);
        break;
      case PieceType.S:
        piece = new Piece([
          [0, 5, 5],
          [5, 5, 0],
          [0, 0, 0],
        ]);
        break;
      case PieceType.T:
        piece = new Piece([
          [0, 6, 0],
          [6, 6, 6],
          [0, 0, 0],
        ]);
        break;
      case PieceType.I:
        piece = new Piece([
          [0, 0, 0, 0],
          [7, 7, 7, 7],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ]);
        break;
      default:
        throw new Error('Invalid piece index');
    }
    piece.row = 0;
    piece.column = Math.floor((grid.columns - piece.cells[0].length) / 2); // Center piece
    return piece;
  }

  public clone(): Piece {
    const clonedCells = this.cells.map((row) => [...row]);
    const piece = new Piece(clonedCells);
    piece.row = this.row;
    piece.column = this.column;
    return piece;
  }

  private canMoveLeft(grid: Grid): boolean {
    return this.canMove(grid, 0, -1);
  }

  private canMoveRight(grid: Grid): boolean {
    return this.canMove(grid, 0, 1);
  }

  private canMoveDown(grid: Grid): boolean {
    return this.canMove(grid, 1, 0);
  }

  public moveLeft(grid: Grid): boolean {
    if (this.canMoveLeft(grid)) {
      this.column--;
      return true;
    }

    return false;
  }

  public moveRight(grid: Grid): boolean {
    if (this.canMoveRight(grid)) {
      this.column++;
      return true;
    }

    return false;
  }

  public moveDown(grid: Grid): boolean {
    if (this.canMoveDown(grid)) {
      this.row++;
      return true;
    }

    return false;
  }

  private canMove(grid: Grid, rowOffset: number, colOffset: number): boolean {
    for (let r = 0; r < this.cells.length; r++) {
      for (let c = 0; c < this.cells[r].length; c++) {
        if (this.cells[r][c] !== 0) {
          const newRow = this.row + r + rowOffset;
          const newCol = this.column + c + colOffset;

          // Check bounds and collisions
          if (
            newRow < 0 ||
            newRow >= grid.rows ||
            newCol < 0 ||
            newCol >= grid.columns ||
            grid.cells[newRow][newCol] !== 0
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  public rotate(grid: Grid): boolean {
    const originalCells = this.cells.map((row) => [...row]);
    this.cells = this.transposeAndReverse(this.cells);

    if (!grid.valid(this)) {
      this.cells = originalCells;
      return false;
    }

    return true;
  }

  private transposeAndReverse(matrix: number[][]): number[][] {
    const transposed = matrix[0].map((_, i) => matrix.map((row) => row[i]));
    return transposed.map((row) => row.reverse());
  }
}

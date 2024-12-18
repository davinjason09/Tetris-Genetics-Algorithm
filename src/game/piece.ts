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
  public cells: number[][];
  public row: number;
  public column: number;

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

  private move(grid: Grid, rowOffset: number, colOffset: number): boolean {
    if (this.canMove(grid, rowOffset, colOffset)) {
      this.row += rowOffset;
      this.column += colOffset;
      return true;
    }

    return false;
  }

  public moveLeft(grid: Grid): boolean {
    return this.move(grid, 0, -1);
  }

  public moveRight(grid: Grid): boolean {
    return this.move(grid, 0, 1);
  }

  public moveDown(grid: Grid): boolean {
    return this.move(grid, 1, 0);
  }

  public rotate(grid: Grid): boolean {
    const originalCells = this.cells.map((row) => [...row]);
    this.cells = this.transposeAndReverse(this.cells);

    if (!grid.isValidMove(this)) {
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

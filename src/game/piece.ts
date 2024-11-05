import { Grid } from "./grid";

// TODO: refactor Piece to handle rotation state better

export class Piece {
  cells: number[][];
  row: number;
  column: number;
  color: string;

  constructor(cells: number[][], color: string) {
    this.cells = cells;
    this.row = 0;
    this.column = 0;
    this.color = color;
  }

  static fromIndex(index: number): Piece {
    let piece: Piece;
    switch (index) {
      case 0: // O piece
        piece = new Piece(
          [
            [1, 1],
            [1, 1],
          ],
          "#0000aa",
        );
        break;
      case 1: // J piece
        piece = new Piece(
          [
            [2, 0, 0],
            [2, 2, 2],
            [0, 0, 0],
          ],
          "#c0c0c0",
        );
        break;
      case 2: // L piece
        piece = new Piece(
          [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0],
          ],
          "#aa00aa",
        );
        break;
      case 3: // Z piece
        piece = new Piece(
          [
            [4, 4, 0],
            [0, 4, 4],
            [0, 0, 0],
          ],
          "#00aaaa",
        );
        break;
      case 4: // S piece
        piece = new Piece(
          [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0],
          ],
          "#00aa00",
        );
        break;
      case 5: // T piece
        piece = new Piece(
          [
            [0, 6, 0],
            [6, 6, 6],
            [0, 0, 0],
          ],
          "#aa5500",
        );
        break;
      case 6: // I piece
        piece = new Piece(
          [
            [0, 0, 0, 0],
            [7, 7, 7, 7],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          "#aa0000",
        );
        break;
      default:
        throw new Error("Invalid piece index");
    }
    piece.row = 0;
    piece.column = Math.floor((10 - piece.cells[0].length) / 2); // Center piece
    return piece;
  }

  clone(): Piece {
    const clonedCells = this.cells.map((row) => [...row]);
    const piece = new Piece(clonedCells, this.color);
    piece.row = this.row;
    piece.column = this.column;
    return piece;
  }

  canMoveLeft(grid: Grid): boolean {
    return this.canMove(grid, 0, -1);
  }

  canMoveRight(grid: Grid): boolean {
    return this.canMove(grid, 0, 1);
  }

  canMoveDown(grid: Grid): boolean {
    return this.canMove(grid, 1, 0);
  }

  moveLeft(grid: Grid): boolean {
    if (this.canMoveLeft(grid)) {
      this.column--;
      return true;
    }

    return false;
  }

  moveRight(grid: Grid): boolean {
    if (this.canMoveRight(grid)) {
      this.column++;
      return true;
    }

    return false;
  }

  moveDown(grid: Grid): boolean {
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
            grid.board[newRow][newCol] !== 0
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  rotate(grid: Grid): boolean {
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

  //rotate(grid: Grid): boolean {
  //  const offset = this.computeRotateOffset(grid);
  //  if (offset) {
  //    this.row += offset.rowOffset;
  //    this.column += offset.columnOffset;
  //    this.rotateCells();
  //    return true;
  //  }
  //  return false;
  //}
}

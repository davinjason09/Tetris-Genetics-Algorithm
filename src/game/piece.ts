import { Grid } from "./grid";

export class Piece {
  cells: number[][];
  dimension: number;
  row: number;
  column: number;

  constructor(cells: number[][]) {
    this.cells = cells;
    this.dimension = this.cells.length;
    this.row = 0;
    this.column = 0;
  }

  static fromIndex(index: number): Piece {
    let piece: Piece;
    switch (index) {
      case 0: // O
        piece = new Piece([
          [0x0000AA, 0x0000AA],
          [0x0000AA, 0x0000AA]
        ]);
        break;
      case 1: // J
        piece = new Piece([
          [0xC0C0C0, 0x000000, 0x000000],
          [0xC0C0C0, 0xC0C0C0, 0xC0C0C0],
          [0x000000, 0x000000, 0x000000]
        ]);
        break;
      case 2: // L
        piece = new Piece([
          [0x000000, 0x000000, 0xAA00AA],
          [0xAA00AA, 0xAA00AA, 0xAA00AA],
          [0x000000, 0x000000, 0x000000]
        ]);
        break;
      case 3: // Z
        piece = new Piece([
          [0x00AAAA, 0x00AAAA, 0x000000],
          [0x000000, 0x00AAAA, 0x00AAAA],
          [0x000000, 0x000000, 0x000000]
        ]);
        break;
      case 4: // S
        piece = new Piece([
          [0x000000, 0x00AA00, 0x00AA00],
          [0x00AA00, 0x00AA00, 0x000000],
          [0x000000, 0x000000, 0x000000]
        ]);
        break;
      case 5: // T
        piece = new Piece([
          [0x000000, 0xAA5500, 0x000000],
          [0xAA5500, 0xAA5500, 0xAA5500],
          [0x000000, 0x000000, 0x000000]
        ]);
        break;
      case 6: // I
        piece = new Piece([
          [0x000000, 0x000000, 0x000000, 0x000000],
          [0xAA0000, 0xAA0000, 0xAA0000, 0xAA0000],
          [0x000000, 0x000000, 0x000000, 0x000000],
          [0x000000, 0x000000, 0x000000, 0x000000]
        ]);
        break;
      default:
        throw new Error("Invalid piece index");
    }
    piece.row = 0;
    piece.column = Math.floor((10 - piece.dimension) / 2); // Centralize
    return piece;
  }

  clone(): Piece {
    const _cells: number[][] = Array.from({ length: this.dimension }, (_, r) =>
      Array.from({ length: this.dimension }, (_, c) => this.cells[r][c])
    );

    const piece = new Piece(_cells);
    piece.row = this.row;
    piece.column = this.column;
    return piece;
  }

  canMoveLeft(grid: Grid): boolean {
    for (let r = 0; r < this.cells.length; r++) {
      for (let c = 0; c < this.cells[r].length; c++) {
        const _r = this.row + r;
        const _c = this.column + c - 1;
        if (this.cells[r][c] !== 0) {
          if (!(_c >= 0 && grid.cells[_r][_c] === 0)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  canMoveRight(grid: Grid): boolean {
    for (let r = 0; r < this.cells.length; r++) {
      for (let c = 0; c < this.cells[r].length; c++) {
        const _r = this.row + r;
        const _c = this.column + c + 1;
        if (this.cells[r][c] !== 0) {
          if (!(_c < grid.cells[_r].length && grid.cells[_r][_c] === 0)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  canMoveDown(grid: Grid): boolean {
    for (let r = 0; r < this.cells.length; r++) {
      for (let c = 0; c < this.cells[r].length; c++) {
        const _r = this.row + r + 1;
        const _c = this.column + c;
        if (this.cells[r][c] !== 0 && _r >= 0) {
          if (!(_r < grid.rows && grid.cells[_r][_c] === 0)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  moveLeft(grid: Grid): boolean {
    if (!this.canMoveLeft(grid)) {
      return false;
    }
    this.column--;
    return true;
  }

  moveRight(grid: Grid): boolean {
    if (!this.canMoveRight(grid)) {
      return false;
    }
    this.column++;
    return true;
  }

  moveDown(grid: Grid): boolean {
    if (!this.canMoveDown(grid)) {
      return false;
    }
    this.row++;
    return true;
  }

  rotateCells(): void {
    const _cells: number[][] = Array.from({ length: this.dimension }, () => Array(this.dimension).fill(0));

    switch (this.dimension) { // Assumed square matrix
      case 2:
        _cells[0][0] = this.cells[1][0];
        _cells[0][1] = this.cells[0][0];
        _cells[1][0] = this.cells[1][1];
        _cells[1][1] = this.cells[0][1];
        break;
      case 3:
        _cells[0][0] = this.cells[2][0];
        _cells[0][1] = this.cells[1][0];
        _cells[0][2] = this.cells[0][0];
        _cells[1][0] = this.cells[2][1];
        _cells[1][1] = this.cells[1][1];
        _cells[1][2] = this.cells[0][1];
        _cells[2][0] = this.cells[2][2];
        _cells[2][1] = this.cells[1][2];
        _cells[2][2] = this.cells[0][2];
        break;
      case 4:
        _cells[0][0] = this.cells[3][0];
        _cells[0][1] = this.cells[2][0];
        _cells[0][2] = this.cells[1][0];
        _cells[0][3] = this.cells[0][0];
        _cells[1][3] = this.cells[0][1];
        _cells[2][3] = this.cells[0][2];
        _cells[3][3] = this.cells[0][3];
        _cells[3][2] = this.cells[1][3];
        _cells[3][1] = this.cells[2][3];
        _cells[3][0] = this.cells[3][3];
        _cells[2][0] = this.cells[3][2];
        _cells[1][0] = this.cells[3][1];

        _cells[1][1] = this.cells[2][1];
        _cells[1][2] = this.cells[1][1];
        _cells[2][2] = this.cells[1][2];
        _cells[2][1] = this.cells[2][2];
        break;
    }

    this.cells = _cells;
  }

  computeRotateOffset(grid: Grid): { rowOffset: number; columnOffset: number } | null {
    const _piece = this.clone();
    _piece.rotateCells();
    if (grid.valid(_piece)) {
      return { rowOffset: _piece.row - this.row, columnOffset: _piece.column - this.column };
    }

    // Kicking
    const initialRow = _piece.row;
    const initialCol = _piece.column;

    for (let i = 0; i < _piece.dimension - 1; i++) {
      _piece.column = initialCol + i;
      if (grid.valid(_piece)) {
        return { rowOffset: _piece.row - this.row, columnOffset: _piece.column - this.column };
      }

      _piece.column = initialCol - i;
      if (grid.valid(_piece)) {
        return { rowOffset: _piece.row - this.row, columnOffset: _piece.column - this.column };
      }
    }

    // Moving down
    _piece.row = initialRow + 1;
    if (grid.valid(_piece)) {
      return { rowOffset: _piece.row - this.row, columnOffset: _piece.column - this.column };
    }

    // Moving up
    _piece.row = initialRow - 1;
    if (grid.valid(_piece)) {
      return { rowOffset: _piece.row - this.row, columnOffset: _piece.column - this.column };
    }

    return null;
  }

  rotate(grid: Grid): boolean {
    const offset = this.computeRotateOffset(grid);
    if (offset) {
      this.row += offset.rowOffset;
      this.column += offset.columnOffset;
      this.rotateCells();
      return true;
    }
    return false;
  }
}

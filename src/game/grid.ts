import { Piece } from './piece';

export class Grid {
  rows: number;
  columns: number;
  cells: number[][];

  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.cells = Array.from({ length: rows }, () => Array(columns).fill(0));
  }

  // Grid manipulation
  cloneGrid(): Grid {
    const clonedGrid = new Grid(this.rows, this.columns);
    clonedGrid.cells = this.cells.map((row) => row.slice());
    return clonedGrid;
  }

  hasExceededTop(): boolean {
    return !this.isRowEmpty(0) || !this.isRowEmpty(1);
  }

  clearedLines(): number {
    let linesCleared = 0;

    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.isFullLines(row)) {
        linesCleared++;
        this.clearRow(row);
      } else if (linesCleared > 0) {
        this.moveRowDown(row, linesCleared);
      }
    }

    return linesCleared;
  }

  addPiece(piece: Piece): void {
    for (let row = 0; row < piece.cells.length; row++) {
      for (let column = 0; column < piece.cells[row].length; column++) {
        const _row = piece.row + row;
        const _column = piece.column + column;

        if (piece.cells[row][column] !== 0 && _row >= 0) {
          this.cells[_row][_column] = piece.cells[row][column];
        }
      }
    }
  }

  valid(piece: Piece): boolean {
    for (let row = 0; row < piece.cells.length; row++) {
      for (let col = 0; col < piece.cells[row].length; col++) {
        const _row = piece.row + row;
        const _col = piece.column + col;

        if (piece.cells[row][col] != 0) {
          if (_row < 0 || _row >= this.rows) return false;
          if (_col < 0 || _col >= this.columns) return false;
          if (this.cells[_row][_col] != 0) return false;
        }
      }
    }

    return true;
  }

  // Helper functions
  private isFullLines(row: number): boolean {
    return this.cells[row].every((cell) => cell !== 0);
  }

  private isRowEmpty(row: number): boolean {
    return this.cells[row].every((cell) => cell === 0);
  }

  private getColumnHeight(column: number): number {
    let row = 0;
    while (row < this.rows && this.cells[row][column] === 0) row++;
    return this.rows - row;
  }

  private clearRow(row: number): void {
    this.cells[row].fill(0);
  }

  private moveRowDown(row: number, distance: number): void {
    this.cells[row + distance] = [...this.cells[row]];
    this.cells[row].fill(0);
  }

  // Heuristic
  calculateAggregateHeight(): number {
    let totalHeight = 0;

    for (let column = 0; column < this.columns; column++) {
      totalHeight += this.getColumnHeight(column);
    }

    return totalHeight;
  }

  calculateCompleteLines(): number {
    let completeLines = 0;

    for (let row = 0; row < this.rows; row++) {
      if (this.isFullLines(row)) completeLines++;
    }

    return completeLines;
  }

  calculateBumpiness(): number {
    let totalBumpiness = 0;
    for (let column = 0; column < this.columns - 1; column++) {
      totalBumpiness += Math.abs(
        this.getColumnHeight(column) - this.getColumnHeight(column + 1)
      );
    }
    return totalBumpiness;
  }

  calculateHoles(): number {
    let totalHoles = 0;

    for (let column = 0; column < this.columns; column++) {
      let isBlock = false;
      for (let row = 0; row < this.rows; row++) {
        if (this.cells[row][column] !== 0) isBlock = true;
        else if (this.cells[row][column] === 0 && isBlock) totalHoles++;
      }
    }

    return totalHoles;
  }

}

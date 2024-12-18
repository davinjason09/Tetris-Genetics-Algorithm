import { Piece } from "./piece";

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
  public cloneGrid(): Grid {
    const clonedGrid = new Grid(this.rows, this.columns);
    clonedGrid.cells = this.cells.map((row) => row.slice());
    return clonedGrid;
  }

  public resetGrid(): void {
    this.cells = Array.from({ length: this.rows }, () =>
      Array(this.columns).fill(0),
    );
  }

  public hasExceededTop(): boolean {
    return !this.isRowEmpty(0) || !this.isRowEmpty(1);
  }

  public clearCompleteLines(): number {
    const newCells: number[][] = [];
    let linesCleared = 0;

    for (let row = 0; row < this.rows; row++) {
      if (this.isFullLines(row)) {
        linesCleared++;
      } else {
        newCells.push(this.cells[row]);
      }
    }

    while (newCells.length < this.rows) {
      newCells.unshift(Array(this.columns).fill(0));
    }

    this.cells = newCells;
    return linesCleared;
  }

  public addPiece(piece: Piece): void {
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

  public removePiece(piece: Piece): void {
    for (let row = 0; row < piece.cells.length; row++) {
      for (let column = 0; column < piece.cells[row].length; column++) {
        const _row = piece.row + row;
        const _column = piece.column + column;

        if (piece.cells[row][column] !== 0 && _row >= 0) {
          this.cells[_row][_column] = 0;
        }
      }
    }
  }

  public isValidMove(piece: Piece): boolean {
    for (let row = 0; row < piece.cells.length; row++) {
      for (let col = 0; col < piece.cells[row].length; col++) {
        const _row = piece.row + row;
        const _col = piece.column + col;

        if (piece.cells[row][col] != 0) {
          if (_row < 0 || _row >= this.rows || _col < 0 || _col >= this.columns) return false;
          if (this.cells[_row][_col] != 0) return false;
        }
      }
    }

    return true;
  }

  private isFullLines(row: number): boolean {
    return this.cells[row].every((cell) => cell !== 0);
  }

  private isRowEmpty(row: number): boolean {
    return this.cells[row].every((cell) => cell === 0);
  }

  private getColumnHeight(): number[] {
    return Array.from(
      { length: this.columns },
      (_, col) => this.rows - this.cells.findIndex((row) => row[col] !== 0),
    ).map((height) => (height - 1 === this.rows ? 0 : height));
  }

  public calculateAggregateHeight(): number {
    return this.getColumnHeight().reduce((acc, height) => acc + height, 0);
  }

  public calculateCompleteLines(): number {
    return this.cells.filter((row) => this.isFullLines(this.cells.indexOf(row))).length;
  }

  public calculateBumpiness(): number {
    const heights = this.getColumnHeight();
    return heights.reduce(
      (acc, height, index) =>
        acc + (index < heights.length - 1 ? Math.abs(height - heights[index + 1]) : 0),
      0,
    );
  }

  public calculateHoles(): number {
    let totalHoles = 0;
    const heights = this.getColumnHeight();

    for (let col = 0; col < this.columns; col++) {
      for (let row = this.rows - heights[col]; row < this.rows; row++) {
        if (this.cells[row][col] === 0) totalHoles++;
      }
    }

    return totalHoles;
  }
}
